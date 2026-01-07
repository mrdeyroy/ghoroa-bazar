import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => {
    fetch("http://localhost:5000/api/orders")
      .then(res => res.json())
      .then(data => setOrders(data));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, newStatus) => {
    await fetch(`http://localhost:5000/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus: newStatus })
    });

    fetchOrders();
  };

  const statusColor = (status) => {
    if (status === "Delivered") return "green";
    if (status === "Cancelled") return "red";
    if (status === "Packed") return "#ffa500";
    return "#006837";
  };

  return (
    <AdminLayout>
      <h2 style={{ marginBottom: "20px" }}>Orders</h2>

      {orders.length === 0 && <p>No orders found</p>}

      {orders.map(order => (
        <div
          key={order._id}
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "18px",
            marginBottom: "18px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <strong>₹{order.totalAmount}</strong>
              <p style={{ fontSize: "12px", color: "#555" }}>
                Order ID: {order._id}
              </p>
              <p style={{ fontSize: "12px", color: "#555" }}>
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <span
              style={{
                color: statusColor(order.orderStatus),
                fontWeight: "bold",
                fontSize: "14px"
              }}
            >
              {order.orderStatus}
            </span>
          </div>

          {/* PAYMENT + ACTIONS */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "10px"
            }}
          >
            <p style={{ fontSize: "14px" }}>
              Payment: <strong>{order.paymentMethod}</strong>
            </p>

            <a
              href={`/invoice/${order._id}`}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "#ffa500",
                padding: "6px 12px",
                borderRadius: "6px",
                textDecoration: "none",
                color: "#000",
                fontWeight: "bold",
                fontSize: "14px"
              }}
            >
              View Invoice
            </a>
          </div>

          <hr style={{ margin: "14px 0" }} />

          {/* STATUS UPDATE */}
          <label style={{ fontSize: "14px" }}>
            Update Status:
            <select
              value={order.orderStatus}
              onChange={e => updateStatus(order._id, e.target.value)}
              style={{
                marginLeft: "10px",
                padding: "4px 6px",
                borderRadius: "4px"
              }}
            >
              <option value="Placed">Placed</option>
              <option value="Packed">Packed</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>

          {/* CUSTOMER DETAILS */}
          <div style={{ marginTop: "16px" }}>
            <h4>Customer Details</h4>
            <p><strong>Name:</strong> {order.customerDetails?.name}</p>
            <p><strong>Phone:</strong> {order.customerDetails?.phone}</p>
            <p>
              <strong>Address:</strong>{" "}
              {order.customerDetails?.address},{" "}
              {order.customerDetails?.city} –{" "}
              {order.customerDetails?.pincode}
            </p>
          </div>

          {/* ITEMS */}
          <div style={{ marginTop: "16px" }}>
            <h4>Items</h4>
            <ul>
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.name} × {item.qty} (₹{item.price})
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </AdminLayout>
  );
}
