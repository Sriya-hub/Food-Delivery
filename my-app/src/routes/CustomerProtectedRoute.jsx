import { Navigate, useLocation } from "react-router-dom";

export default function CustomerProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");
  const location = useLocation();

  console.log("🔒 Protected check → token:", token, "role:", role);

  if (!token || role !== "customer") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}