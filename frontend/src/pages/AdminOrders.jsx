import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, newStatus) => {
    const updateData = {
      orderStatus: newStatus
    };

    // ✅ Auto mark payment as Paid when Delivered
    if (newStatus === "Delivered") {
      updateData.paymentStatus = "Paid";
    }

    try {
      await fetch(`http://localhost:5000/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });

      fetchOrders();
    } catch (err) {
      console.error("Failed to update order", err);
    }
  };


  const statusColor = status => {
    if (status === "Delivered") return "green";
    if (status === "Cancelled") return "red";
    if (status === "Packed") return "#ffa500";
    return "#006837";
  };

  const paymentColor = status => {
    if (status === "Paid") return "green";
    if (status === "Pending") return "#ffa500";
    return "#555";
  };

  return (
    <AdminLayout>
      <h2 style={{ marginBottom: 20 }}>Orders</h2>

      {orders.length === 0 && <p>No orders found</p>}

      {orders.map(order => (
        <div
          key={order._id}
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 18,
            marginBottom: 18,
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
              <strong style={{ fontSize: 18 }}>
                ₹{Number(order.totalAmount || 0).toFixed(2)}
              </strong>

              <p style={{ fontSize: 12, color: "#555" }}>
                Order ID: {order._id}
              </p>

              <p style={{ fontSize: 12, color: "#555" }}>
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>

            <span
              style={{
                color: statusColor(order.orderStatus),
                fontWeight: "bold",
                fontSize: 14
              }}
            >
              {order.orderStatus || "Placed"}
            </span>
          </div>

          {/* PAYMENT INFO */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 12
            }}
          >
            <div style={{ fontSize: 14 }}>
              Payment Method:{" "}
              <strong>{order.paymentMethod || "N/A"}</strong>
              <br />
              Payment Status:{" "}
              <strong style={{ color: paymentColor(order.paymentStatus) }}>
                {order.paymentStatus || "Pending"}
              </strong>
            </div>

            <a
              href={`/invoice/${order._id}`}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "#ffa500",
                padding: "6px 12px",
                borderRadius: 6,
                textDecoration: "none",
                color: "#000",
                fontWeight: "bold",
                fontSize: 14
              }}
            >
              View Invoice
            </a>
          </div>

          <hr style={{ margin: "14px 0" }} />

          {/* UPDATE STATUS */}
          <label style={{ fontSize: 14 }}>
            Update Status:
            <select
              value={order.orderStatus || "Placed"}
              onChange={e => updateStatus(order._id, e.target.value)}
              style={{
                marginLeft: 10,
                padding: "6px 8px",
                borderRadius: 6
              }}
            >
              <option value="Placed">Placed</option>
              <option value="Packed">Packed</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>

          {/* CUSTOMER DETAILS */}
          <div style={{ marginTop: 16 }}>
            <h4>Customer Details</h4>
            <p>
              <strong>Name:</strong>{" "}
              {order.customerDetails?.firstName
                ? `${order.customerDetails.firstName} ${order.customerDetails.lastName || ""}`
                : order.customerDetails?.name || "N/A"}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {order.customerDetails?.phone || "N/A"}
            </p>
            <p>
              <strong>Address:</strong>{" "}
              {order.customerDetails?.address || "N/A"},{" "}
              {order.customerDetails?.city || ""},{" "}
              {order.customerDetails?.state || ""}{" "}
              {order.customerDetails?.pincode
                ? `– ${order.customerDetails.pincode}`
                : ""}
            </p>
          </div>

          {/* ITEMS */}
          <div style={{ marginTop: 16 }}>
            <h4>Items</h4>

            {order.items && order.items.length > 0 ? (
              <ul style={{ paddingLeft: 18 }}>
                {order.items.map((item, index) => (
                  <li key={index} style={{ fontSize: 14 }}>
                    {item.name} × {item.qty} (₹{item.price})
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: 14, color: "#555" }}>
                No items found
              </p>
            )}
          </div>
        </div>
      ))}
    </AdminLayout>
  );
}
