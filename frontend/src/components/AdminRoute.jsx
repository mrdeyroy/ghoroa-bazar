import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const isLoggedIn = localStorage.getItem("adminLoggedIn");

  return isLoggedIn ? children : <Navigate to="/admin/login" />;
}
