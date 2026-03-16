import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  ShieldCheck, 
  Truck, 
  ChevronRight, 
  CheckCircle2, 
  Lock,
  Building,
  Globe,
  Tag,
  Clock,
  Loader2,
  ArrowRight
} from "lucide-react";
import BackButton from "../components/BackButton";

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || localStorage.getItem("userId");

  const [isLoading, setIsLoading] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [customer, setCustomer] = useState(() => {
    const saved = localStorage.getItem("billing_details");
    return saved ? JSON.parse(saved) : {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      email: ""
    };
  });

  useEffect(() => {
    localStorage.setItem("billing_details", JSON.stringify(customer));
  }, [customer]);

  const hasStockIssue = cart.some(item => item.qty > item.stock);

  const subTotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const couponDiscount = 10;
  const shippingCharge = shippingMethod === "express" ? 40 : 0;
  const total = subTotal - couponDiscount + shippingCharge;

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
    paymentMethod: "Online",
    shippingMethod
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

  const proceedToPayment = async () => {
    if (!validateBeforeOrder()) return;

    setIsLoading(true);
    // Simulate a small delay for premium feel
    setTimeout(() => {
        setIsLoading(false);
        navigate("/payment", {
            state: {
              customer,
              shippingMethod,
              total
            }
          });
    }, 800);
  };

  const steps = [
    { name: "Cart", status: "complete" },
    { name: "Checkout", status: "current" },
    { name: "Payment", status: "upcoming" },
    { name: "Success", status: "upcoming" }
  ];

  return (
    <div className="min-h-screen bg-[#fbfcfa] pb-20">
      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-100 py-4 mb-8 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 md:gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2 md:gap-4">
              <div className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-[10px] md:text-sm font-bold ${
                step.status === "complete" ? "bg-green-100 text-green-600" :
                step.status === "current" ? "bg-[#1F7A3B] text-white shadow-lg shadow-green-100" :
                "bg-gray-100 text-gray-400"
              }`}>
                {step.status === "complete" ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : idx + 1}
              </div>
              <span className={`text-[10px] md:text-sm font-bold uppercase tracking-wider ${
                step.status === "current" ? "text-gray-900" : "text-gray-400"
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
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mt-2">Finalize Your Order</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: BILLING DETAILS */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                    <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">Billing Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">First Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1F7A3B] transition-colors" />
                    <input
                      type="text"
                      placeholder="John"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#1F7A3B] focus:ring-4 focus:ring-green-50 transition-all outline-none text-gray-800 font-medium"
                      value={customer.firstName}
                      onChange={e => setCustomer({ ...customer, firstName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Last Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1F7A3B] transition-colors" />
                    <input
                      type="text"
                      placeholder="Doe"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#1F7A3B] focus:ring-4 focus:ring-green-50 transition-all outline-none text-gray-800 font-medium"
                      value={customer.lastName}
                      onChange={e => setCustomer({ ...customer, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Street Address</label>
                  <div className="relative group">
                    <Building className="absolute left-4 top-4 w-4 h-4 text-gray-400 group-focus-within:text-[#1F7A3B] transition-colors" />
                    <textarea
                      placeholder="House No, Street, Landmark"
                      rows="2"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#1F7A3B] focus:ring-4 focus:ring-green-50 transition-all outline-none text-gray-800 font-medium resize-none"
                      value={customer.address}
                      onChange={e => setCustomer({ ...customer, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">City</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1F7A3B] transition-colors" />
                    <input
                      type="text"
                      placeholder="e.g. Kolkata"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#1F7A3B] focus:ring-4 focus:ring-green-50 transition-all outline-none text-gray-800 font-medium"
                      value={customer.city}
                      onChange={e => setCustomer({ ...customer, city: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">State</label>
                  <input
                    type="text"
                    placeholder="West Bengal"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#1F7A3B] focus:ring-4 focus:ring-green-50 transition-all outline-none text-gray-800 font-medium"
                    value={customer.state}
                    onChange={e => setCustomer({ ...customer, state: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Postal Code</label>
                  <input
                    type="text"
                    placeholder="700001"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#1F7A3B] focus:ring-4 focus:ring-green-50 transition-all outline-none text-gray-800 font-medium"
                    value={customer.pincode}
                    onChange={e => setCustomer({ ...customer, pincode: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1F7A3B] transition-colors" />
                    <input
                      type="tel"
                      placeholder="+91-XXXXXXXXXX"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#1F7A3B] focus:ring-4 focus:ring-green-50 transition-all outline-none text-gray-800 font-medium"
                      value={customer.phone}
                      onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Email Address (Optional)</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1F7A3B] transition-colors" />
                    <input
                      type="email"
                      placeholder="john@example.com"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#1F7A3B] focus:ring-4 focus:ring-green-50 transition-all outline-none text-gray-800 font-medium"
                      value={customer.email}
                      onChange={e => setCustomer({ ...customer, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SHIPPING METHOD */}
            <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                        <Truck className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">Shipping Method</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={() => setShippingMethod("standard")}
                        className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-start gap-3 relative overflow-hidden ${
                            shippingMethod === "standard" ? "border-[#1F7A3B] bg-green-50/30" : "border-gray-100 bg-white hover:border-gray-200"
                        }`}
                    >
                        {shippingMethod === "standard" && <div className="absolute top-0 right-0 bg-[#1F7A3B] text-white p-1 rounded-bl-xl"><CheckCircle2 className="w-4 h-4" /></div>}
                        <div className="font-black text-gray-800">Standard Delivery</div>
                        <div className="text-xs text-gray-500 font-medium">Delivered in 3-5 business days</div>
                        <div className="text-green-600 font-black text-sm uppercase tracking-tighter bg-white px-2 py-0.5 rounded-lg border border-green-100">Free</div>
                    </button>

                    <button 
                        onClick={() => setShippingMethod("express")}
                        className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-start gap-3 relative overflow-hidden ${
                            shippingMethod === "express" ? "border-[#1F7A3B] bg-green-50/30" : "border-gray-100 bg-white hover:border-gray-200"
                        }`}
                    >
                        {shippingMethod === "express" && <div className="absolute top-0 right-0 bg-[#1F7A3B] text-white p-1 rounded-bl-xl"><CheckCircle2 className="w-4 h-4" /></div>}
                        <div className="font-black text-gray-800 flex items-center gap-2">Express Delivery <span className="bg-orange-100 text-orange-600 text-[10px] px-1.5 py-0.5 rounded font-black">FAST</span></div>
                        <div className="text-xs text-gray-500 font-medium">Delivered in 24-48 hours</div>
                        <div className="text-gray-800 font-black text-sm">₹40.00</div>
                    </button>
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

              {/* Product list preview */}
              <div className="max-h-48 overflow-y-auto pr-2 mb-6 space-y-3 custom-scrollbar">
                {cart.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <img src={item.image} className="w-12 h-12 object-contain bg-gray-50 rounded-xl border border-gray-100" alt="" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                            <p className="text-[10px] text-gray-500 font-medium">Qty: {item.qty} • {item.selectedWeight}</p>
                        </div>
                        <p className="text-xs font-black text-gray-900">₹{(item.price * item.qty).toFixed(2)}</p>
                    </div>
                ))}
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500 text-sm font-medium">
                  <span>Subtotal</span>
                  <span className="text-gray-900">₹{subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-gray-500 flex items-center gap-1"><Tag className="w-3 h-3" /> Coupon Discount</span>
                  <span className="text-red-500 font-bold">-₹{couponDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-sm font-medium">
                  <span>Shipping ({shippingMethod})</span>
                  <span className={shippingCharge === 0 ? "text-green-600 font-black" : "text-gray-900"}>
                    {shippingCharge === 0 ? "Free" : `₹${shippingCharge.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="h-px bg-gray-100 my-4"></div>
                
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold text-gray-900">Grand Total</span>
                  <span className="text-2xl font-black text-[#1F7A3B]">₹{total.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-orange-600 font-bold bg-orange-50 p-2 rounded-xl border border-orange-100">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      Estimated delivery: {(() => {
                        const getFormattedDate = (days) => {
                          const date = new Date();
                          date.setDate(date.getDate() + days);
                          return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                        };
                        return shippingMethod === 'express' 
                          ? `Tomorrow, ${getFormattedDate(1)}` 
                          : `${getFormattedDate(3)} - ${getFormattedDate(5)}`;
                      })()}
                    </span>
                </div>
              </div>

              <button
                disabled={hasStockIssue || isLoading}
                onClick={proceedToPayment}
                className="w-full bg-[#1F7A3B] text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-green-100 hover:bg-[#185e2e] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                    <>
                        Proceed to Payment
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
              </button>
              
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <Lock className="w-4 h-4 text-green-600" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">100% Secure Checkout</span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all">
                    {/* Placeholder for payment logos - normally you'd use icons or svgs here */}
                    <img src="/src/assets/mastercard.png" className="h-4 object-contain" alt="Mastercard" />
                    <img src="/src/assets/gpay.png" className="h-5 object-contain" alt="GPay" />
                    <div className="text-[10px] font-black text-gray-300">UPI • VISA • COD</div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-2xl flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                    <p className="text-[10px] text-green-800 font-bold leading-tight">Your data is encrypted and protected by industry standard security.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
