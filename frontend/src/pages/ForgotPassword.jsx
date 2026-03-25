import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, Send } from "lucide-react";

import { motion } from "framer-motion";

// Assets
import groceryFavicon from "../assets/grocery_favicon.jpg";
import bgImage from "../assets/fruits.jpg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");


    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");

      setSuccess("Password reset link sent to your email!");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E0FFC2] flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-5xl bg-[#FFFDD0] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-[#E0FFC2]"
      >
        {/* Left Side: Branding & Picture Background */}
        <div 
          className="w-full md:w-1/2 p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#064734]/10 relative overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          {/* Dark Overlay for max text readable */}
          <div className="absolute inset-0 bg-[#064734]/80 backdrop-blur-[2px]"></div>

          <div className="relative z-10">
            {/* Logo Usage on Light Background wrapper */}
            <Link to="/" className="inline-block mb-10 group bg-[#FFFDD0] p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <img src="/gblogo.png" alt="Ghoroa Bazar Logo" className="h-16 md:h-20 w-auto object-contain transform group-hover:-rotate-2 transition-transform duration-300" />
            </Link>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#E0FFC2] leading-tight mb-4 drop-shadow-md">
                Recover Access
              </h2>
              <p className="text-[#FFFDD0]/90 font-medium text-lg max-w-sm drop-shadow-sm">
                Don't worry, happen to the best of us. We'll help you get back to your fresh groceries in no time.
              </p>
            </motion.div>
          </div>
          
          <div className="relative z-10 mt-12 md:mt-24">
            <div className="w-full h-40 md:h-56 rounded-2xl bg-[#E0FFC2]/90 backdrop-blur-md flex flex-col items-center justify-center border border-[#064734]/10 shadow-xl overflow-hidden group">
              <div className="w-20 h-20 bg-white rounded-2xl p-1 shadow-inner mb-4 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <img src={groceryFavicon} alt="Watermark Logo" className="w-full h-full object-cover rounded-xl" />
              </div>
              <p className="text-[#064734] font-bold uppercase tracking-widest text-sm drop-shadow-sm">Fast Recovery</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-[#FFFDD0]">
          <div className="max-w-md w-full mx-auto">
            
            <Link to="/login" className="inline-flex items-center text-[#064734]/60 hover:text-[#064734] transition-colors mb-6 text-sm font-bold uppercase tracking-wide group">
              <ArrowLeft size={16} className="mr-2 transform group-hover:-translate-x-1 transition-transform" /> 
              Back to Login
            </Link>

            <h3 className="text-3xl font-extrabold text-[#064734] mb-2">Forgot Password?</h3>
            <p className="text-[#064734]/70 font-medium mb-8">
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-xl text-sm mb-6 font-semibold flex items-start gap-2 shadow-sm border bg-red-100 text-red-800 border-red-200"
              >
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-xl text-sm mb-6 font-bold flex items-start gap-2 shadow-sm border bg-[#E0FFC2] text-[#064734] border-[#064734]/20"
              >
                <span>{success}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5 group">
                <label className="text-sm font-bold text-[#064734]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#064734]/50 group-focus-within:text-[#064734] transition-colors" size={20} />
                  <input
                    required
                    type="email"
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#E0FFC2]/40 border border-[#064734]/20 rounded-xl focus:ring-4 focus:ring-[#E0FFC2] focus:border-[#064734] outline-none transition-all shadow-sm text-[#064734] font-medium placeholder:text-[#064734]/30"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="w-full py-4 bg-[#064734] hover:bg-[#064734]/90 text-[#E0FFC2] font-bold text-lg rounded-xl transition-all shadow-[0_8px_20px_rgba(6,71,52,0.2)] disabled:opacity-70 flex items-center justify-center gap-3 mt-4"
              >
                {loading ? <Loader2 className="animate-spin" size={22} /> : (
                  <>
                    <Send size={20} className="mb-0.5" />
                    Send Reset Link
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
