import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function Payment() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const customer = location.state?.customer;
  const userId = localStorage.getItem("userId");

  const [method, setMethod] = useState("paypal");

  if (!customer) {
    navigate("/checkout");
    return null;
  }

  const subTotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const discount = 10;
  const total = subTotal - discount;

  const baseOrderData = {
    userId,
    customerDetails: customer,
    items: cart.map(item => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      qty: item.qty
    })),
    totalAmount: total,
    paymentMethod: method.toUpperCase()
  };

  const confirmPayment = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...baseOrderData,
          paymentStatus: method === "cod" ? "Pending" : "Paid"
        })
      });

      if (!res.ok) throw new Error();

      clearCart();
      navigate("/order-success");
    } catch {
      alert("Payment failed");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        {/* LEFT */}
        <div style={styles.left}>
          <h3>Select Payment Method</h3>

          <PaymentOption label="PayPal" value="paypal" method={method} setMethod={setMethod} />
          <PaymentOption label="VISA •••• 8047" value="visa" method={method} setMethod={setMethod} />
          <PaymentOption label="Google Pay" value="gpay" method={method} setMethod={setMethod} />
          <PaymentOption label="Cash On Delivery" value="cod" method={method} setMethod={setMethod} />

          <div style={styles.cardBox}>
            <h4>Add New Credit/Debit Card</h4>

            <input placeholder="Card Holder Name *" style={styles.input} />
            <input placeholder="Card Number *" style={styles.input} />

            <div style={{ display: "flex", gap: 10 }}>
              <input placeholder="MM/YY" style={styles.input} />
              <input placeholder="CVV" style={styles.input} />
            </div>

            <label style={styles.saveCard}>
              <input type="checkbox" defaultChecked /> Save card for future payments
            </label>

            <button style={styles.addCardBtn}>Add Card</button>
          </div>
        </div>

        {/* RIGHT */}
        <div style={styles.right}>
          <h3>Order Summary</h3>

          <Row label="Items" value={cart.length} />
          <Row label="Sub Total" value={`₹${subTotal.toFixed(2)}`} />
          <Row label="Shipping" value="₹0.00" />
          <Row label="Taxes" value="₹0.00" />
          <Row label="Coupon Discount" value={`-₹${discount.toFixed(2)}`} />

          <hr />

          <Row label="Total" value={`₹${total.toFixed(2)}`} bold />

          <button style={styles.confirmBtn} onClick={confirmPayment}>
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({ label, value, method, setMethod }) {
  return (
    <label style={styles.option}>
      <input
        type="radio"
        checked={method === value}
        onChange={() => setMethod(value)}
      />
      {label}
    </label>
  );
}

function Row({ label, value, bold }) {
  return (
    <div style={{ ...styles.row, fontWeight: bold ? 600 : 400 }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 1100,
    margin: "40px auto",
    padding: "0 20px",
    fontFamily: "system-ui"
  },
  wrapper: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 30
  },
  left: {
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    boxShadow: "0 0 0 1px #eee"
  },
  right: {
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    boxShadow: "0 0 0 1px #eee",
    height: "fit-content"
  },
  option: {
    display: "flex",
    gap: 10,
    padding: "12px 14px",
    border: "1px solid #eee",
    borderRadius: 10,
    marginBottom: 12,
    cursor: "pointer"
  },
  cardBox: {
    marginTop: 20,
    paddingTop: 20,
    borderTop: "1px solid #eee"
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #ddd",
    marginBottom: 12
  },
  saveCard: {
    display: "flex",
    gap: 8,
    fontSize: 14,
    marginBottom: 14
  },
  addCardBtn: {
    background: "#006837",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: 20,
    cursor: "pointer"
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
    fontSize: 14
  },
  confirmBtn: {
    width: "100%",
    marginTop: 20,
    padding: "14px",
    background: "#006837",
    color: "#fff",
    border: "none",
    borderRadius: 30,
    fontSize: 16,
    cursor: "pointer"
  }
};
