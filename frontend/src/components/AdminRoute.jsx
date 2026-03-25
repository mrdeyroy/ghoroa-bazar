import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const isLoggedIn = localStorage.getItem("adminLoggedIn");
  const token = localStorage.getItem("adminToken");

  return (isLoggedIn === "true" && token) ? children : <Navigate to="/login" />;
}
