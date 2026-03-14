import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) return null;

  return token ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
