import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthContext } from "@asgardeo/auth-react";
import { useState, useEffect } from "react";
import styles from "./Layout.module.css";

export default function Layout() {
  const { signOut, getBasicUserInfo } = useAuthContext();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    getBasicUserInfo().then(setUser).catch(() => {});
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="var(--accent)"/>
            <path d="M8 14l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>TaskFlow</span>
        </div>

        <nav className={styles.nav}>
          <NavLink to="/dashboard" className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`}>
            <IconDashboard />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`}>
            <IconTasks />
            <span>Tasks</span>
          </NavLink>
        </nav>

        <div className={styles.userSection}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.displayName || user?.email || "User"}</span>
            <span className={styles.userEmail}>{user?.email || ""}</span>
          </div>
          <button
            className={styles.signOutBtn}
            onClick={handleSignOut}
            disabled={signingOut}
            title="Sign out"
          >
            {signingOut ? <div className="spinner" /> : <IconSignOut />}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconTasks = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <polyline points="3 6 4 7 6 5"/><polyline points="3 12 4 13 6 11"/><polyline points="3 18 4 19 6 17"/>
  </svg>
);
const IconSignOut = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
