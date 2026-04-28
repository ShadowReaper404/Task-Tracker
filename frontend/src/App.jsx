import { useAuthContext } from "@asgardeo/auth-react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import Layout from "./components/Layout";

function ProtectedWrapper() {
  const { state } = useAuthContext();
  if (state.isLoading) return null;
  if (!state.isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function App() {
  const { state } = useAuthContext();

  if (state.isLoading) {
    return (
      <div style={{
        height: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", flexDirection: "column", gap: "16px"
      }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
        <p style={{ color: "var(--text2)", fontSize: 14 }}>Checking authentication…</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        state.isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
      } />
      <Route element={<ProtectedWrapper />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks"     element={<TasksPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
