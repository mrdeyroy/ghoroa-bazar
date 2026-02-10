import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/contact/unread-count");
      const data = await res.json();
      setUnreadCount(data.count);
    } catch (err) {
      console.error("Failed to fetch unread count");
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

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

        <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
          <Link to="/admin/orders" style={{ color: "#fff" }}>
            Orders
          </Link>

          <Link to="/admin/products" style={{ color: "#fff" }}>
            Products
          </Link>

          <Link
            to="/admin/messages"
            style={{ color: "#fff", position: "relative" }}
          >
            Messages
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -8,
                  right: -14,
                  background: "red",
                  color: "#fff",
                  borderRadius: "50%",
                  fontSize: "11px",
                  padding: "2px 6px"
                }}
              >
                {unreadCount}
              </span>
            )}
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
      <div style={{ padding: "20px" }}>
        {typeof children === "function"
          ? children({ refreshUnread: fetchUnreadCount })
          : children}
      </div>
    </div>
  );
}
