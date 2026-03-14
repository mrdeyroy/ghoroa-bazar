import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Smartphone, CheckCircle, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Payment() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const customer = location.state?.customer;
  const userId = localStorage.getItem("userId");

  const [paymentMethod, setPaymentMethod] = useState("online"); // 'online' or 'cod'
  const [showModal, setShowModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState("selection"); // 'selection', 'processing', 'success'
  const [selectedOnlineMethod, setSelectedOnlineMethod] = useState("upi");

  if (!customer) {
    useEffect(() => {
      navigate("/checkout");
    }, []);
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
      qty: item.qty,
      image: item.image,
      weight: item.selectedWeight || item.weight
    })),
    totalAmount: total
  };

  const handlePlaceOrder = async (finalMethod, finalStatus, txnId = null) => {
    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...baseOrderData,
          paymentMethod: finalMethod,
          paymentStatus: finalStatus,
          transactionId: txnId
        })
      });

      if (!res.ok) throw new Error();

      clearCart();
      navigate("/order-success");
    } catch {
      alert("Order failed. Please try again.");
    }
  };

  const startPayment = () => {
    if (paymentMethod === "cod") {
      handlePlaceOrder("COD", "Pending");
    } else {
      setShowModal(true);
      setPaymentStep("selection");
    }
  };

  const processSimulatedPayment = () => {
    setPaymentStep("processing");
    
    // Simulate payment processing time
    setTimeout(() => {
      setPaymentStep("success");
      
      // After success animation, redirect and create order
      setTimeout(() => {
        const fakeTxnId = "TXN_" + Date.now();
        handlePlaceOrder("Online", "Paid", fakeTxnId);
      }, 1500);
    }, 2500);
  };

  return (
    <div style={styles.page}>
      <button
        onClick={() => navigate(-1)}
        style={styles.backBtn}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div style={styles.wrapper}>
        {/* LEFT: Payment Selection */}
        <div style={styles.left}>
          <h3 style={{ marginBottom: 20 }}>Choose Payment Method</h3>

          <div 
            onClick={() => setPaymentMethod("online")}
            style={{ 
              ...styles.methodCard, 
              border: paymentMethod === "online" ? "2px solid #006837" : "1px solid #ddd",
              background: paymentMethod === "online" ? "#f0fdf4" : "#fff"
            }}
          >
            <div style={styles.methodInfo}>
              <CreditCard size={24} color={paymentMethod === "online" ? "#006837" : "#555"} />
              <div>
                <div style={{ fontWeight: 600 }}>Online Payment</div>
                <div style={{ fontSize: 13, color: "#666" }}>Pay via Card, UPI, Netbanking (Razorpay)</div>
              </div>
            </div>
            <input type="radio" checked={paymentMethod === "online"} readOnly />
          </div>

          <div 
            onClick={() => setPaymentMethod("cod")}
            style={{ 
              ...styles.methodCard, 
              border: paymentMethod === "cod" ? "2px solid #006837" : "1px solid #ddd",
              background: paymentMethod === "cod" ? "#f0fdf4" : "#fff",
              marginTop: 15
            }}
          >
            <div style={styles.methodInfo}>
              <Smartphone size={24} color={paymentMethod === "cod" ? "#006837" : "#555"} />
              <div>
                <div style={{ fontWeight: 600 }}>Cash on Delivery</div>
                <div style={{ fontSize: 13, color: "#666" }}>Pay when you receive your order</div>
              </div>
            </div>
            <input type="radio" checked={paymentMethod === "cod"} readOnly />
          </div>
        </div>

        {/* RIGHT: Summary */}
        <div style={styles.right}>
          <h3>Order Summary</h3>
          <div style={styles.summaryRow}><span>Items</span><span>{cart.length}</span></div>
          <div style={styles.summaryRow}><span>Sub Total</span><span>₹{subTotal.toFixed(2)}</span></div>
          <div style={styles.summaryRow}><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>
          <hr style={{ border: "0.5px solid #eee", margin: "10px 0" }} />
          <div style={{ ...styles.summaryRow, fontWeight: 700, fontSize: 18 }}>
            <span>Total</span><span>₹{total.toFixed(2)}</span>
          </div>

          <button style={styles.confirmBtn} onClick={startPayment}>
            {paymentMethod === "online" ? "Proceed to Pay" : "Place Order"}
          </button>
        </div>
      </div>

      {/* RAZORPAY SIMULATED MODAL */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.razorpayModal}>
            <div style={styles.rpHeader}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>PAYING TO</div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>Ghoroa Bazar</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>AMOUNT</div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>₹{total.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div style={styles.rpBody}>
              {paymentStep === "selection" && (
                <>
                  <h4 style={{ marginBottom: 15 }}>Select Payment Method</h4>
                  <div 
                    onClick={() => setSelectedOnlineMethod("upi")}
                    style={{...styles.rpOption, border: selectedOnlineMethod === "upi" ? "1px solid #3395ff" : "1px solid #eee"}}
                  >
                    <span>UPI (Google Pay, PhonePe)</span>
                    <input type="radio" checked={selectedOnlineMethod === "upi"} readOnly />
                  </div>
                  <div 
                    onClick={() => setSelectedOnlineMethod("card")}
                    style={{...styles.rpOption, border: selectedOnlineMethod === "card" ? "1px solid #3395ff" : "1px solid #eee"}}
                  >
                    <span>Cards (Visa, Matercard)</span>
                    <input type="radio" checked={selectedOnlineMethod === "card"} readOnly />
                  </div>
                  
                  <button style={styles.rpPayBtn} onClick={processSimulatedPayment}>
                    Pay ₹{total.toFixed(2)}
                  </button>
                </>
              )}

              {paymentStep === "processing" && (
                <div style={styles.statusView}>
                  <Loader2 className="spinner" size={48} color="#3395ff" />
                  <div style={{ marginTop: 20, fontWeight: 600 }}>Processing Payment...</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 5 }}>Do not refresh or go back</div>
                </div>
              )}

              {paymentStep === "success" && (
                <div style={styles.statusView}>
                  <CheckCircle size={48} color="#4caf50" />
                  <div style={{ marginTop: 20, fontWeight: 600, color: "#4caf50" }}>Payment Successful!</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 5 }}>Redirecting to order confirmation...</div>
                </div>
              )}
            </div>

            <div style={styles.rpFooter}>
              <span>Powered by <strong>Razorpay</strong></span>
              <button 
                onClick={() => setShowModal(false)} 
                disabled={paymentStep !== "selection"}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 11 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 1100, margin: "40px auto", padding: "0 20px", fontFamily: "system-ui" },
  backBtn: { display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", marginBottom: 15, fontSize: 16, color: "#333" },
  wrapper: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 30 },
  left: { background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 0 0 1px #eee" },
  right: { background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 0 0 1px #eee", height: "fit-content" },
  methodCard: { padding: 20, borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "all 0.2s" },
  methodInfo: { display: "flex", gap: 15, alignItems: "center" },
  summaryRow: { display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14 },
  confirmBtn: { width: "100%", marginTop: 20, padding: 16, background: "#006837", color: "#fff", border: "none", borderRadius: 30, fontSize: 16, fontWeight: 600, cursor: "pointer" },
  
  // Modal Styles
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  razorpayModal: { width: 400, background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" },
  rpHeader: { background: "#212121", padding: "20px 25px", color: "#fff" },
  rpBody: { padding: 25, minHeight: 250 },
  rpOption: { padding: "12px 15px", border: "1px solid #eee", borderRadius: 8, display: "flex", justifyContent: "space-between", marginBottom: 12, cursor: "pointer", fontSize: 14 },
  rpPayBtn: { width: "100%", padding: 14, background: "#3395ff", color: "#fff", border: "none", borderRadius: 6, fontSize: 16, fontWeight: 600, marginTop: 10, cursor: "pointer" },
  statusView: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", paddingTop: 30 },
  rpFooter: { padding: "10px 25px", background: "#f8f9fa", borderTop: "1px solid #eee", fontSize: 10, color: "#666", display: "flex", justifyContent: "space-between", alignItems: "center" },
};
