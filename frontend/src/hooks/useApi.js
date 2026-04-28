import { useAuthContext } from "@asgardeo/auth-react";
import { useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

export function useApi() {
  const { getAccessToken } = useAuthContext();

  const request = useCallback(async (method, path, body = null) => {
    const token = await getAccessToken();
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, options);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || "API error");
    }
    if (res.status === 200 && res.headers.get("content-length") === "0") return null;
    return res.json().catch(() => null);
  }, [getAccessToken]);

  return {
    getTasks:    ()         => request("GET",    "/tasks"),
    getStats:    ()         => request("GET",    "/tasks/stats"),
    createTask:  (data)     => request("POST",   "/tasks", data),
    updateTask:  (id, data) => request("PUT",    `/tasks/${id}`, data),
    deleteTask:  (id)       => request("DELETE", `/tasks/${id}`),
  };
}
