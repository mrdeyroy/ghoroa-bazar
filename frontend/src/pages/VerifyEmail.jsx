import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import axios from "axios";

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.post("http://localhost:5000/api/users/verify-email", { email, otp });
      setSuccess("Email verified successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setSuccess("");

    try {
      await axios.post("http://localhost:5000/api/users/resend-otp", { email });
      setSuccess("New OTP sent to your email!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 py-20">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-100">
        <div className="p-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full text-green-600 mb-4 shadow-inner">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-neutral-800">Verify Your Email</h1>
            <p className="text-neutral-500 mt-2">
              We've sent a 6-digit code to <span className="font-bold text-neutral-700">{email}</span>
            </p>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 font-medium border border-red-100">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-6 font-medium border border-green-100">{success}</div>}

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-neutral-700 ml-1">Enter Verification Code</label>
              <input
                required
                type="text"
                maxLength="6"
                placeholder="000000"
                className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all placeholder:text-neutral-300"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <button
              disabled={loading || otp.length !== 6}
              type="submit"
              className="w-full py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify Email"}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4">
            <button 
              onClick={handleResend}
              disabled={resending}
              className="text-sm font-bold text-green-700 hover:underline flex items-center gap-1 disabled:opacity-50"
            >
              {resending ? <Loader2 className="animate-spin" size={14} /> : "Resend Code"}
            </button>
            <button 
              onClick={() => navigate("/signup")}
              className="text-neutral-500 text-sm hover:text-neutral-800 font-medium"
            >
              Use a different email address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
