import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingCart, ArrowRight, Star, ShieldCheck, Zap } from "lucide-react";

export default function Hero() {
  const images = [
    "https://randomuser.me/api/portraits/men/32.jpg",
    "https://randomuser.me/api/portraits/women/44.jpg",
    "https://randomuser.me/api/portraits/men/86.jpg",
    "https://randomuser.me/api/portraits/women/12.jpg",
  ];

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(31,122,59,0.05),transparent)] py-12 md:py-20 lg:py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* LEFT CONTENT */}
          <div className="flex-1 text-center lg:text-left z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-[#1f7a3b] rounded-full font-black text-[10px] uppercase tracking-widest mb-6 border border-green-100"
            >
              <Zap size={14} className="fill-[#1f7a3b]" />
              <span>Trusted Natural Grocery Store</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-8"
            >
              Your One-Stop Shop for <br />
              <span className="text-[#1f7a3b]">Quality Groceries</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 text-lg md:text-xl font-medium max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              Experience the pure goodness of nature delivered fresh to your doorstep. Sourced directly from local farms with artisanal quality.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <Link 
                to="/products"
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-[#005a2f] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-green-900/20 hover:scale-105 active:scale-95 transition-all group"
              >
                Shop Now
                <ShoppingCart size={18} />
              </Link>
              <Link 
                to="/products"
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-white text-gray-800 border-2 border-gray-100 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-gray-50 transition-all group"
              >
                View All Products
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start border-t border-gray-100 pt-8"
            >
               <div className="flex -space-x-3">
                  {images.map((img, i) => (
                    <img key={i} src={img} className="w-10 h-10 rounded-full border-4 border-white shadow-sm" alt="User" />
                  ))}
               </div>
               <div className="text-center sm:text-left">
                  <div className="flex items-center gap-1 justify-center sm:justify-start mb-1">
                    {[1,2,3,4,5].map(n => <Star key={n} size={14} className="fill-yellow-400 text-yellow-400" />)}
                    <span className="text-sm font-black text-gray-900 ml-1">4.8 Ratings</span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Trusted by 10k+ happy customers</p>
               </div>
            </motion.div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="flex-1 relative w-full max-w-2xl">
             <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative z-0"
             >
                {/* Main Image */}
                <div className="relative rounded-[40px] overflow-hidden lg:rounded-[80px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] ring-8 ring-white/50 ring-offset-4 ring-offset-transparent">
                  <img 
                    src="/src/assets/hero-banner.png" 
                    alt="Fresh Groceries" 
                    className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-[2s]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent pointer-events-none" />
                </div>

                {/* Floating Badges */}
                <motion.div 
                   animate={{ y: [0, -15, 0] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute -top-6 -right-6 md:right-0 bg-white p-4 rounded-3xl shadow-2xl border border-gray-50 flex items-center gap-4 z-20"
                >
                   <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-[#1f7a3b]">
                     <Zap size={24} className="fill-[#1f7a3b]" />
                   </div>
                   <div>
                     <span className="block text-xs font-black text-gray-900 leading-none mb-1">Fast Delivery</span>
                     <span className="block text-[10px] text-gray-400 font-bold">Within 24 Hours</span>
                   </div>
                </motion.div>

                <motion.div 
                   animate={{ y: [0, 15, 0] }}
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                   className="absolute -bottom-6 -left-6 md:left-0 bg-white p-4 rounded-3xl shadow-2xl border border-gray-50 flex items-center gap-4 z-20"
                >
                   <div className="w-12 h-12 bg-[#ffa500]/10 rounded-2xl flex items-center justify-center text-[#ffa500]">
                     <ShieldCheck size={24} />
                   </div>
                   <div>
                     <span className="block text-xs font-black text-gray-900 leading-none mb-1">Secure Payment</span>
                     <span className="block text-[10px] text-gray-400 font-bold">100% Safe Checkout</span>
                   </div>
                </motion.div>
             </motion.div>

             {/* Background Decorations */}
             <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#1f7a3b]/5 blur-[100px] rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
