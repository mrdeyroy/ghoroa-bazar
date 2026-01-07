import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";


export default function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // customer address
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: ""
  });

  // 🔴 STOCK ISSUE CHECK
  const hasStockIssue = cart.some(
    item => item.qty > item.stock
  );

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const isAddressValid = () =>
    customer.name &&
    customer.phone &&
    customer.address &&
    customer.city &&
    customer.pincode;

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
    paymentMethod
  };

  // 🔴 COMMON VALIDATION
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
      alert("Some items exceed available stock. Please update your cart.");
      navigate("/cart");
      return false;
    }

    if (!isAddressValid()) {
      alert("Please fill all delivery details");
      return false;
    }

    return true;
  };

  // ✅ COD ORDER
  const placeCODOrder = async () => {
    if (!validateBeforeOrder()) return;

    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(baseOrderData)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Order failed");
        return;
      }

      clearCart();
      navigate("/order-success");
    } catch (err) {
      console.error(err);
      alert("Server error while placing order");
    }
  };

  // ✅ ONLINE PAYMENT (UPI / CARD)
  const payWithRazorpay = () => {
    if (!validateBeforeOrder()) return;

    const options = {
      key: "RAZORPAY_KEY_ID",
      amount: total * 100,
      currency: "INR",
      name: "Ghoroa Bazar",
      description: "Order Payment",

      handler: async function (response) {
        try {
          const res = await fetch("http://localhost:5000/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...baseOrderData,
              paymentStatus: "Paid",
              razorpayPaymentId: response.razorpay_payment_id
            })
          });

          const data = await res.json();

          if (!res.ok) {
            alert(data.error || "Order save failed");
            return;
          }

          clearCart();
          navigate("/order-success");
        } catch (err) {
          console.error(err);
          alert("Payment successful but order save failed");
        }
      },

      theme: { color: "#006837" }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const placeOrder = () => {
    paymentMethod === "COD" ? placeCODOrder() : payWithRazorpay();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Checkout</h2>

      {/* DELIVERY DETAILS */}
      <h3>Delivery Details</h3>

      <input
        placeholder="Full Name"
        value={customer.name}
        onChange={e => setCustomer({ ...customer, name: e.target.value })}
      />

      <input
        placeholder="Phone Number"
        value={customer.phone}
        onChange={e => setCustomer({ ...customer, phone: e.target.value })}
      />

      <input
        placeholder="Full Address"
        value={customer.address}
        onChange={e => setCustomer({ ...customer, address: e.target.value })}
      />

      <input
        placeholder="City"
        value={customer.city}
        onChange={e => setCustomer({ ...customer, city: e.target.value })}
      />

      <input
        placeholder="Pincode"
        value={customer.pincode}
        onChange={e => setCustomer({ ...customer, pincode: e.target.value })}
      />

      <h3>Total Amount: ₹{total}</h3>

      {/* PAYMENT METHOD */}
      <h4>Select Payment Method</h4>

      <label>
        <input
          type="radio"
          checked={paymentMethod === "COD"}
          onChange={() => setPaymentMethod("COD")}
        />
        Cash on Delivery
      </label>
      <br />

      <label>
        <input
          type="radio"
          checked={paymentMethod === "UPI"}
          onChange={() => setPaymentMethod("UPI")}
        />
        UPI
      </label>
      <br />

      <label>
        <input
          type="radio"
          checked={paymentMethod === "CARD"}
          onChange={() => setPaymentMethod("CARD")}
        />
        Debit / Credit Card
      </label>

      <br /><br />

      {/* 🔴 STOCK WARNING */}
      {hasStockIssue && (
        <p style={{ color: "red", fontSize: "14px" }}>
          Some items exceed available stock. Please update your cart.
        </p>
      )}

      <button
        onClick={placeOrder}
        disabled={hasStockIssue}
        style={{
          background: hasStockIssue ? "#ccc" : "#006837",
          color: "#fefffd",
          padding: "12px 20px",
          border: "none",
          borderRadius: "6px",
          cursor: hasStockIssue ? "not-allowed" : "pointer",
          fontSize: "16px",
          width: "100%"
        }}
      >
        {paymentMethod === "COD" ? "Place Order" : "Pay Now"}
      </button>
    </div>
  );
}
