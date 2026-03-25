import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

// Assets
import groceryFavicon from "../assets/grocery_favicon.jpg";
import bgImage from "../assets/fruits.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isAdmin
        ? import.meta.env.VITE_API_URL + "/api/admin/login"
        : import.meta.env.VITE_API_URL + "/api/users/login";

      const res = await axios.post(endpoint, { email, password });

      if (isAdmin) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("adminLoggedIn", "true");
        navigate("/admin/dashboard");
      } else {
        login(res.data.user, res.data.accessToken);
        navigate("/");
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Please verify your email first.");
        setTimeout(() => navigate("/verify-email", { state: { email } }), 2000);
      } else {
        setError(err.response?.data?.error || "Login failed. Check your credentials.");
      }
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
          {/* Dark Overlay for text readability over the background image */}
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
                Welcome Back
              </h2>
              <p className="text-[#FFFDD0]/90 font-medium text-lg max-w-sm drop-shadow-sm">
                Log in to explore fresh groceries delivered right to your doorstep.
              </p>
            </motion.div>
          </div>

          <div className="relative z-10 mt-12 md:mt-24">
            <div className="w-full h-40 md:h-56 rounded-2xl bg-[#E0FFC2]/90 backdrop-blur-md flex flex-col items-center justify-center border border-white/20 shadow-xl overflow-hidden group">
              <div className="w-20 h-20 bg-white rounded-2xl p-1 shadow-inner mb-4 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <img src={groceryFavicon} alt="Watermark Logo" className="w-10 h-10 object-cover rounded-xl" />
              </div>
              <p className="text-[#064734] font-bold uppercase tracking-widest text-sm drop-shadow-sm">Freshness Guaranteed</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-[#FFFDD0]">
          <div className="max-w-md w-full mx-auto">
            <h3 className="text-2xl font-bold text-[#064734] mb-8">Sign in to your account</h3>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`p-4 rounded-xl text-sm mb-6 font-semibold flex items-start gap-2 shadow-sm border ${error.includes('verify') ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-red-100 text-red-800 border-red-200'}`}
              >
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
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

              <div className="space-y-1.5 group">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-[#064734]">Password</label>
                  {!isAdmin && (
                    <Link to="/forgot-password" size="sm" className="text-xs font-bold text-[#064734] hover:text-[#064734]/70 transition-colors">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#064734]/50 group-focus-within:text-[#064734] transition-colors" size={20} />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-[#E0FFC2]/40 border border-[#064734]/20 rounded-xl focus:ring-4 focus:ring-[#E0FFC2] focus:border-[#064734] outline-none transition-all shadow-sm text-[#064734] font-medium placeholder:text-[#064734]/30"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className="flex items-center gap-2 py-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-[#064734]/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#FFFDD0] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#064734]"></div>
                  <span className="ml-3 text-sm font-bold text-[#064734] flex items-center gap-1">
                    Login as Admin <ShieldCheck size={16} className="text-[#064734]" />
                  </span>
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="w-full py-4 bg-[#064734] hover:bg-[#064734]/90 text-[#E0FFC2] font-bold text-lg rounded-xl transition-all shadow-[0_8px_20px_rgba(6,71,52,0.2)] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={22} /> : "Login"}
              </motion.button>
            </form>

            {!isAdmin && (
              <div className="mt-8 text-center text-[#064734]/80 font-medium">
                Don't have an account?{" "}
                <Link to="/signup" className="text-[#064734] font-bold hover:underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
