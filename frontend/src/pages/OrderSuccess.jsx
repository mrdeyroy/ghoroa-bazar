import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  Truck,
  Mail,
  Download,
  Calendar,
  PackageCheck,
  Star,
  ExternalLink
} from "lucide-react";

export default function OrderSuccess() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    // Clear billing details as the order is complete
    localStorage.removeItem("billing_details");

    // Generate a random-looking Order ID for a more professional feel
    const randomId = "GB-" + Math.floor(100000 + Math.random() * 900000);
    setOrderId(randomId);

    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  const steps = [
    { name: "Cart", status: "complete" },
    { name: "Checkout", status: "complete" },
    { name: "Payment", status: "complete" },
    { name: "Success", status: "current" }
  ];

  const getDeliveryDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
              <span className={`text-[10px] md:text-sm font-bold uppercase tracking-wider ${step.status === "current" ? "text-[#1F7A3B]" :
                step.status === "complete" ? "text-green-700 font-semibold" : "text-gray-400"
                }`}>
                {step.name}
              </span>
              {idx < steps.length - 1 && <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-200" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        {/* Main Success Card */}
        <div className="bg-white rounded-[40px] p-8 md:p-16 shadow-xl border border-gray-100 text-center relative overflow-hidden">
          {/* Confetti-like backgrounds */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-green-50 rounded-full -translate-x-16 -translate-y-16 blur-3xl opacity-50" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-50 rounded-full translate-x-16 translate-y-16 blur-3xl opacity-50" />

          <div className="relative">
            <div className="w-24 h-24 bg-green-100 rounded-[32px] flex items-center justify-center text-green-600 mx-auto mb-8 shadow-inner transform -rotate-6">
              <PackageCheck className="w-12 h-12" />
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">🎉 Order Placed!</h1>
            <p className="text-lg text-gray-500 font-medium max-w-md mx-auto mb-10 leading-relaxed">
              Hurray! Your order has been placed successfully and is being processed by our team.
            </p>

            {/* Order Details Mini Card */}
            <div className="bg-gray-50 rounded-3xl p-6 md:p-10 mb-10 space-y-6 text-left border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-wrap justify-between items-center gap-4 border-b border-gray-200 pb-6">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Order ID</p>
                  <p className="text-xl font-black text-gray-900 font-mono tracking-tight">{orderId}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-600 cursor-pointer hover:bg-green-50 transition-colors">
                    <Download className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Recipt</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 flex-shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Estimated Delivery</p>
                    <p className="text-sm font-black text-gray-900">{getDeliveryDate(3)} - {getDeliveryDate(5)}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Confirmation Sent</p>
                    <p className="text-sm font-black text-gray-900">Track details in your email</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link to="/" className="w-full md:w-auto">
                <button className="w-full bg-[#1F7A3B] text-white py-5 px-10 rounded-full font-black text-lg shadow-lg shadow-green-100 hover:bg-[#185e2e] transition-all active:scale-95 flex items-center justify-center gap-3 group">
                  <ShoppingBag className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
                  Continue Shopping
                </button>
              </Link>
              <Link to="/profile" className="w-full md:w-auto">
                <button className="w-full bg-white text-gray-900 border-2 border-gray-100 py-5 px-10 rounded-full font-black text-lg hover:border-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2 group">
                  View Orders
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>

            {/* Support Message */}
            <div className="mt-12 flex flex-col items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-orange-400 text-orange-400" />
                ))}
              </div>
              <p className="text-sm font-bold text-gray-400">Trusted by over 10k+ happy customers</p>
              <p className="text-xs text-gray-300 font-medium mt-2">
                Facing issues? <a href="https://wa.me/9188001930X" className="text-green-600 hover:underline font-black inline-flex items-center gap-1">Chat With Support <ExternalLink className="w-2 h-2" /></a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
