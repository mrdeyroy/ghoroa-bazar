import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function OrderSuccess() {
  useEffect(() => {
    localStorage.removeItem("billing_details");
  }, []);

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "20px"
      }}
    >
      <h1 style={{ color: "#006837" }}>🎉 Order Placed Successfully</h1>

      <p>Your order has been received.</p>
      <p>We will deliver it to your address shortly.</p>

      <Link to="/">
        <button
          style={{
            marginTop: "20px",
            background: "#ffa500",
            border: "none",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "6px",
            fontSize: "16px"
          }}
        >
          Continue Shopping
        </button>
      </Link>
    </div>
  );
}
