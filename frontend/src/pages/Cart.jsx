import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Cart() {
  const { cart, increaseQty, decreaseQty, removeItem } = useCart();
  const navigate = useNavigate();

  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState("");

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const hasStockIssue = cart.some(
    item => !item.stock || item.qty >= item.stock
  );

  const triggerToast = (text) => {
    setToastText(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  if (cart.length === 0) {
    return <h2 style={{ padding: 30 }}>Your cart is empty</h2>;
  }

  return (
    <>
      {/* TOAST */}
      {showToast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            background: "#c62828",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: 8,
            zIndex: 9999
          }}
        >
          {toastText}
        </div>
      )}

      {/* CART LAYOUT */}
      <div
        style={{
          maxWidth: 1100,
          margin: "30px auto",
          display: "grid",
          gridTemplateColumns: "2.5fr 1fr",
          gap: 30,
          padding: "0 20px"
        }}
      >
        {/* LEFT: CART ITEMS */}
        <div>
          {/* HEADER */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              fontWeight: 600,
              paddingBottom: 10,
              borderBottom: "2px solid #eee"
            }}
          >
            <div>Product</div>
            <div>Price</div>
            <div>Quantity</div>
            <div>Total</div>
          </div>

          {/* ITEMS */}
          {cart.map(item => {
            const maxReached = item.qty >= item.stock;

            return (
              <div
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  alignItems: "center",
                  padding: "20px 0",
                  borderBottom: "1px solid #eee"
                }}
              >
                {/* PRODUCT */}
                <div style={{ display: "flex", gap: 14 }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 6,
                      border: "1px solid #ddd"
                    }}
                  />

                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {item.name}
                    </div>
                    <button
                      onClick={() => {
                        removeItem(item.id);
                        triggerToast(`❌ ${item.name} removed`);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "#888",
                        fontSize: 13,
                        cursor: "pointer"
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* PRICE */}
                <div>₹{item.price.toFixed(2)}</div>

                {/* QTY */}
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      border: "1px solid #ffa500",
                      borderRadius: 6,
                      overflow: "hidden"
                    }}
                  >
                    <button
                      onClick={() => decreaseQty(item.id)}
                      disabled={item.qty === 1}
                      style={qtyBtn}
                    >
                      −
                    </button>

                    <span style={{ padding: "6px 12px" }}>
                      {item.qty}
                    </span>

                    <button
                      onClick={() => {
                        if (!maxReached) increaseQty(item.id);
                      }}
                      disabled={maxReached}
                      style={qtyBtn}
                    >
                      +
                    </button>
                  </div>

                  {maxReached && (
                    <div style={{ color: "red", fontSize: 12 }}>
                      Stock limit reached
                    </div>
                  )}
                </div>

                {/* TOTAL */}
                <div>
                  ₹{(item.price * item.qty).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: SUMMARY */}
        <div
          style={{
            border: "1px solid #eee",
            padding: 20,
            borderRadius: 8,
            height: "fit-content"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
              fontSize: 16,
              fontWeight: 600
            }}
          >
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          <p style={{ fontSize: 13, color: "#777" }}>
            Taxes and shipping calculated at checkout
          </p>

          {hasStockIssue && (
            <p style={{ color: "red", fontSize: 13 }}>
              Fix stock issues to proceed
            </p>
          )}

          <button
            disabled={hasStockIssue}
            onClick={() => navigate("/checkout")}
            style={{
              width: "100%",
              marginTop: 15,
              background: "#ffa500",
              color: "#000",
              padding: "14px",
              border: "none",
              borderRadius: 6,
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>

      {/* RECENTLY VIEWED */}
      <div style={{ maxWidth: 1100, margin: "50px auto", padding: "0 20px" }}>
        <h2 style={{ marginBottom: 20 }}>Recently Viewed Products</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 20
          }}
        >
          {cart.slice(0, 3).map(item => (
            <div
              key={item.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 8,
                padding: 12,
                textAlign: "center"
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                style={{
                  width: "100%",
                  height: 140,
                  objectFit: "cover",
                  borderRadius: 6
                }}
              />

              <div style={{ fontSize: 14, marginTop: 8 }}>
                {item.name}
              </div>

              <div style={{ fontWeight: 600 }}>
                ₹{item.price}
              </div>

              <button
                onClick={() => increaseQty(item.id)}
                style={{
                  marginTop: 8,
                  padding: "6px 10px",
                  border: "1px solid #ffa500",
                  background: "#fff",
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                Quick Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const qtyBtn = {
  border: "none",
  background: "#fff",
  padding: "6px 10px",
  cursor: "pointer"
};
