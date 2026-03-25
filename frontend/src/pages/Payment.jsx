import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Loader2,
  Lock,
  ShieldCheck,
  Truck,
  ChevronRight,
  Clock,
  Headphones,
  ShieldAlert,
  Zap,
  Tag,
  ArrowRight
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import BackButton from "../components/BackButton";

export default function Payment() {
  const { cart, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const customer = location.state?.customer;
  const shippingMethod = location.state?.shippingMethod || "standard";
  const userId = localStorage.getItem("userId");

  const [paymentMethod, setPaymentMethod] = useState("online"); // 'online' or 'cod'
  const [showModal, setShowModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState("selection"); // 'selection', 'processing', 'success'
  const [selectedOnlineMethod, setSelectedOnlineMethod] = useState("upi");

  useEffect(() => {
    if (!customer) {
      navigate("/checkout");
    }
  }, [customer, navigate]);

  if (!customer) return null;

  const subTotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const couponDiscount = 10;
  const shippingCharge = shippingMethod === "express" ? 40 : 0;
  const total = subTotal - couponDiscount + shippingCharge;

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
    shippingMethod
  };

  const handlePlaceOrder = async (finalMethod, finalStatus, txnId = null) => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/orders", { credentials: "include",
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...baseOrderData,
          paymentMethod: finalMethod,
          paymentStatus: finalStatus,
          transactionId: txnId
        })
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      clearCart();
      navigate("/order-success", { state: { order: data.order } });
    } catch {
      alert("Order failed. Please try again.");
    }
  };

  const startPayment = () => {
    if (paymentMethod === "cod") {
      setPaymentStep("processing");
      setTimeout(() => {
        handlePlaceOrder("COD", "Pending");
      }, 1000);
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

  const steps = [
    { name: "Cart", status: "complete" },
    { name: "Checkout", status: "complete" },
    { name: "Payment", status: "current" },
    { name: "Success", status: "upcoming" }
  ];

  const getDeliveryDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-[#fbfcfa] pb-20">
      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-100 py-4 mb-8 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 md:gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2 md:gap-4">
              <div className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-[10px] md:text-sm font-bold ${step.status === "complete" ? "bg-green-100 text-green-600" :
                  step.status === "current" ? "bg-[#1F7A3B] text-white shadow-lg shadow-green-100" :
                    "bg-gray-100 text-gray-400"
                }`}>
                {step.status === "complete" ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : idx + 1}
              </div>
              <span className={`text-[10px] md:text-sm font-bold uppercase tracking-wider ${step.status === "current" ? "text-gray-900" :
                  step.status === "complete" ? "text-green-700" : "text-gray-400"
                }`}>
                {step.name}
              </span>
              {idx < steps.length - 1 && <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-200" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <BackButton color="#333" margin="0" />
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mt-2">Almost There!</h1>
          <p className="text-gray-500 font-medium">Choose your preferred payment method to complete the order.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* LEFT: PAYMENT SELECTION */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                  <Zap className="w-5 h-5" />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">Choose Payment Method</h2>
              </div>

              <div className="space-y-4">
                {/* Online Payment Card */}
                <div
                  onClick={() => setPaymentMethod("online")}
                  className={`group relative p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${paymentMethod === "online"
                      ? "border-[#1F7A3B] bg-green-50/30 ring-4 ring-green-50"
                      : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${paymentMethod === "online" ? "bg-[#1F7A3B] text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900">Online Payment</h4>
                      <p className="text-sm text-gray-500 font-medium">Pay via Card, UPI, Netbanking or Wallet</p>

                      <div className="flex items-center gap-2 mt-2 opacity-60">
                        <img src="/assets/mastercard.png" className="h-4 object-contain grayscale" alt="" />
                        <img src="/assets/gpay.png" className="h-4 object-contain grayscale" alt="" />
                        <span className="text-[10px] font-black text-gray-400">VISA • UPI</span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === "online" ? "border-[#1F7A3B] bg-[#1F7A3B]" : "border-gray-200"
                    }`}>
                    {paymentMethod === "online" && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                {/* COD Card */}
                <div
                  onClick={() => setPaymentMethod("cod")}
                  className={`group relative p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${paymentMethod === "cod"
                      ? "border-[#1F7A3B] bg-green-50/30 ring-4 ring-green-50"
                      : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${paymentMethod === "cod" ? "bg-[#1F7A3B] text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900">Cash on Delivery</h4>
                      <p className="text-sm text-gray-500 font-medium">Pay securely with cash or UPI at your doorstep</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === "cod" ? "border-[#1F7A3B] bg-[#1F7A3B]" : "border-gray-200"
                    }`}>
                    {paymentMethod === "cod" && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              </div>

              {/* Trust Text */}
              <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
                <Lock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest text-center">
                  All transactions are secure and encrypted
                </span>
              </div>
            </div>

            {/* Trust Badges Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <ShieldCheck className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-xs font-black text-gray-900">Secure Payment</p>
                  <p className="text-[10px] text-gray-500">100% data encryption</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <Truck className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-xs font-black text-gray-900">Fast Delivery</p>
                  <p className="text-[10px] text-gray-500">Safe doorstep delivery</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <Headphones className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-xs font-black text-gray-900">24/7 Support</p>
                  <p className="text-[10px] text-gray-500">Dedicated assistance</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-extrabold text-gray-900">Order Summary</h2>
                <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-bold">{cart.length} Items</span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500 text-sm font-medium">
                  <span>Bag Subtotal</span>
                  <span className="text-gray-900">₹{subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-gray-500 flex items-center gap-1"><Tag className="w-3 h-3" /> Coupon Discount</span>
                  <span className="text-green-600 font-bold">-₹{couponDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-sm font-medium">
                  <span>Shipping ({shippingMethod})</span>
                  <span className={shippingCharge === 0 ? "text-green-600 font-black" : "text-gray-900"}>
                    {shippingCharge === 0 ? "Free" : `₹${shippingCharge.toFixed(2)}`}
                  </span>
                </div>

                <div className="h-px bg-gray-100 my-4"></div>

                <div className="flex justify-between items-baseline mb-6">
                  <span className="text-lg font-bold text-gray-900">Total Payable</span>
                  <span className="text-3xl font-black text-[#1F7A3B]">₹{total.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-orange-600 font-bold bg-orange-50 p-3 rounded-2xl border border-orange-100">
                  <Clock className="w-4 h-4" />
                  <span>
                    Expected Delivery: {shippingMethod === 'express'
                      ? `Tomorrow, ${getDeliveryDate(1)}`
                      : `${getDeliveryDate(3)} - ${getDeliveryDate(5)}`}
                  </span>
                </div>
              </div>

              <button
                disabled={paymentStep === "processing"}
                onClick={startPayment}
                className="w-full bg-[#1F7A3B] text-white py-5 rounded-full font-black text-lg shadow-lg shadow-green-100 hover:bg-[#185e2e] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                {paymentStep === "processing" ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    {paymentMethod === "online" ? "Proceed to Pay" : "Place COD Order"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Billing To</p>
                <p className="text-sm font-extrabold text-gray-800">{customer.firstName} {customer.lastName}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{customer.address}, {customer.city}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RAZORPAY SIMULATED MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in slide-in-from-bottom-10 duration-500">
            {/* Modal Header */}
            <div className="bg-[#1e1e1e] p-6 md:p-8 text-white relative">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Paying To</p>
                  <h3 className="text-xl font-black tracking-tight">Ghoroa Bazar</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total Amount</p>
                  <h3 className="text-2xl font-black">₹{total.toFixed(2)}</h3>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 min-h-[300px] flex flex-col">
              {paymentStep === "selection" && (
                <div className="animate-in fade-in slide-in-from-right-10">
                  <h4 className="text-lg font-black text-gray-900 mb-6">Select Payment Method</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => setSelectedOnlineMethod("upi")}
                      className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${selectedOnlineMethod === "upi" ? "border-blue-500 bg-blue-50/30 shadow-sm" : "border-gray-100 hover:border-gray-200"
                        }`}
                    >
                      <span className={`font-bold transition-colors ${selectedOnlineMethod === "upi" ? "text-blue-700" : "text-gray-600"}`}>
                        UPI (Google Pay, PhonePe)
                      </span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedOnlineMethod === "upi" ? "border-blue-500 bg-blue-500" : "border-gray-200"}`}>
                        {selectedOnlineMethod === "upi" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedOnlineMethod("card")}
                      className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${selectedOnlineMethod === "card" ? "border-blue-500 bg-blue-50/30 shadow-sm" : "border-gray-100 hover:border-gray-200"
                        }`}
                    >
                      <span className={`font-bold transition-colors ${selectedOnlineMethod === "card" ? "text-blue-700" : "text-gray-600"}`}>
                        Cards (Visa, Matercard)
                      </span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedOnlineMethod === "card" ? "border-blue-500 bg-blue-500" : "border-gray-200"}`}>
                        {selectedOnlineMethod === "card" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={processSimulatedPayment}
                    className="w-full mt-8 bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                  >
                    Pay ₹{total.toFixed(2)}
                  </button>
                </div>
              )}

              {(paymentStep === "processing" || paymentStep === "cod_processing") && (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShieldAlert className="w-6 h-6 text-blue-300" />
                    </div>
                  </div>
                  <h3 className="mt-6 text-xl font-black text-gray-900 italic">Processing Your Payment...</h3>
                  <p className="mt-2 text-sm text-gray-400 font-medium">Please do not refresh or close this window.</p>
                </div>
              )}

              {paymentStep === "success" && (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-inner">
                    <CheckCircle2 className="w-10 h-10 animate-in zoom-in duration-500" />
                  </div>
                  <h3 className="mt-6 text-2xl font-black text-green-600">Payment Successful!</h3>
                  <p className="mt-2 text-sm text-gray-400 font-medium">Sit back! We're redirecting you to your order...</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* <img src="https://res.cloudinary.com/dxp7v2uuv/image/upload/v1742151600/razorpay_logo_qkx2z8.png" className="h-4 grayscale" alt="Razorpay" /> */}
                <span className="text-[8px] font-black uppercase text-gray-400 tracking-tighter">Powered by Razorpay</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                disabled={paymentStep !== "selection"}
                className="text-[10px] font-black text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest disabled:opacity-0"
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
