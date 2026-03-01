import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/orders/user/${userId}`)
      .then(res => res.json())
      .then(data => setOrders(data));
  }, [userId]);

  const getStatusColor = (status) => {
    if (status === "Delivered") return "#006837";
    if (status === "Cancelled") return "#d32f2f";
    if (status === "Shipped") return "#2196f3";
    return "#ffa500";
  };

  const trackingSteps = ["Placed", "Packed", "Shipped", "Delivered"];

  const renderTimeline = (order) => {
    const currentStatusIndex = trackingSteps.indexOf(order.orderStatus);
    const isCancelled = order.orderStatus === "Cancelled";

    if (isCancelled) {
      return (
        <div style={{ marginTop: "16px", padding: "12px", background: "#ffebee", color: "#d32f2f", borderRadius: "8px", fontWeight: "600", textAlign: "center" }}>
          Order Cancelled
        </div>
      );
    }

    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "24px", marginBottom: "20px", position: "relative" }}>
        {/* Background Line */}
        <div style={{ position: "absolute", top: "14px", left: "10%", right: "10%", height: "4px", background: "#eee", zIndex: 0 }}></div>
        {/* Active Line */}
        <div style={{ position: "absolute", top: "14px", left: "10%", width: `${(Math.max(0, currentStatusIndex) / (trackingSteps.length - 1)) * 80}%`, height: "4px", background: "#006837", zIndex: 1, transition: "width 0.4s ease" }}></div>

        {trackingSteps.map((step, index) => {
          const isCompleted = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;

          // Find date from orderHistory if available
          const historyItem = order.orderHistory?.find(h => h.status === step);
          const dateStr = historyItem ? new Date(historyItem.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "";

          return (
            <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, width: "60px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: isCompleted ? "#006837" : "#fff",
                border: `3px solid ${isCompleted ? "#006837" : "#ddd"}`,
                color: isCompleted ? "#fff" : "#aaa",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", fontWeight: "bold", marginBottom: "8px",
                boxShadow: isCurrent ? "0 0 0 4px rgba(0, 104, 55, 0.2)" : "none",
                transition: "all 0.3s ease"
              }}>
                {isCompleted ? "✓" : index + 1}
              </div>
              <div style={{ fontSize: "12px", fontWeight: isCurrent ? "700" : "500", color: isCompleted ? "#006837" : "#888", textAlign: "center" }}>{step}</div>
              {dateStr && <div style={{ fontSize: "10px", color: "#999", marginTop: "2px" }}>{dateStr}</div>}
            </div>
          );
        })}
      </div>
    );
  };

  if (!userId) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>Please login to view your orders</h3>
        <Link to="/login">Go to Login</Link>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "900px",
        margin: "auto",
        minHeight: "80vh"
      }}
    >
      <h2 style={{ color: "#006837", marginBottom: "20px" }}>
        My Orders
      </h2>

      {orders.length === 0 && (
        <p style={{ color: "#555" }}>
          You haven’t placed any orders yet.
        </p>
      )}

      {orders.map(order => (
        <div
          key={order._id}
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "18px",
            marginBottom: "18px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px"
            }}
          >
            <strong style={{ fontSize: "16px" }}>
              Total: ₹{order.totalAmount}
            </strong>

            <span
              style={{
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "13px",
                color: "#fff",
                background: getStatusColor(order.orderStatus)
              }}
            >
              {order.orderStatus}
            </span>
          </div>

          {/* TIMELINE */}
          {renderTimeline(order)}

          {/* META INFO */}
          <div style={{ background: "#f8f9fa", padding: "12px", borderRadius: "8px", marginTop: "20px" }}>
            <p style={{ fontSize: "14px", color: "#555", margin: "0 0 6px 0" }}>
              <strong>Payment Method:</strong> {order.paymentMethod}
            </p>
            <p style={{ fontSize: "13px", color: "#777", margin: 0 }}>
              <strong>Order Date:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* ITEMS */}
          <h4 style={{ marginTop: "20px", marginBottom: "12px", fontSize: "15px", color: "#333" }}>Items Purchased</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", background: "#fcfcfc", border: "1px solid #efefef", padding: "10px", borderRadius: "8px" }}>
                {item.image ? (
                  <img src={item.image} alt={item.name} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px" }} />
                ) : (
                  <div style={{ width: "50px", height: "50px", background: "#eee", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#aaa" }}>Img</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", fontSize: "14px", color: "#222" }}>{item.name}</div>
                  <div style={{ fontSize: "13px", color: "#666", marginTop: "2px" }}>
                    {item.weight && <span style={{ marginRight: "12px" }}>Pack: {item.weight}</span>}
                    <span>Qty: {item.qty}</span>
                  </div>
                </div>
                <div style={{ fontWeight: "700", fontSize: "14px", color: "#006837" }}>
                  ₹{(item.price * item.qty).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* DELIVERY ADDRESS */}
          {order.customerDetails && (
            <>
              <h4 style={{ marginTop: "12px" }}>
                Delivery Address
              </h4>
              <p style={{ fontSize: "14px", color: "#555" }}>
                {order.customerDetails.name}<br />
                {order.customerDetails.phone}<br />
                {order.customerDetails.address},<br />
                {order.customerDetails.city} –{" "}
                {order.customerDetails.pincode}
              </p>
            </>
          )}

          {/* ACTIONS */}
          <div style={{ marginTop: "12px" }}>
            <Link
              to={`/invoice/${order._id}`}
              target="_blank"
              style={{
                background: "#ffa500",
                color: "#000",
                padding: "6px 14px",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "14px"
              }}
            >
              View Invoice
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
