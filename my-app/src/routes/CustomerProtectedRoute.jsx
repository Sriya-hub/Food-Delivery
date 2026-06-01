import { Navigate, useLocation } from "react-router-dom";

export default function CustomerProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");
  const location = useLocation();

  if (!token || role !== "customer") {
    // Preserve the intended destination so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}