import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Download, 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  Truck, 
  CreditCard, 
  Calendar,
  Package,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  ExternalLink
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import BackButton from "../components/BackButton";
import { useAuth } from "../context/AuthContext";

export default function Invoice() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Order not found");
        return res.json();
      })
      .then(data => {
        // Ensure data is the order object and not an error message
        if (data && data._id) {
          setOrder(data);
        } else {
          setOrder(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load invoice", err);
        setOrder(null);
        setLoading(false);
      });
  }, [orderId, token]);

  const handleDownloadPDF = () => {
    if (!order) return;

    const doc = new jsPDF();
    const primaryGreen = "#1F7A3B";
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(primaryGreen);
    doc.text("GHOROA BAZAR", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Premium Organic & Natural Products", 14, 26);
    
    doc.setFontSize(20);
    doc.setTextColor(0);
    doc.text("TAX INVOICE", 140, 20);
    
    doc.setFontSize(10);
    const invNo = `INV-${new Date(order.createdAt).getFullYear()}-${order._id.slice(-5).toUpperCase()}`;
    doc.text(`Invoice No: ${invNo}`, 140, 30);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 140, 36);
    
    doc.setDrawColor(230);
    doc.line(14, 45, 196, 45);
    
    // Billing & Shipping info
    doc.setFontSize(11);
    doc.setTextColor(primaryGreen);
    doc.text("SOLD BY / SELLER:", 14, 55);
    doc.text("SHIPPING ADDRESS:", 110, 55);
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    // Seller Info
    doc.text("Ghoroa Bazar Online Services", 14, 61);
    doc.text("123, Organic Street, Nature Park", 14, 67);
    doc.text("Kolkata, West Bengal - 700001", 14, 73);
    doc.text("GSTIN: 19AAXCG1234F1Z5", 14, 79);
    
    // Shipping Info
    const customer = order.customerDetails;
    const customerName = customer?.firstName ? `${customer.firstName} ${customer.lastName}` : (customer?.name || "Customer");
    doc.text(customerName, 110, 61);
    doc.text(customer?.address || "N/A", 110, 67);
    doc.text(`${customer?.city || ""}, ${customer?.state || ""} - ${customer?.zipCode || customer?.pincode || ""}`, 110, 73);
    doc.text(`Contact: ${customer?.phone || "N/A"}`, 110, 79);

    // Order Info
    doc.setDrawColor(240);
    doc.setFillColor(250, 252, 250);
    doc.rect(14, 85, 182, 10, 'F');
    doc.setTextColor(primaryGreen);
    doc.setFontSize(9);
    doc.text(`Order ID: ${order._id}`, 18, 91.5);
    doc.text(`Payment: ${order.paymentMethod || "COD"}`, 80, 91.5);
    doc.text(`Mode: Standard Delivery`, 150, 91.5);

    // Item Table
    const tableData = order.items.map((item, index) => [
      index + 1,
      item.name,
      item.qty,
      `INR ${item.price.toFixed(2)}`,
      `INR ${(item.price * item.qty).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 100,
      head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
      body: tableData,
      headStyles: { fillColor: primaryGreen, textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 80 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 37, halign: 'right' }
      },
      margin: { left: 14, right: 14 }
    });

    // Totals
    const finalY = doc.lastAutoTable?.finalY || 150;
    doc.setTextColor(0);
    doc.setFontSize(10);
    
    doc.text("Total Amount (Excl. Tax):", 130, finalY);
    doc.text(`INR ${(order.totalAmount - (order.totalAmount * 0.05)).toFixed(2)}`, 196, finalY, { align: 'right' });
    
    doc.text("IGST (5%):", 130, finalY + 7);
    doc.text(`INR ${(order.totalAmount * 0.05).toFixed(2)}`, 196, finalY + 7, { align: 'right' });
    
    doc.text("Shipping & Handling:", 130, finalY + 14);
    doc.text("INR 0.00", 196, finalY + 14, { align: 'right' });
    
    doc.setDrawColor(200);
    doc.line(130, finalY + 18, 196, finalY + 18);
    
    doc.setFontSize(12);
    doc.setTextColor(primaryGreen);
    doc.setFont("helvetica", "bold");
    doc.text("Grand Total:", 130, finalY + 25);
    doc.text(`INR ${order.totalAmount.toFixed(2)}`, 196, finalY + 25, { align: 'right' });

    // Amount in words (simplified)
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("Amount in Words: Rupee " + Number(order.totalAmount).toLocaleString('en-IN') + " Only", 14, finalY + 35);

    // Footer
    doc.setTextColor(180);
    doc.text("Return Policy: 7 Days from delivery. Full T&C at ghoroabazar.com", 14, 275);
    doc.text("Quality Guaranteed. Thank you for your business!", 105, 285, { align: 'center' });

    doc.save(`Invoice_${order._id}.pdf`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfcfa]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Generating Invoice...</p>
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center bg-white p-10 rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Invoice Not Found</h2>
        <p className="text-gray-500 mb-8">We couldn't retrieve the details for this order.</p>
        <button onClick={() => navigate("/")} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold">Go Back Home</button>
      </div>
    </div>
  );

  const customer = order.customerDetails;
  const customerName = customer?.firstName ? `${customer.firstName} ${customer.lastName}` : (customer?.name || "Valued Customer");
  const invoiceId = `INV-${new Date(order?.createdAt).getFullYear() || "2026"}-${order?._id?.slice(-5).toUpperCase() || "00000"}`;

  return (
    <div className="min-h-screen bg-[#fbfcfa] py-8 md:py-16 px-4">
      <div className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
        <div>
           <BackButton color="#1F7A3B" margin="0" />
           <h1 className="text-3xl font-black text-gray-900 mt-2 flex items-center gap-3">
             <FileText className="w-8 h-8 text-green-600" />
             Invoice Details
           </h1>
           <p className="text-gray-400 font-medium text-sm mt-1">Official tax document for your reference.</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              className="flex-1 md:flex-none border-2 border-gray-100 bg-white text-gray-700 px-6 py-3.5 rounded-2xl font-black text-sm hover:border-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="flex-1 md:flex-none bg-[#1F7A3B] text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-[#185e2e] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
        </div>
      </div>

      {/* INVOICE CARD */}
      <div 
        ref={invoiceRef}
        className="max-w-4xl mx-auto bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
      >
        {/* Top Header Section */}
        <div className="p-8 md:p-12 border-b-2 border-dashed border-gray-100 bg-gradient-to-br from-white to-green-50/30">
           <div className="flex flex-col md:flex-row justify-between gap-8">
             <div>
                <h2 className="text-3xl font-black text-[#1F7A3B] tracking-tighter">GHOROA BAZAR</h2>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Premium Organic Goods</p>
                <div className="mt-6 flex flex-col gap-1 text-sm text-gray-500 font-medium italic">
                    <p>123, Organic Street, Nature Park</p>
                    <p>Kolkata, West Bengal - 700001</p>
                    <p className="flex items-center gap-2 mt-2 not-italic font-black text-gray-900 text-xs">
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase tracking-tighter">GSTIN</span> 19AAXCG1234F1Z5
                    </p>
                </div>
             </div>
             <div className="text-left md:text-right flex flex-col items-start md:items-end justify-between">
                <div>
                   <span className="bg-green-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">Official Tax Invoice</span>
                   <h3 className="text-2xl font-black text-gray-900 mt-3">{invoiceId}</h3>
                   <div className="flex md:justify-end items-center gap-2 text-gray-400 font-bold text-xs mt-1">
                       <Calendar className="w-3 h-3" />
                       <span>DATE: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                   </div>
                </div>
                <div className="mt-8">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Reference</p>
                    <p className="text-gray-900 font-extrabold text-sm font-mono mt-1">
                      GB-{new Date(order?.createdAt || Date.now()).getFullYear()}-{order?._id?.slice(-6).toUpperCase() || "000000"}
                    </p>
                </div>
             </div>
           </div>
        </div>

        {/* Address & Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 bg-gray-50/50">
            <div className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6 text-green-600">
                    <MapPin className="w-5 h-5" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-900">Delivery Address</h4>
                </div>
                <div className="space-y-1">
                    <p className="font-black text-gray-900">{customerName}</p>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{customer?.address || "N/A"}</p>
                    <p className="text-sm text-gray-500 font-medium">{customer?.city}, {customer?.state} - {customer?.zipCode || customer?.pincode}</p>
                </div>
                <div className="mt-6 flex items-center gap-3 text-sm font-bold text-gray-700">
                    <Phone className="w-4 h-4 text-gray-300" />
                    <span>{customer?.phone || "N/A"}</span>
                </div>
            </div>

            <div className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6 text-green-600">
                    <CreditCard className="w-5 h-5" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-900">Payment Details</h4>
                </div>
                <div className="space-y-4">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Method</p>
                        <p className="text-sm font-black text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            {order.paymentMethod || "COD"}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                        <p className={`text-xs font-black px-3 py-1 rounded-lg inline-block uppercase tracking-wider ${
                            order.paymentStatus === "Paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}>
                           {order.paymentStatus || "Pending"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6 text-green-600">
                    <Truck className="w-5 h-5" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-900">Order Updates</h4>
                </div>
                <div className="space-y-4">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Status</p>
                        <p className="text-sm font-black text-gray-900">{order.orderStatus || "Processing"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Estimated Delivery</p>
                        <p className="text-sm font-black text-gray-900 flex items-center gap-2 italic">
                            Within 3-5 Working Days
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Product Table */}
        <div className="p-8 md:p-12">
            <div className="bg-white border border-gray-100 rounded-[28px] overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <th className="px-6 py-5">#</th>
                            <th className="px-6 py-5">Item Description</th>
                            <th className="px-6 py-5 text-center">Qty</th>
                            <th className="px-6 py-5 text-right">Price</th>
                            <th className="px-6 py-5 text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {order.items.map((item, idx) => (
                            <tr key={idx} className="group hover:bg-green-50/20 transition-colors">
                                <td className="px-6 py-6 text-sm font-black text-gray-300">{idx + 1}</td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center p-1 border border-gray-100 overflow-hidden">
                                            <img src={item.image} alt="" className="w-full h-full object-cover rounded-xl" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-extrabold text-gray-900 group-hover:text-green-700 transition-colors">{item.name}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase mt-0.5 tracking-tighter">Verified Organic</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-sm font-black text-gray-900 text-center">x{item.qty}</td>
                                <td className="px-6 py-6 text-sm font-extrabold text-gray-900 text-right">₹{item.price.toFixed(2)}</td>
                                <td className="px-6 py-6 text-sm font-black text-green-700 text-right">₹{(item.qty * item.price).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Final Totals Section */}
            <div className="mt-12 flex flex-col md:flex-row justify-between gap-12 border-t border-gray-100 pt-10">
                <div className="flex-1 space-y-4">
                    <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100/50">
                        <div className="flex items-center gap-3 text-blue-600 mb-3">
                            <ShieldCheck className="w-5 h-5" />
                            <h5 className="text-xs font-black uppercase tracking-widest italic">Authenticity Guarantee</h5>
                        </div>
                        <p className="text-xs text-blue-500 font-medium leading-relaxed">
                            This products are 100% genuine and verified as organic by Ghoroa Bazar quality check department. For returns, please visit our support portal.
                        </p>
                    </div>
                </div>
                
                <div className="w-full md:w-80 space-y-4">
                    <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                        <span>Items Total</span>
                        <span className="text-gray-900 font-black">₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium text-gray-500 border-b border-gray-100 pb-4">
                        <span>Shipping Charges</span>
                        <span className="text-green-600 font-black italic uppercase text-xs tracking-widest">Free</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-lg font-black text-gray-900">Grand Total</span>
                        <span className="text-2xl font-black text-[#1F7A3B]">₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="pt-4 flex flex-col items-end gap-1">
                        <div className="w-32 h-16 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                            Authorized Stamp
                        </div>
                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mr-2">E-Signed Document</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Extra Footer Decoration */}
        <div className="bg-[#1F7A3B] px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><Package className="w-3 h-3" /> Zero Plastic</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Lab Verified</span>
            </div>
            <p>ghoroabazar.com • All Rights Reserved 2026</p>
        </div>
      </div>

      <div className="mt-12 text-center max-w-sm mx-auto">
          <p className="text-xs text-gray-400 font-medium">Need help with this order? <a href="/contact" className="text-green-600 font-black flex items-center justify-center gap-1 mt-1 hover:underline underline-offset-4">Talk to an expert <ExternalLink className="w-2 h-2" /></a></p>
      </div>
    </div>
  );
}

// Add FileText icon if missing from imports
function FileText({ className }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}
