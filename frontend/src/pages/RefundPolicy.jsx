import React from 'react';
import { 
  RefreshCcw, 
  ShieldCheck, 
  Clock, 
  Package, 
  XCircle, 
  CreditCard, 
  Truck, 
  HelpCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-[#FFFDD0]/30 py-12 md:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-[#E0FFC2] rounded-2xl mb-6 shadow-sm">
            <RefreshCcw className="text-[#064734] w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#064734] mb-4 tracking-tight">
            Refund & Return <span className="text-[#ffa500]">Policy</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            At Ghoroa Bazar, your satisfaction is our top priority. We strive to provide the freshest and highest quality products 
            directly from nature to your doorstep.
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-green-900/5 border border-green-100 mb-10 transform transition-all hover:shadow-2xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-2 bg-green-50 rounded-lg">
              <ShieldCheck className="text-[#064734] w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#064734] mb-2">Quality Assurance</h2>
              <p className="text-gray-600 leading-relaxed">
                We take immense pride in the quality of our products. However, we understand that issues may occasionally arise. 
                Our refund and return policy is designed to be fair, transparent, and user-friendly to ensure you have a 
                seamless shopping experience.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Return Eligibility */}
          <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-green-100">
            <div className="flex items-center gap-3 mb-6">
              <Package className="text-[#ffa500] w-6 h-6" />
              <h3 className="text-xl font-bold text-[#064734]">Return Eligibility</h3>
            </div>
            <ul className="space-y-4 text-gray-600">
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ffa500] mt-2 shrink-0"></div>
                <span>Products must be <strong>damaged, defective, or incorrect</strong> upon arrival.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ffa500] mt-2 shrink-0"></div>
                <span>Requests must be raised within <strong>24–48 hours</strong> of delivery.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ffa500] mt-2 shrink-0"></div>
                <span>Items must be unused and in their original packaging.</span>
              </li>
            </ul>
          </div>

          {/* Non-Returnable Items */}
          <div className="bg-orange-50/50 rounded-[2rem] p-8 shadow-lg border border-orange-100">
            <div className="flex items-center gap-3 mb-6">
              <XCircle className="text-red-500 w-6 h-6" />
              <h3 className="text-xl font-bold text-[#064734]">Non-Returnable Items</h3>
            </div>
            <ul className="space-y-4 text-gray-600">
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></div>
                <span><strong>Perishable goods:</strong> Fruits, vegetables, dairy, and fresh bakery items.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></div>
                <span>Opened or partially used products.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></div>
                <span>Items purchased under clearance or flash sales.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Refund Process */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-lg border border-green-100 mb-10">
          <div className="flex items-center gap-3 mb-8">
            <CreditCard className="text-blue-500 w-7 h-7" />
            <h2 className="text-2xl font-bold text-[#064734]">Refund Policy</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 text-center">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-[#064734] font-bold mb-1">Inspection</div>
              <div className="text-sm text-gray-500">Processed after validation</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-[#064734] font-bold mb-1">Timeline</div>
              <div className="text-sm text-gray-500">5–7 business days</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-[#064734] font-bold mb-1">Credit</div>
              <div className="text-sm text-gray-500">To original payment method</div>
            </div>
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">
            Refunds are typically processed to your original payment method. For <strong>Cash on Delivery (COD)</strong> orders, 
            you can choose between a direct bank transfer or store credit in your Ghoroa Bazar wallet.
          </p>
          
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>Bank processing times may vary depending on your financial institution.</span>
          </div>
        </div>

        {/* Replacement & Cancellation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-green-100">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCcw className="text-green-600 w-6 h-6" />
              <h3 className="text-xl font-bold text-[#064734]">Replacement</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Replacements are available for damaged or incorrect items, subject to availability in our stock.
            </p>
            <div className="text-xs font-bold text-[#064734]/50 uppercase tracking-widest">
              Subject to stock availability
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-green-100">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="text-indigo-500 w-6 h-6" />
              <h3 className="text-xl font-bold text-[#064734]">Cancellation</h3>
            </div>
            <p className="text-gray-600">
              Orders can be cancelled before dispatch. Once an order is shipped, cancellation may no longer be possible.
            </p>
          </div>
        </div>

        {/* How to Request */}
        <div className="bg-[#064734] text-white rounded-[2rem] p-8 md:p-12 shadow-xl mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <FileText size={120} />
          </div>
          
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <HelpCircle className="text-[#ffa500]" />
            How to Request a Return/Refund
          </h2>

          <div className="space-y-6 relative z-10">
            {[
              { step: 1, text: 'Log in and navigate to "My Orders" in your profile.' },
              { step: 2, text: 'Select the product you wish to return or refund.' },
              { step: 3, text: 'Click the "Request Return" button.' },
              { step: 4, text: 'Upload clear images or a short video of the concern (damage/defect).' },
              { step: 5, text: 'Submit your request for our team to review.' }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#ffa500] flex items-center justify-center font-bold text-[#064734] shrink-0 shadow-lg">
                  {item.step}
                </div>
                <p className="text-[#E0FFC2]/90 font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact info */}
        <div className="text-center py-10">
          <h3 className="text-[#064734] font-bold mb-4">Still have questions?</h3>
          <p className="mb-6 text-gray-500">Our customer support team is here to help you 24/7.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:support@ghoroabazar.com" className="px-8 py-3 bg-[#ffa500] text-white rounded-full font-bold hover:shadow-lg hover:bg-orange-600 transition-all flex items-center gap-2">
              Email Support
            </a>
            <a href="tel:+91880019300X" className="px-8 py-3 bg-white text-[#064734] border-2 border-[#064734] rounded-full font-bold hover:bg-[#064734] hover:text-white transition-all">
              Call Us: +91 880019300X
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
