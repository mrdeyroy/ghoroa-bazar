import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

import { motion } from "framer-motion";


// Assets (Updated to Static Paths)
const groceryFavicon = "/assets/grocery_favicon.jpg";
const bgImage = "/assets/fruits.jpg";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/users/signup", { credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      });
      const data = await res.json();
      if (res.status === 201) {
        navigate("/verify-email", { state: { email: form.email } });
      } else {
        throw new Error(data.error || "Signup failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
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
        className="w-full max-w-5xl bg-[#FFFDD0] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse border border-[#E0FFC2]"
      >
        {/* Right Side / Top Mobile: Branding & Picture */}
        <div
          className="w-full md:w-1/2 p-10 flex flex-col justify-between border-b md:border-b-0 md:border-l border-[#064734]/10 relative overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          {/* Dark Overlay for max text readable */}
          <div className="absolute inset-0 bg-[#064734]/80 backdrop-blur-[2px]"></div>

          <div className="relative z-10 w-full flex justify-end">
            <Link to="/" className="inline-block mb-12 group bg-[#FFFDD0] p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <img src="/gblogo.png" alt="Ghoroa Bazar Logo" className="h-16 md:h-20 w-auto object-contain transform group-hover:rotate-2 transition-transform duration-300" />
            </Link>
          </div>

          <div className="relative z-10 md:text-right">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#E0FFC2] leading-tight mb-4 drop-shadow-md">
                Join the Family
              </h2>
              <p className="text-[#FFFDD0]/90 font-medium text-lg ml-auto md:max-w-sm drop-shadow-sm">
                Create an account to track orders, save favorites, and get the best deals on daily fresh items.
              </p>
            </motion.div>
          </div>

          <div className="relative z-10 mt-12 md:mt-16 w-full flex justify-end">
            <div className="w-full md:w-10/12 h-40 md:h-56 rounded-2xl bg-[#E0FFC2]/90 backdrop-blur-md flex flex-col items-center justify-center border border-[#064734]/10 shadow-xl overflow-hidden group">
              <div className="w-20 h-20 bg-white rounded-2xl p-1 shadow-inner mb-4 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <img src={groceryFavicon} alt="Watermark Logo" className="w-10 h-10 object-cover rounded-xl" />
              </div>
              <p className="text-[#064734] font-bold uppercase tracking-[0.2em] text-xs drop-shadow-sm flex text-center">Premium Quality <br /> Direct to Doorstep</p>
            </div>
          </div>
        </div>

        {/* Left Side / Bottom Mobile: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-[#FFFDD0]">
          <div className="max-w-md w-full mx-auto">
            <h3 className="text-2xl font-bold text-[#064734] mb-8">Create your account</h3>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-red-100 text-red-800 rounded-xl text-sm mb-6 font-semibold flex items-start gap-2 shadow-sm border border-red-200"
              >
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">

              <div className="space-y-1.5 group">
                <label className="text-sm font-bold text-[#064734]">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#064734]/50 group-focus-within:text-[#064734] transition-colors" size={20} />
                  <input
                    required
                    type="text"
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#E0FFC2]/40 border border-[#064734]/20 rounded-xl focus:ring-4 focus:ring-[#E0FFC2] focus:border-[#064734] outline-none transition-all shadow-sm text-[#064734] font-medium placeholder:text-[#064734]/30"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="text-sm font-bold text-[#064734]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#064734]/50 group-focus-within:text-[#064734] transition-colors" size={20} />
                  <input
                    required
                    type="email"
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#E0FFC2]/40 border border-[#064734]/20 rounded-xl focus:ring-4 focus:ring-[#E0FFC2] focus:border-[#064734] outline-none transition-all shadow-sm text-[#064734] font-medium placeholder:text-[#064734]/30"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="text-sm font-bold text-[#064734]">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#064734]/50 group-focus-within:text-[#064734] transition-colors" size={20} />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-[#E0FFC2]/40 border border-[#064734]/20 rounded-xl focus:ring-4 focus:ring-[#E0FFC2] focus:border-[#064734] outline-none transition-all shadow-sm text-[#064734] font-medium placeholder:text-[#064734]/30"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#064734]/50 hover:text-[#064734] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="text-sm font-bold text-[#064734]">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#064734]/50 group-focus-within:text-[#064734] transition-colors" size={20} />
                  <input
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-[#E0FFC2]/40 border border-[#064734]/20 rounded-xl focus:ring-4 focus:ring-[#E0FFC2] focus:border-[#064734] outline-none transition-all shadow-sm text-[#064734] font-medium placeholder:text-[#064734]/30"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#064734]/50 hover:text-[#064734] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="w-full py-4 bg-[#064734] hover:bg-[#064734]/90 text-[#E0FFC2] font-bold text-lg rounded-xl transition-all shadow-[0_8px_20px_rgba(6,71,52,0.2)] disabled:opacity-70 mt-4 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={22} /> : "Create Account"}
              </motion.button>
            </form>

            <div className="mt-8 text-center text-[#064734]/80 font-medium">
              Already have an account?{" "}
              <Link to="/login" className="text-[#064734] font-bold hover:underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
