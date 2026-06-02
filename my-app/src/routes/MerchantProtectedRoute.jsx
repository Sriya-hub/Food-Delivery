import { Navigate } from "react-router-dom";

export default function MerchantProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "merchant") {
    return <Navigate to="/login" replace />;
  }

  return children;
}