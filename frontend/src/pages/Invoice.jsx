import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Invoice() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/orders/${orderId}`)
      .then(res => res.json())
      .then(data => setOrder(data));
  }, [orderId]);

  if (!order) return <p>Loading invoice...</p>;

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "auto",
        padding: "20px",
        background: "#ffffff",
        color: "#000"
      }}
    >
      <h1 style={{ color: "#006837" }}>Ghoroa Bazar</h1>
      <p>Order Invoice</p>

      <hr />

      <p><strong>Order ID:</strong> {order._id}</p>
      <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>

      <hr />

      <h3>Customer Details</h3>
      <p>{order.customerDetails?.name}</p>
      <p>{order.customerDetails?.phone}</p>
      <p>
        {order.customerDetails?.address},
        {order.customerDetails?.city} – {order.customerDetails?.pincode}
      </p>

      <hr />

      <h3>Items</h3>
      <table width="100%" border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th align="left">Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i}>
              <td>{item.name}</td>
              <td align="center">{item.qty}</td>
              <td align="center">₹{item.price}</td>
              <td align="center">₹{item.price * item.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ textAlign: "right" }}>
        Grand Total: ₹{order.totalAmount}
      </h3>

      <p>
        <strong>Payment:</strong> {order.paymentMethod} ({order.paymentStatus})
      </p>

      <p>
        <strong>Status:</strong> {order.orderStatus}
      </p>

      <button
        onClick={() => window.print()}
        style={{
          marginTop: "20px",
          background: "#ffa500",
          border: "none",
          padding: "10px 20px",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Print / Download Invoice
      </button>
    </div>
  );
}
