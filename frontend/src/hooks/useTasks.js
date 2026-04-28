import { useState, useEffect, useCallback } from "react";
import { useApi } from "./useApi";

export function useTasks() {
  const api = useApi();
  const [tasks, setTasks]   = useState([]);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [taskList, statsData] = await Promise.all([api.getTasks(), api.getStats()]);
      setTasks(taskList || []);
      setStats(statsData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const createTask = async (data) => {
    const newTask = await api.createTask(data);
    setTasks(prev => [newTask, ...prev]);
    setStats(prev => prev ? {
      ...prev,
      total: prev.total + 1,
      todo: prev.todo + 1,
    } : prev);
    return newTask;
  };

  const updateTask = async (id, data) => {
    const updated = await api.updateTask(id, data);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    // Refresh stats after status change
    if (data.status) {
      const statsData = await api.getStats();
      setStats(statsData);
    }
    return updated;
  };

  const deleteTask = async (id) => {
    await api.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
    const statsData = await api.getStats();
    setStats(statsData);
  };

  return { tasks, stats, loading, error, createTask, updateTask, deleteTask, refresh: loadAll };
}
