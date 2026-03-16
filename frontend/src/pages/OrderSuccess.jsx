import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  Truck,
  Package,
  Download,
  Calendar,
  PackageCheck,
  Star,
  ExternalLink,
  FileText
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;
  const [orderId, setOrderId] = useState(order?._id || "GB-" + Math.floor(100000 + Math.random() * 900000));

  const formattedId = orderId.startsWith("GB-") 
    ? orderId 
    : `GB-${new Date().getFullYear()}-${String(orderId).slice(-6).toUpperCase()}`;

  useEffect(() => {
    // Clear billing details as the order is complete
    localStorage.removeItem("billing_details");

    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  const handleDownloadInvoice = () => {
    try {
      const doc = new jsPDF();
      const primaryGreen = "#1F7A3B";
      const safeOrderId = String(orderId || "N/A");

      // Header
      doc.setFontSize(22);
      doc.setTextColor(primaryGreen);
      doc.text("GHOROA BAZAR", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Premium Organic & Natural Products", 14, 26);

      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text("INVOICE", 150, 20);

      doc.setFontSize(10);
      doc.text(`Invoice No: INV-${new Date().getFullYear()}-${safeOrderId.slice(-5).toUpperCase()}`, 150, 28);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 34);

      doc.setDrawColor(230);
      doc.line(14, 40, 196, 40);

      // Billing Details
      doc.setFontSize(11);
      doc.setTextColor(primaryGreen);
      doc.text("BILL TO:", 14, 50);

      doc.setFontSize(10);
      doc.setTextColor(0);
      const customerName = order?.customerDetails?.firstName
        ? `${order.customerDetails.firstName} ${order.customerDetails.lastName}`
        : "Valued Customer";
      doc.text(customerName, 14, 56);
      doc.text(order?.customerDetails?.address || "N/A", 14, 62);
      doc.text(`${order?.customerDetails?.city || ""}, ${order?.customerDetails?.state || ""} - ${order?.customerDetails?.zipCode || ""}`, 14, 68);
      doc.text(`Phone: ${order?.customerDetails?.phone || "N/A"}`, 14, 74);

      // Order Info
      doc.setFontSize(11);
      doc.setTextColor(primaryGreen);
      doc.text("ORDER INFO:", 130, 50);

      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(`Order ID: ${safeOrderId}`, 130, 56);
      doc.text(`Payment: ${order?.paymentMethod || "COD"}`, 130, 62);
      doc.text(`Status: Confirmed`, 130, 68);

      // Table
      const items = order?.items || [];
      const tableData = items.length > 0
        ? items.map(item => [
          item.name,
          item.qty,
          `INR ${Number(item.price || 0).toFixed(2)}`,
          `INR ${(Number(item.price || 0) * Number(item.qty || 0)).toFixed(2)}`
        ])
        : [["Item Details", "1", "INR 0.00", "INR 0.00"]];

      autoTable(doc, {
        startY: 85,
        head: [['Product', 'Qty', 'Price', 'Total']],
        body: tableData,
        headStyles: { fillColor: primaryGreen, textColor: 255 },
        alternateRowStyles: { fillColor: [245, 248, 245] },
      });

      // Summary
      const finalY = doc.lastAutoTable?.finalY || 150;
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text("Subtotal:", 140, finalY + 10);
      doc.text(`INR ${Number(order?.totalAmount || 0).toFixed(2)}`, 175, finalY + 10);

      doc.text("Shipping:", 140, finalY + 16);
      doc.text("FREE", 175, finalY + 16);

      doc.setFontSize(12);
      doc.setTextColor(primaryGreen);
      doc.text("Total Payable:", 140, finalY + 25);
      doc.text(`INR ${Number(order?.totalAmount || 0).toFixed(2)}`, 175, finalY + 25);

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text("This is a computer generated invoice and does not require a signature.", 105, 280, { align: "center" });
      doc.text("Thank you for shopping with Ghoroa Bazar!", 105, 285, { align: "center" });

      doc.save(`Invoice_${safeOrderId}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate invoice. Please try again or view in My Orders.");
    }
  };

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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200 pb-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Order Identifier</p>
                  <p className="text-2xl font-black text-gray-900 font-mono tracking-tight break-all md:break-normal">{formattedId}</p>
                </div>

                <button
                  onClick={handleDownloadInvoice}
                  className="flex items-center justify-center gap-3 bg-white border-2 border-green-600 text-[#1F7A3B] px-6 py-3 rounded-2xl font-black text-sm hover:bg-green-50 active:scale-95 transition-all shadow-md shadow-green-100 group"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="text-left">

                    <p className="leading-none">Download Invoice</p>
                  </div>
                </button>
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
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">ORDER CONFIRMATION</p>
                    <p className="text-sm font-black text-gray-900">View your order details in My Orders</p>
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
              <Link to="/my-orders" className="w-full md:w-auto">
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
