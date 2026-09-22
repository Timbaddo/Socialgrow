import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { StateMessage } from "./StateMessage";

export function ProtectedRoute() {
  const { session, loading } = useAuth();
  if (loading) return <StateMessage emoji="⏳" title="Loading..." />;
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const { appUser, loading } = useAuth();
  if (loading) return <StateMessage emoji="⏳" title="Loading..." />;
  if (!appUser || appUser.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}
