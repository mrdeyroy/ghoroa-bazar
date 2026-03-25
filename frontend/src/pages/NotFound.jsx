import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        padding: "40px 20px",
        textAlign: "center"
      }}
    >
      <div style={{ maxWidth: 520 }}>
        {/* 404 IMAGE TEXT */}
        <div
          style={{
            fontSize: "160px",
            fontWeight: 900,
            lineHeight: 1,
            backgroundImage: "url(/assets/fruits.jpg)", // 👈 add image
            backgroundSize: "cover",
            backgroundPosition: "center",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: "20px"
          }}
        >
          404
        </div>

        {/* TEXT */}
        <h2 style={{ marginBottom: "8px", fontWeight: 700 }}>
          Oops! <span style={{ color: "#1f7a3b" }}>Page not Found</span>
        </h2>

        <p
          style={{
            fontSize: "14px",
            color: "#666",
            marginBottom: "22px",
            lineHeight: 1.6
          }}
        >
          The page you are looking for cannot be found.
          Take a break before trying again.
        </p>

        {/* BUTTON */}
        <Link
          to="/"
          style={{
            display: "inline-block",
            background: "#1f7a3b",
            color: "#fff",
            padding: "12px 26px",
            borderRadius: "22px",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "14px"
          }}
        >
          Go To Home Page
        </Link>
      </div>
    </div>
  );
}
