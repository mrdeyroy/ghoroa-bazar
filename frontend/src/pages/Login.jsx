import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    const endpoint = isAdmin
      ? "http://localhost:5000/api/admin/login"
      : "http://localhost:5000/api/users/login";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      alert("Invalid credentials");
      return;
    }

    if (isAdmin) {
      localStorage.setItem("adminLoggedIn", "true");
      navigate("/admin/dashboard");
    } else {
      const data = await res.json();
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userName", data.name);
      window.dispatchEvent(new Event("authChanged"));
      navigate("/");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <h1>Ghoroa Bazar</h1>
          <p>Fresh & trusted home products</p>
        </div>

        <h2>Login to your account</h2>

        <input
          placeholder="Email address"
          onChange={(e) => setEmail(e.target.value)}
        />

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", paddingRight: "40px" }}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              userSelect: "none",
              color: "#555"
            }}
          >
            {showPassword ? "👁️‍🗨️" : "👁️"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "10px 0" }}>
          <input
            type="checkbox"
            id="admin-login"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            style={{ width: "auto", margin: 0 }}
          />
          <label htmlFor="admin-login" style={{ fontSize: "14px", cursor: "pointer", color: "#555" }}>Login as Admin</label>
        </div>

        <button onClick={login}>Login</button>

        <div className="auth-footer">
          New here? <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
