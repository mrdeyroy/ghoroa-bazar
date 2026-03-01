import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
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

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { name: "Orders", path: "/admin/orders", icon: "📦" },
    { name: "Products", path: "/admin/products", icon: "🍯" },
    { name: "Messages", path: "/admin/messages", icon: "✉️" }
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6f8" }}>
      {/* SIDEBAR */}
      <div
        style={{
          width: "260px",
          background: "#0f1e11", // Dark elegant theme
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          boxShadow: "4px 0 10px rgba(0,0,0,0.05)",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0
        }}
      >
        <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 style={{ margin: 0, fontSize: "22px", color: "#66ff99" }}>Ghoroa Bazar</h2>
          <span style={{ fontSize: "13px", color: "#aaa" }}>Admin Panel</span>
        </div>

        <nav style={{ flex: 1, padding: "20px 0" }}>
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 24px",
                  color: isActive ? "#66ff99" : "#e0e0e0",
                  textDecoration: "none",
                  fontSize: "16px",
                  fontWeight: isActive ? "600" : "400",
                  background: isActive ? "rgba(102, 255, 153, 0.1)" : "transparent",
                  borderLeft: isActive ? "4px solid #66ff99" : "4px solid transparent",
                  transition: "all 0.2s ease"
                }}
              >
                <span style={{ marginRight: "12px", fontSize: "18px", position: "relative" }}>
                  {item.icon}
                  {item.name === "Messages" && unreadCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-6px",
                        right: "-10px",
                        background: "red",
                        color: "#fff",
                        borderRadius: "50%",
                        fontSize: "9px",
                        padding: "2px 5px",
                        fontWeight: "bold"
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "24px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <button
            onClick={logout}
            style={{
              width: "100%",
              background: "rgba(255, 60, 60, 0.1)",
              border: "1px solid rgba(255, 60, 60, 0.3)",
              color: "#ff6666",
              padding: "10px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => (e.target.style.background = "rgba(255, 60, 60, 0.2)")}
            onMouseOut={(e) => (e.target.style.background = "rgba(255, 60, 60, 0.1)")}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div style={{ flex: 1, marginLeft: "260px", display: "flex", flexDirection: "column" }}>

        {/* TOP HEADER */}
        <div
          style={{
            height: "70px",
            background: "#fff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 30px",
            position: "sticky",
            top: 0,
            zIndex: 10
          }}
        >
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>
            {/* Can show current page title here dynamically if needed */}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "14px", fontWeight: "bold", color: "#333" }}>Admin User</div>
              <div style={{ fontSize: "12px", color: "#777" }}>Manager</div>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#006837",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: "bold"
              }}
            >
              A
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div style={{ padding: "30px", flex: 1 }}>
          {typeof children === "function"
            ? children({ refreshUnread: fetchUnreadCount })
            : children}
        </div>

      </div>
    </div>
  );
}
