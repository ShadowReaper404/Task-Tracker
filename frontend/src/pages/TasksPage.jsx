import { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { PriorityBadge } from "./Dashboard";
import styles from "./TasksPage.module.css";

const STATUS_LABELS = { todo: "To Do", in_progress: "In Progress", done: "Done" };
const STATUS_COLORS = { todo: "var(--text3)", in_progress: "var(--yellow)", done: "var(--green)" };

export default function TasksPage() {
  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks();
  const [showForm, setShowForm]   = useState(false);
  const [editTask, setEditTask]   = useState(null);
  const [filter, setFilter]       = useState("all");
  const [search, setSearch]       = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filtered = tasks.filter(t => {
    if (filter !== "all" && t.status !== filter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = async (data) => {
    await createTask(data);
    setShowForm(false);
  };

  const handleUpdate = async (data) => {
    await updateTask(editTask.id, data);
    setEditTask(null);
  };

  const handleStatusChange = (task, status) => {
    updateTask(task.id, { status });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await deleteTask(id);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header + " fade-up"}>
        <div>
          <h1 className={styles.title}>My Tasks</h1>
          <p className={styles.sub}>{tasks.length} tasks total</p>
        </div>
        <button className={styles.newBtn} onClick={() => setShowForm(true)}>
          + New Task
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters + " fade-up"} style={{ animationDelay: "0.05s" }}>
        <input
          className={styles.search}
          placeholder="Search tasks…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.filterBtns}>
          {["all", "todo", "in_progress", "done"].map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.active : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : STATUS_LABELS[f]}
            </button>
          ))}
        </div>
        <select
          className={styles.prioritySelect}
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
        >
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.error}>⚠ {error}</div>
      )}

      {/* Task list */}
      {loading ? (
        <div className={styles.loadingWrap}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <span style={{ fontSize: 36 }}>📭</span>
          <p>{search || filter !== "all" ? "No tasks match your filters." : "No tasks yet. Create your first one!"}</p>
          {!search && filter === "all" && (
            <button className={styles.newBtn} onClick={() => setShowForm(true)}>
              + Create Task
            </button>
          )}
        </div>
      ) : (
        <div className={styles.taskGrid + " fade-in"}>
          {filtered.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => setEditTask(task)}
              onDelete={() => handleDelete(task.id)}
              onStatusChange={(s) => handleStatusChange(task, s)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {(showForm || editTask) && (
        <TaskModal
          task={editTask}
          onSubmit={editTask ? handleUpdate : handleCreate}
          onClose={() => { setShowForm(false); setEditTask(null); }}
        />
      )}
    </div>
  );
}

// ── Task Card ────────────────────────────────────
function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const isOverdue = task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date();

  return (
    <div className={`${styles.card} ${task.status === "done" ? styles.cardDone : ""}`}>
      <div className={styles.cardTop}>
        <div className={styles.cardMeta}>
          <PriorityBadge priority={task.priority} />
          {isOverdue && <span className={styles.overdueBadge}>Overdue</span>}
        </div>
        <div className={styles.cardActions}>
          <button className={styles.iconBtn} onClick={onEdit} title="Edit">✏️</button>
          <button className={styles.iconBtn} onClick={onDelete} title="Delete">🗑️</button>
        </div>
      </div>

      <h3 className={`${styles.cardTitle} ${task.status === "done" ? styles.strikethrough : ""}`}>
        {task.title}
      </h3>

      {task.description && (
        <p className={styles.cardDesc}>{task.description}</p>
      )}

      <div className={styles.cardFooter}>
        {task.dueDate && (
          <span className={styles.dueDate} style={{ color: isOverdue ? "var(--red)" : "var(--text3)" }}>
            📅 {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}

        <select
          className={styles.statusSelect}
          value={task.status}
          onChange={e => onStatusChange(e.target.value)}
          style={{ color: STATUS_COLORS[task.status] }}
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
    </div>
  );
}

// ── Task Modal ───────────────────────────────────
function TaskModal({ task, onSubmit, onClose }) {
  const [form, setForm] = useState({
    title:       task?.title       || "",
    description: task?.description || "",
    priority:    task?.priority    || "medium",
    dueDate:     task?.dueDate     || "",
    status:      task?.status      || "todo",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setErr("Title is required."); return; }
    setSaving(true);
    setErr("");
    try {
      await onSubmit(form);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal + " fade-up"}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{task ? "Edit Task" : "New Task"}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          <Field label="Title *">
            <input
              className={styles.input}
              placeholder="What needs to be done?"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              autoFocus
            />
          </Field>

          <Field label="Description">
            <textarea
              className={styles.textarea}
              placeholder="Add details…"
              rows={3}
              value={form.description}
              onChange={e => set("description", e.target.value)}
            />
          </Field>

          <div className={styles.row2}>
            <Field label="Priority">
              <select className={styles.select} value={form.priority} onChange={e => set("priority", e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </Field>

            <Field label="Due Date">
              <input
                className={styles.input}
                type="date"
                value={form.dueDate}
                onChange={e => set("dueDate", e.target.value)}
              />
            </Field>
          </div>

          {task && (
            <Field label="Status">
              <select className={styles.select} value={form.status} onChange={e => set("status", e.target.value)}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </Field>
          )}

          {err && <p className={styles.fieldError}>{err}</p>}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSubmit} disabled={saving}>
            {saving ? <><div className="spinner" /> Saving…</> : (task ? "Save Changes" : "Create Task")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  );
}
