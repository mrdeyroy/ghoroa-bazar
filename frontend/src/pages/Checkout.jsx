import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    email: ""
  });

  const hasStockIssue = cart.some(item => item.qty > item.stock);

  const subTotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const couponDiscount = 10;
  const total = subTotal - couponDiscount;

  const isAddressValid = () =>
    customer.firstName &&
    customer.lastName &&
    customer.phone &&
    customer.address &&
    customer.city &&
    customer.state &&
    customer.pincode;

  const baseOrderData = {
    userId,
    customerDetails: customer,
    items: cart.map(item => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      qty: item.qty,
      image: item.image,
      weight: item.selectedWeight || item.weight
    })),
    totalAmount: total,
    paymentMethod
  };

  const validateBeforeOrder = () => {
    if (!userId) {
      alert("Please login to place order");
      navigate("/login");
      return false;
    }

    if (cart.length === 0) {
      alert("Your cart is empty");
      navigate("/cart");
      return false;
    }

    if (hasStockIssue) {
      alert("Some items exceed available stock");
      return false;
    }

    if (!isAddressValid()) {
      alert("Please fill all required details");
      return false;
    }

    return true;
  };

  const placeCODOrder = async () => {
    if (!validateBeforeOrder()) return;

    try {
      console.log("PAYLOAD BEING SENT:", JSON.stringify(baseOrderData, null, 2));
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(baseOrderData)
      });

      if (!res.ok) throw new Error();

      clearCart();
      navigate("/order-success");
    } catch {
      alert("Order failed");
    }
  };

  const proceedToPayment = () => {
    if (!validateBeforeOrder()) return;

    navigate("/payment", {
      state: {
        customer,
        paymentMethod
      }
    });
  };


  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Checkout</h2>

      <div style={styles.wrapper}>
        {/* LEFT */}
        <div style={styles.formBox}>
          <h3 style={styles.sectionTitle}>Billing Details</h3>

          <div style={styles.row}>
            <input
              placeholder="First Name *"
              style={styles.input}
              value={customer.firstName}
              onChange={e => setCustomer({ ...customer, firstName: e.target.value })}
            />
            <input
              placeholder="Last Name *"
              style={styles.input}
              value={customer.lastName}
              onChange={e => setCustomer({ ...customer, lastName: e.target.value })}
            />
          </div>

          <input
            placeholder="Street Address *"
            style={styles.input}
            value={customer.address}
            onChange={e => setCustomer({ ...customer, address: e.target.value })}
          />

          <div style={styles.row}>
            <input
              placeholder="City *"
              style={styles.input}
              value={customer.city}
              onChange={e => setCustomer({ ...customer, city: e.target.value })}
            />
            <input
              placeholder="State *"
              style={styles.input}
              value={customer.state}
              onChange={e => setCustomer({ ...customer, state: e.target.value })}
            />
          </div>

          <input
            placeholder="Zip Code *"
            style={styles.input}
            value={customer.pincode}
            onChange={e => setCustomer({ ...customer, pincode: e.target.value })}
          />

          <input
            placeholder="Phone *"
            style={styles.input}
            value={customer.phone}
            onChange={e => setCustomer({ ...customer, phone: e.target.value })}
          />

          <input
            placeholder="Email"
            style={styles.input}
            value={customer.email}
            onChange={e => setCustomer({ ...customer, email: e.target.value })}
          />

          <h4 style={styles.sectionTitle}>Payment Method</h4>

          <label style={styles.radio}>
            <input
              type="radio"
              checked={paymentMethod === "COD"}
              onChange={() => setPaymentMethod("COD")}
            />
            Cash on Delivery
          </label>

          <label style={styles.radio}>
            <input
              type="radio"
              checked={paymentMethod !== "COD"}
              onChange={() => setPaymentMethod("UPI")}
            />
            Online Payment
          </label>
        </div>

        {/* RIGHT */}
        <div style={styles.summaryBox}>
          <h3 style={styles.sectionTitle}>Order Summary</h3>

          <div style={styles.summaryRow}>
            <span>Items</span>
            <span>{cart.length}</span>
          </div>

          <div style={styles.summaryRow}>
            <span>Sub Total</span>
            <span>₹{subTotal.toFixed(2)}</span>
          </div>

          <div style={styles.summaryRow}>
            <span>Coupon Discount</span>
            <span>-₹{couponDiscount.toFixed(2)}</span>
          </div>

          <hr />

          <div style={{ ...styles.summaryRow, fontWeight: 600 }}>
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>

          {hasStockIssue && (
            <p style={{ color: "red", fontSize: 13 }}>
              Some items exceed available stock.
            </p>
          )}

          <button
            style={{
              ...styles.payBtn,
              opacity: hasStockIssue ? 0.6 : 1
            }}
            disabled={hasStockIssue}
            onClick={proceedToPayment}
          >
            Proceed to Payment
          </button>
        </div>
      </div>
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
  title: {
    textAlign: "center",
    marginBottom: 30
  },
  wrapper: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 30
  },
  formBox: {
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    boxShadow: "0 0 0 1px #eee"
  },
  summaryBox: {
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    boxShadow: "0 0 0 1px #eee",
    height: "fit-content"
  },
  sectionTitle: {
    marginBottom: 16
  },
  row: {
    display: "flex",
    gap: 12
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #ddd",
    marginBottom: 14,
    fontSize: 14
  },
  radio: {
    display: "flex",
    gap: 8,
    marginBottom: 10,
    fontSize: 14
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
    fontSize: 14
  },
  payBtn: {
    width: "100%",
    marginTop: 20,
    padding: "14px",
    background: "#006837",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    cursor: "pointer"
  }
};
