import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ color = "#1f7a3b", margin = "20px" }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "none",
        border: "none",
        color: color,
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer",
        marginBottom: margin,
        padding: "8px 0",
        transition: "transform 0.2s ease"
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(-5px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
    >
      <ArrowLeft size={20} />
      Go Back
    </button>
  );
}
