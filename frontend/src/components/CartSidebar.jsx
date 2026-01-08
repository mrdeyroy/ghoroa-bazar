import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function CartSidebar({ open, onClose }) {
  const { cart, increaseQty, decreaseQty, removeItem } = useCart();
  const navigate = useNavigate();

  const [toast, setToast] = useState("");

const subtotal = cart.reduce(
  (sum, item) => sum + Number(item.price) * item.qty,
  0
);

  const hasStockIssue = cart.some(
    item => !item.stock || item.qty >= item.stock
  );

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  return (
    <>
      {/* BACKDROP */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 999
          }}
        />
      )}

      {/* SIDEBAR */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "380px",
          maxWidth: "100%",
          height: "100vh",
          background: "#fff",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease"
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <h3 style={{ margin: 0 }}>Shopping Cart</h3>
          <button
            onClick={onClose}
            style={{
              fontSize: 22,
              background: "none",
              border: "none",
              cursor: "pointer"
            }}
          >
            ×
          </button>
        </div>

        {/* CONTENT */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px"
          }}
        >
          {cart.length === 0 && (
            <p style={{ textAlign: "center", marginTop: 40 }}>
              Your cart is empty
            </p>
          )}

          {cart.map(item => {
            const maxReached = item.qty >= item.stock;

            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "18px"
                }}
              >
                {/* IMAGE */}
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: 70,
                    height: 70,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #eee"
                  }}
                />

                {/* DETAILS */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>
                    {item.name}
                  </div>

                  <div style={{ fontSize: 13, color: "#555" }}>
                    ₹{Number(item.price).toFixed(2)}

                  </div>

                  {/* QTY */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: 8,
                      gap: 8
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        background: "#f2f2f2",
                        borderRadius: 8
                      }}
                    >
                      <button
                        disabled={item.qty === 1}
                        onClick={() => decreaseQty(item.id)}
                        style={qtyBtn}
                      >
                        −
                      </button>

                      <span style={{ padding: "0 10px" }}>
                        {item.qty}
                      </span>

                      <button
                        disabled={maxReached}
                        onClick={() => {
                          if (!maxReached) increaseQty(item.id);
                        }}
                        style={qtyBtn}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        removeItem(item.id);
                        triggerToast(`❌ ${item.name} removed`);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#888",
                        fontSize: 13,
                        textDecoration: "underline",
                        cursor: "pointer"
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  {maxReached && (
                    <div style={{ fontSize: 12, color: "red" }}>
                      Stock limit reached
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid #eee"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
              fontSize: 15
            }}
          >
            <strong>Subtotal</strong>
            <strong>₹{subtotal.toFixed(2)}</strong>
          </div>

          {hasStockIssue && (
            <p style={{ color: "red", fontSize: 13 }}>
              Fix stock issues to proceed
            </p>
          )}

          <button
            disabled={hasStockIssue || cart.length === 0}
            onClick={() => {
              onClose();
              navigate("/checkout");
            }}
            style={{
              width: "100%",
              padding: "12px",
              background: "#006837",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: "bold",
              cursor: "pointer",
              marginBottom: 8
            }}
          >
            Checkout
          </button>

          <button
            onClick={() => {
              onClose();
              navigate("/Cart");
            }}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: 14
            }}
          >
            View Cart
          </button>

        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            background: "#c62828",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 8,
            zIndex: 2000
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}

const qtyBtn = {
  border: "none",
  background: "none",
  padding: "6px 10px",
  cursor: "pointer",
  fontSize: 16
};
