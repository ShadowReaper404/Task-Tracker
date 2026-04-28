import { useEffect, useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { Link } from "react-router-dom";
import { useTasks } from "../hooks/useTasks";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { getBasicUserInfo } = useAuthContext();
  const { tasks, stats, loading } = useTasks();
  const [user, setUser] = useState(null);

  useEffect(() => {
    getBasicUserInfo().then(setUser).catch(() => {});
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const recentTasks = tasks.slice(0, 5);
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate || t.status === "done") return false;
    return new Date(t.dueDate) < new Date();
  });

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header + " fade-up"}>
        <div>
          <h1 className={styles.greeting}>
            {greeting()}, {user?.displayName?.split(" ")[0] || "there"} 👋
          </h1>
          <p className={styles.subtext}>Here's what's happening with your tasks today.</p>
        </div>
        <Link to="/tasks" className={styles.newTaskBtn}>
          + New Task
        </Link>
      </div>

      {/* Stat cards */}
      <div className={styles.statsGrid + " fade-up"} style={{ animationDelay: "0.05s" }}>
        <StatCard label="Total Tasks"    value={stats?.total      ?? "—"} color="accent"  icon="📋" />
        <StatCard label="To Do"          value={stats?.todo       ?? "—"} color="blue"    icon="⏳" />
        <StatCard label="In Progress"    value={stats?.inProgress ?? "—"} color="yellow"  icon="🔄" />
        <StatCard label="Completed"      value={stats?.done       ?? "—"} color="green"   icon="✅" />
      </div>

      {/* Completion bar */}
      {stats && stats.total > 0 && (
        <div className={styles.progressCard + " fade-up"} style={{ animationDelay: "0.1s" }}>
          <div className={styles.progressHeader}>
            <span>Overall completion</span>
            <span className={styles.progressPct}>{stats.completionRate}%</span>
          </div>
          <div className={styles.progressBg}>
            <div
              className={styles.progressFill}
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom grid */}
      <div className={styles.bottomGrid}>
        {/* Recent tasks */}
        <div className={styles.card + " fade-up"} style={{ animationDelay: "0.15s" }}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Recent Tasks</h2>
            <Link to="/tasks" className={styles.seeAll}>See all →</Link>
          </div>
          {loading ? (
            <div style={{ padding: "20px 0", display: "flex", justifyContent: "center" }}>
              <div className="spinner" />
            </div>
          ) : recentTasks.length === 0 ? (
            <EmptyState text="No tasks yet. Create your first one!" />
          ) : (
            <div className={styles.taskList}>
              {recentTasks.map(t => <TaskRow key={t.id} task={t} />)}
            </div>
          )}
        </div>

        {/* Overdue */}
        <div className={styles.card + " fade-up"} style={{ animationDelay: "0.2s" }}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>⚠️ Overdue</h2>
            <span className={styles.overdueCount}>{overdueTasks.length}</span>
          </div>
          {overdueTasks.length === 0 ? (
            <EmptyState text="You're all caught up! No overdue tasks." />
          ) : (
            <div className={styles.taskList}>
              {overdueTasks.map(t => <TaskRow key={t.id} task={t} overdue />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  const colorMap = {
    accent: { bg: "var(--accentbg)", border: "var(--accent)", text: "var(--accent2)" },
    blue:   { bg: "var(--bluebg)",   border: "var(--blue)",   text: "var(--blue)" },
    yellow: { bg: "var(--yellowbg)", border: "var(--yellow)", text: "var(--yellow)" },
    green:  { bg: "var(--greenbg)",  border: "var(--green)",  text: "var(--green)" },
  };
  const c = colorMap[color];
  return (
    <div className={styles.statCard} style={{ background: c.bg, borderColor: c.border }}>
      <span className={styles.statIcon}>{icon}</span>
      <span className={styles.statValue} style={{ color: c.text }}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function TaskRow({ task, overdue }) {
  const statusColors = {
    todo:        "var(--text3)",
    in_progress: "var(--yellow)",
    done:        "var(--green)",
  };
  return (
    <div className={styles.taskRow}>
      <span className={styles.taskDot} style={{ background: statusColors[task.status] || "var(--text3)" }} />
      <div className={styles.taskRowInfo}>
        <span className={styles.taskRowTitle} style={{ textDecoration: task.status === "done" ? "line-through" : "none" }}>
          {task.title}
        </span>
        {task.dueDate && (
          <span className={styles.taskRowDue} style={{ color: overdue ? "var(--red)" : "var(--text3)" }}>
            {overdue ? "⚠ " : ""}Due {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
      <PriorityBadge priority={task.priority} />
    </div>
  );
}

export function PriorityBadge({ priority }) {
  const map = {
    high:   { label: "High",   bg: "var(--redbg)",    color: "var(--red)" },
    medium: { label: "Medium", bg: "var(--yellowbg)", color: "var(--yellow)" },
    low:    { label: "Low",    bg: "var(--greenbg)",  color: "var(--green)" },
  };
  const p = map[priority] || map.low;
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: "2px 8px",
      borderRadius: 999, background: p.bg, color: p.color
    }}>
      {p.label}
    </span>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text3)", fontSize: 14 }}>
      {text}
    </div>
  );
}
