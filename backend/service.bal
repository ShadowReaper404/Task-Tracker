import ballerina/http;
import ballerina/uuid;
import ballerina/time;
import ballerina/log;
import ballerina/lang.array;
import ballerina/lang.'string as strings;

// ── Types ─────────────────────────────────────────

type Task record {|
    string id;
    string userId;
    string title;
    string description;
    string status;
    string priority;
    string dueDate;
    string createdAt;
    string updatedAt;
|};

type CreateTaskRequest record {|
    string title;
    string description;
    string priority;
    string dueDate;
|};

type UpdateTaskRequest record {|
    string? title;
    string? description;
    string? status;
    string? priority;
    string? dueDate;
|};

// ── In-memory store ────────────────────────────────

map<Task> taskStore = {};

// ── HTTP Service ───────────────────────────────────

listener http:Listener httpListener = new (8090);

@http:ServiceConfig {
    cors: {
        allowOrigins: [
            "http://localhost:5173",
            "http://localhost:4173",
            "https://*.choreoapps.dev"
        ],
        allowCredentials: true,
        allowHeaders: ["Authorization", "Content-Type", "x-jwt-assertion"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
}
service /api/v1 on httpListener {

    resource function get health() returns json {
        return {status: "healthy", 'service: "task-tracker-api", 'version: "1.0.0"};
    }

    resource function get tasks(http:Request req)
            returns Task[]|http:Unauthorized {
        string|error userId = extractUserId(req);
        if userId is error {
            return http:UNAUTHORIZED;
        }
        Task[] userTasks = taskStore.toArray().filter(t => t.userId == userId);
        return userTasks;
    }

    resource function get tasks/stats(http:Request req)
            returns json|http:Unauthorized {
        string|error userId = extractUserId(req);
        if userId is error {
            return http:UNAUTHORIZED;
        }
        Task[] ut = taskStore.toArray().filter(t => t.userId == userId);
        int total      = ut.length();
        int todo       = ut.filter(t => t.status == "todo").length();
        int inProgress = ut.filter(t => t.status == "in_progress").length();
        int done       = ut.filter(t => t.status == "done").length();
        int high       = ut.filter(t => t.priority == "high").length();
        return {
            total:          total,
            todo:           todo,
            inProgress:     inProgress,
            done:           done,
            highPriority:   high,
            completionRate: total == 0 ? 0 : (done * 100 / total)
        };
    }

    resource function post tasks(http:Request req, @http:Payload CreateTaskRequest body)
            returns Task|http:Unauthorized|http:BadRequest {
        string|error userId = extractUserId(req);
        if userId is error {
            return http:UNAUTHORIZED;
        }
        if body.title.trim().length() == 0 {
            return <http:BadRequest>{body: {message: "Title is required"}};
        }
        string taskId = uuid:createType1AsString();
        string now    = time:utcToString(time:utcNow());
        Task newTask = {
            id:          taskId,
            userId:      userId,
            title:       body.title,
            description: body.description,
            status:      "todo",
            priority:    body.priority,
            dueDate:     body.dueDate,
            createdAt:   now,
            updatedAt:   now
        };
        taskStore[taskId] = newTask;
        log:printInfo("Task created: " + taskId);
        return newTask;
    }

    resource function put tasks/[string taskId](http:Request req, @http:Payload UpdateTaskRequest body)
            returns Task|http:Unauthorized|http:NotFound|http:Forbidden {
        string|error userId = extractUserId(req);
        if userId is error { return http:UNAUTHORIZED; }
        Task? existing = taskStore[taskId];
        if existing is () { return http:NOT_FOUND; }
        if existing.userId != userId { return http:FORBIDDEN; }
        string now = time:utcToString(time:utcNow());
        Task updated = {
            id:          existing.id,
            userId:      existing.userId,
            title:       body.title       ?: existing.title,
            description: body.description ?: existing.description,
            status:      body.status      ?: existing.status,
            priority:    body.priority    ?: existing.priority,
            dueDate:     body.dueDate     ?: existing.dueDate,
            createdAt:   existing.createdAt,
            updatedAt:   now
        };
        taskStore[taskId] = updated;
        return updated;
    }

    resource function delete tasks/[string taskId](http:Request req)
            returns http:Ok|http:Unauthorized|http:NotFound|http:Forbidden {
        string|error userId = extractUserId(req);
        if userId is error { return http:UNAUTHORIZED; }
        Task? existing = taskStore[taskId];
        if existing is () { return http:NOT_FOUND; }
        if existing.userId != userId { return http:FORBIDDEN; }
        _ = taskStore.remove(taskId);
        log:printInfo("Task deleted: " + taskId);
        return http:OK;
    }
}

// ── JWT helpers ────────────────────────────────────

function extractUserId(http:Request req) returns string|error {
    // Choreo validates JWT at gateway and forwards sub via this header
    string|http:HeaderNotFoundError jwtH = req.getHeader("x-jwt-assertion");
    if jwtH is string {
        return extractSubFromJwt(jwtH);
    }
    // Local dev fallback: read Authorization: Bearer <token>
    string|http:HeaderNotFoundError authH = req.getHeader("Authorization");
    if authH is http:HeaderNotFoundError {
        return error("No auth header found");
    }
    string token = authH.startsWith("Bearer ") ? authH.substring(7) : authH;
    return extractSubFromJwt(token);
}

function extractSubFromJwt(string token) returns string|error {
    // JWT = base64url(header) . base64url(payload) . signature
    string[] parts = re`\.`.split(token);
    if parts.length() < 2 {
        return error("Invalid JWT format");
    }

    // Decode the payload (middle part) — pad to a valid base64 length first
    string padded = parts[1] + string:'join("", ...from int _ in 0 ..< (4 - parts[1].length() % 4) % 4 select "=");
    // Replace URL-safe chars with standard base64 chars
    string b64 = re`-`.replaceAll(re`_`.replaceAll(padded, "/"), "+");
    byte[]|error decoded = array:fromBase64(b64);
    if decoded is error {
        return error("Failed to base64url-decode JWT payload: " + decoded.message());
    }

    string|error jsonStr = strings:fromBytes(decoded);
    if jsonStr is error {
        return error("Failed to read JWT payload as string");
    }

    json|error claims = jsonStr.fromJsonString();
    if claims is error {
        return error("Failed to parse JWT payload as JSON");
    }

    json|error sub = claims.sub;
    if sub is error || sub is () {
        return error("No 'sub' claim in JWT");
    }

    return sub.toString();
}
