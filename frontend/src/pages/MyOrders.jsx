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
    return "#ffa500";
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

          {/* META INFO */}
          <p style={{ fontSize: "14px", color: "#555" }}>
            Payment Method: {order.paymentMethod}
          </p>

          <p style={{ fontSize: "13px", color: "#777" }}>
            Order Date:{" "}
            {new Date(order.createdAt).toLocaleDateString()}
          </p>

          {/* ITEMS */}
          <h4 style={{ marginTop: "12px" }}>Items</h4>
          <ul style={{ paddingLeft: "18px" }}>
            {order.items.map((item, i) => (
              <li key={i}>
                {item.name} × {item.qty}
              </li>
            ))}
          </ul>

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
