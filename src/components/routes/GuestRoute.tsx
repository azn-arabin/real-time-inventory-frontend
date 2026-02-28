import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/context/AuthContext";

export function GuestRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
