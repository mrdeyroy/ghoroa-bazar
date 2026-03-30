import { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  Clock,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Facebook,
  Instagram,
  Twitter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../config/api";

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || ""
      }));
    }
  }, [user]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      return showToast("Please fill all required fields", "error");
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/contact`, { credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error("Failed to send message");

      showToast("Thank you! Your message has been sent successfully. ✅");
      setForm({
        name: user?.name || "",
        email: user?.email || "",
        subject: "",
        message: ""
      });
    } catch (err) {
      showToast("Something went wrong. Please try again later. ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  const contactInfos = [
    {
      icon: <Phone className="text-green-600" size={24} />,
      title: "Call Us",
      details: ["+91 880019300X"],
      sub: "Mon - Sat, 9am - 7pm"
    },
    {
      icon: <Mail className="text-orange-500" size={24} />,
      title: "Email Us",
      details: ["contact@ghoroabazar.shop"],
      sub: "24/7 Support available"
    },
    {
      icon: <MapPin className="text-blue-500" size={24} />,
      title: "Our Store",
      details: ["Kolkata, West Bengal", "India - 700001"],
      sub: "Visit us for quality products"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fbfcfa] pt-20 pb-24 px-4">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-white border-green-100 text-gray-800'
              }`}
          >
            {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 className="text-green-600" size={20} />}
            <span className="font-bold">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* HERO HEADER */}
        <div className="text-center mb-20 space-y-4">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="px-4 py-1.5 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-green-100"
          >
            Always Here For You
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight"
          >
            Let's Start a <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800">Conversation</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto"
          >
            Have a question, feedback, or just want to say hi? We'd love to hear from you.
            Our team is always ready to assist you.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* LEFT: INFO & SOCIALS */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-6">
              {contactInfos.map((info, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-green-50/50 transition-all group"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-green-50">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 mb-2">{info.title}</h3>
                      {info.details.map((detail, dIdx) => (
                        <p key={dIdx} className="text-gray-500 font-bold mb-1">{detail}</p>
                      ))}
                      <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mt-3 flex items-center gap-2">
                        <Clock size={12} className="text-green-600" />
                        {info.sub}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="p-8 bg-gray-900 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-8"
            >
              <div>
                <h4 className="text-xl font-black mb-1 italic">Follow our journey</h4>
                <p className="text-gray-400 text-xs">Stay updated with latest offers and news.</p>
              </div>
              <div className="flex gap-4">
                {[Facebook, Instagram, Twitter].map((Icon, i) => (
                  <button key={i} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-green-600 transition-all group active:scale-90">
                    <Icon size={20} className="group-hover:scale-110" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT: CONTACT FORM */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl md:rounded-[50px] p-6 sm:p-8 md:p-14 shadow-2xl shadow-green-100/30 border border-gray-100"
            >
              <div className="mb-12">
                <span className="flex items-center gap-3 text-green-600 font-black uppercase text-xs tracking-[0.2em] mb-4">
                  <div className="w-8 h-px bg-green-600" /> Let's get in touch
                </span>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">Send us a Message</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase text-gray-400 ml-4">Full Name *</label>
                    <input
                      name="name"
                      placeholder="Your Name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-8 py-5 bg-gray-50 rounded-3xl border-2 border-transparent focus:border-green-500 focus:bg-white transition-all outline-none font-bold text-gray-700"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase text-gray-400 ml-4">Email Address *</label>
                    <input
                      name="email"
                      type="email"
                      placeholder="example@mail.com"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-8 py-5 bg-gray-50 rounded-3xl border-2 border-transparent focus:border-green-500 focus:bg-white transition-all outline-none font-bold text-gray-700"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase text-gray-400 ml-4">Subject</label>
                  <input
                    name="subject"
                    placeholder="What would you like to discuss?"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full px-8 py-5 bg-gray-50 rounded-3xl border-2 border-transparent focus:border-green-500 focus:bg-white transition-all outline-none font-bold text-gray-700"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase text-gray-400 ml-4">Your Message *</label>
                  <textarea
                    name="message"
                    placeholder="Tell us everything..."
                    rows="6"
                    value={form.message}
                    onChange={handleChange}
                    className="w-full px-8 py-5 bg-gray-50 rounded-[32px] border-2 border-transparent focus:border-green-500 focus:bg-white transition-all outline-none font-bold text-gray-700 resize-none"
                  />
                </div>

                <button
                  disabled={loading}
                  className="w-full py-6 bg-[#0c180f] text-green-400 rounded-3xl font-black text-base uppercase tracking-[0.2em] shadow-2xl shadow-green-900/40 hover:bg-[#152a1b] hover:text-green-300 transition-all flex items-center justify-center gap-4 group active:scale-[0.98] disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      Send Message
                      <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>

        {/* MAP SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-16 md:mt-24 rounded-3xl md:rounded-[60px] overflow-hidden h-[280px] md:h-[450px] shadow-2xl shadow-green-50 border-4 md:border-8 border-white"
        >
          <iframe
            title="map"
            src="https://www.google.com/maps?q=Kolkata,India&output=embed"
            className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
            loading="lazy"
          />
        </motion.div>
      </div>

    </div>
  );
}
