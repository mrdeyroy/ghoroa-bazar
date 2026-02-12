import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    const res = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      alert("Invalid credentials");
      return;
    }

    const data = await res.json();
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("userName", data.name);
    window.dispatchEvent(new Event("authChanged"));
    navigate("/");
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

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>Login</button>

        <div className="auth-footer">
          New here? <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
