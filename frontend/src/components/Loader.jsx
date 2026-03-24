/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import logoSrc from "../assets/grocery_favicon.jpg";

export default function Loader({ isLoading }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="global-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f2fbf4] overflow-hidden"
        >
          {/* subtle ambient background glow */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.3, 0.15],
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-green-200 blur-[100px]"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.25, 0.1],
              }}
              transition={{
                repeat: Infinity,
                duration: 5,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-green-300 blur-[100px]"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Interactive Organic Loader Rings */}
            <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#1F7A3B] border-r-[#4ade80] opacity-90 drop-shadow-sm"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                className="absolute inset-3 rounded-full border-[3px] border-transparent border-b-[#22c55e] border-l-[#14532d] opacity-70"
              />

              {/* Pulsing Inner Element */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.1, 0.8] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#1F7A3B] to-[#4ade80] rounded-full shadow-lg shadow-green-500/30 overflow-hidden"
              >
                <img 
                  src={logoSrc} 
                  alt="Loading..." 
                  className="w-10 h-10 object-contain grayscale contrast-200 invert mix-blend-screen" 
                />
              </motion.div>
            </div>

            {/* Brand Identity */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#0c7a43] to-[#4ade80]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Ghoroa Bazar
            </motion.h1>

            {/* Tagline Animation */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-[#6b7280] text-sm md:text-base font-semibold tracking-[0.2em] uppercase"
            >
              Freshness on the way...
            </motion.p>

            {/* Sleek Progress Indicator */}
            <motion.div
              className="mt-10 w-48 h-[3px] bg-gray-200 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-[#1F7A3B] via-[#4ade80] to-[#1F7A3B] bg-[length:200%_auto]"
                initial={{ width: "0%" }}
                animate={{ width: "100%", backgroundPosition: ["0% center", "200% center"] }}
                transition={{
                  width: { duration: 1.5, ease: "easeInOut" },
                  backgroundPosition: { repeat: Infinity, duration: 2, ease: "linear" }
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
