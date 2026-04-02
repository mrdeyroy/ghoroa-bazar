import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingCart, ArrowRight, Star, ShieldCheck, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function Hero() {
  const images = [
    "https://randomuser.me/api/portraits/men/32.jpg",
    "https://randomuser.me/api/portraits/women/44.jpg",
    "https://randomuser.me/api/portraits/men/86.jpg",
    "https://randomuser.me/api/portraits/women/12.jpg",
  ];

  // Mouse parallax motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth out the mouse movement for a buttery parallax effect
  const springConfig = { damping: 25, stiffness: 100, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Parallax transforms based on Mouse XY (-1 to 1)
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) * 2 - 1; // -1 to 1
      const y = (e.clientY / innerHeight) * 2 - 1; // -1 to 1
      mouseX.set(x);
      mouseY.set(y);
    };
    
    // Only add listener if on a desktop/device with mouse
    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("mousemove", handleMouseMove);
    }
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Different translation depths for Parallax Layers
  // Background moves slightly opposite
  const bgTranslateX = useTransform(smoothMouseX, [-1, 1], [-15, 15]);
  const bgTranslateY = useTransform(smoothMouseY, [-1, 1], [-15, 15]);
  
  // Midground (Image) moves with mouse deeply
  const midTranslateX = useTransform(smoothMouseX, [-1, 1], [-30, 30]);
  const midTranslateY = useTransform(smoothMouseY, [-1, 1], [-30, 30]);

  // Floating badges move the most
  const floatTranslateX = useTransform(smoothMouseX, [-1, 1], [-50, 50]);
  const floatTranslateY = useTransform(smoothMouseY, [-1, 1], [-50, 50]);

  return (
    <section className="relative w-full min-h-[60vh] md:min-h-[75vh] flex items-center justify-center overflow-hidden bg-white selection:bg-[#1f7a3b] selection:text-white pb-8 pt-6 lg:py-12">
      
      {/* 1. SEAMLESS BACKGROUND & GRADIENT BLOBS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Soft base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-white to-emerald-50/40" />

        {/* Animated fluid blobs */}
        <motion.div 
          style={{ x: bgTranslateX, y: bgTranslateY }}
          className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] md:w-[40vw] md:h-[40vw] bg-green-200/40 rounded-full blur-[100px] mix-blend-multiply"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          style={{ x: bgTranslateX, y: bgTranslateY }}
          className="absolute -bottom-[10%] -right-[10%] w-[60vw] h-[60vw] md:w-[45vw] md:h-[45vw] bg-emerald-200/30 rounded-full blur-[120px] mix-blend-multiply"
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          style={{ x: bgTranslateX, y: bgTranslateY }}
          className="absolute top-[20%] right-[15%] w-[40vw] h-[40vw] md:w-[35vw] md:h-[35vw] bg-yellow-100/40 rounded-full blur-[90px] mix-blend-multiply"
          animate={{ scale: [1, 1.5, 1], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-8 justify-between">
        
        {/* TEXT CONTENT */}
        <div className="flex-1 w-full flex flex-col items-center lg:items-start text-center lg:text-left z-20">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md text-[#1f7a3b] rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest mb-6 border border-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
          >
            <Zap size={14} className="fill-[#1f7a3b]" />
            <span>Trusted Natural Grocery Store</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.2rem] font-black text-gray-900 leading-[1.05] tracking-tight mb-6 drop-shadow-sm"
          >
            Fresh <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f7a3b] to-[#28a745]">Groceries</span>
            <br />
            Delivered to <br className="hidden lg:block"/> Your Doorstep
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-gray-600 text-lg md:text-xl font-medium max-w-md mx-auto lg:mx-0 mb-10 leading-relaxed"
          >
            Experience the pure goodness of nature delivered fresh. Sourced directly from local farms with artisanal quality, making healthy eating joyful and effortless.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link to="/products" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(31, 122, 59, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#165a2a] to-[#1f7a3b] text-white rounded-full font-bold uppercase text-sm tracking-wide shadow-xl transition-all"
              >
                Shop Now
                <ShoppingCart size={18} />
              </motion.button>
            </Link>
            <Link to="/products" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white/70 backdrop-blur-md text-gray-800 border border-white rounded-full font-bold uppercase text-sm tracking-wide shadow-lg hover:bg-white transition-all group"
              >
                Explore More
                <motion.div
                  className="inline-block"
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <ArrowRight size={18} className="group-hover:translate-x-1 group-hover:text-[#1f7a3b] transition-transform duration-300" />
                </motion.div>
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust Indicators inside Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="mt-12 pt-6 border-t border-gray-200/60 w-full max-w-md mx-auto lg:mx-0 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start"
          >
            <div className="flex -space-x-3">
              {images.map((img, i) => (
                <motion.img 
                  key={i} 
                  src={img} 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + (i * 0.1), type: "spring", stiffness: 200 }}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-white shadow-sm relative z-10" 
                  style={{ zIndex: images.length - i }}
                  alt="Customer avatar" 
                />
              ))}
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-1 justify-center sm:justify-start mb-1">
                {[1,2,3,4,5].map(n => <Star key={n} size={14} className="fill-yellow-400 text-yellow-400" />)}
                <span className="text-sm font-black text-gray-900 ml-1 drop-shadow-sm">4.8/5 Ratings</span>
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Trusted by 10k+ customers</p>
            </div>
          </motion.div>
        </div>

        {/* INTEGRATED HERO IMAGE (FLOATING/PARALLAX) */}
        <motion.div 
          style={{ x: midTranslateX, y: midTranslateY }}
          className="flex-1 w-full max-w-[600px] lg:max-w-none relative z-10 flex items-center justify-center lg:justify-end mt-8 lg:mt-0 pointer-events-none"
        >
          {/* Main Floating Image Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotate: 0,
              y: [0, -12, 0] 
            }}
            transition={{ 
              opacity: { duration: 1.2, delay: 0.2, ease: "easeOut" },
              scale: { duration: 1.2, delay: 0.2, ease: "easeOut" },
              rotate: { duration: 1.2, delay: 0.2, ease: "easeOut" },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square max-w-[500px]"
          >
            {/* Soft inner glow behind image */}
            <div className="absolute inset-0 bg-[#1f7a3b]/10 blur-[80px] rounded-full transform scale-90" />
            
            <div className="relative w-full h-full rounded-[40px] md:rounded-[60px] lg:rounded-[80px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(31,122,59,0.3)] ring-4 md:ring-8 ring-white/60">
              <img 
                src="/assets/banner.png" 
                alt="Fresh Groceries" 
                className="w-full h-full object-cover object-center scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#003816]/30 via-transparent to-transparent opacity-60" />
            </div>
            
            {/* FLOATING BADGE 1 */}
            <motion.div 
              style={{ x: floatTranslateX, y: floatTranslateY }}
              className="absolute top-4 -left-4 md:top-[12%] md:-left-[10%] bg-white/80 backdrop-blur-xl p-3 md:p-4 rounded-2xl shadow-xl shadow-[#1f7a3b]/10 border border-white flex items-center gap-3 z-30 pointer-events-auto hover:bg-white transition-colors cursor-default"
              initial={{ opacity: 0, x: -30, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 100 }}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-full flex items-center justify-center text-[#1f7a3b]">
                <ShieldCheck size={22} className="md:w-6 md:h-6" />
              </div>
              <div>
                <span className="block text-xs md:text-sm font-black text-gray-900 leading-tight">100% Organic</span>
                <span className="block text-[10px] md:text-xs text-gray-500 font-bold">Quality Assured</span>
              </div>
            </motion.div>

            {/* FLOATING BADGE 2 */}
            <motion.div 
              style={{ x: floatTranslateX, y: floatTranslateY }}
              className="absolute bottom-4 -right-4 md:bottom-[15%] md:-right-[8%] bg-white/80 backdrop-blur-xl p-3 md:p-4 rounded-2xl shadow-xl shadow-yellow-900/10 border border-white flex items-center gap-3 z-30 pointer-events-auto hover:bg-white transition-colors cursor-default"
              initial={{ opacity: 0, x: 30, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1.1, type: "spring", stiffness: 100 }}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#fffdf0] rounded-full flex items-center justify-center text-yellow-500">
                <Star size={22} className="fill-yellow-400 md:w-6 md:h-6" />
              </div>
              <div>
                <span className="block text-xs md:text-sm font-black text-gray-900 leading-tight">Top Rated</span>
                <span className="block text-[10px] md:text-xs text-gray-500 font-bold">Local Farmers</span>
              </div>
            </motion.div>

          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
