import { Link, useNavigate } from "react-router-dom";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/admin/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f8" }}>
      {/* Top Bar */}
      <div
        style={{
          background: "#006837",
          color: "#fefffd",
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <strong>Ghoroa Bazar – Admin</strong>

        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <Link to="/admin/orders" style={{ color: "#fefffd", textDecoration: "none" }}>
            Orders
          </Link>
          <Link to="/admin/products" style={{ color: "#fefffd", textDecoration: "none" }}>
            Products
          </Link>
          <button
            onClick={logout}
            style={{
              background: "#ffa500",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}
