import { useState, useRef, useEffect } from "react";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  Star,
  ChevronRight,
  TrendingUp,
  Award,
  CircleDollarSign
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { user } = useAuth();
  const chatEndRef = useRef(null);
  
  // Chat History
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: "bot", 
      text: "👋 Hello! I'm your Ghoroa Bazar assistant. How can I help you discover something healthy today?", 
      options: [
        { label: "Show best products", icon: <Award size={14} /> },
        { label: "Recommend me something", icon: <Bot size={14} /> },
        { label: "Products under ₹500", icon: <CircleDollarSign size={14} /> },
        { label: "View trending items", icon: <TrendingUp size={14} /> }
      ] 
    }
  ]);
  const [loading, setLoading] = useState(false);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleOptionClick = async (option) => {
    const userMsg = { id: Date.now(), type: "user", text: option };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      let res, data;
      const baseUrl = import.meta.env.VITE_API_URL + "/api/products";
      
      if (option === "Show best products") {
        res = await fetch(`${baseUrl}?featured=true&limit=4`);
      } else if (option === "Recommend me something") {
        res = await fetch(`${baseUrl}?limit=4`);
      } else if (option === "Products under ₹500") {
        res = await fetch(`${baseUrl}`);
        data = await res.json();
        data = Array.isArray(data) ? data.filter(p => p.price < 500).slice(0, 4) : [];
      } else if (option === "View trending items") {
        res = await fetch(`${baseUrl}?limit=4`);
      }

      if (!data && res) data = await res.json();

      if (data && data.length > 0) {
        setMessages(prev => [
          ...prev, 
          { 
            id: Date.now() + 1, 
            type: "bot", 
            text: `Here are some ${option.toLowerCase()} for you:`,
            products: data 
          }
        ]);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, type: "bot", text: "I couldn't find any products matching that right now. Try another option!" }]);
      }
    } catch (error) {
      console.error("Chatbot Fetch Error:", error);
      setMessages(prev => [...prev, { id: Date.now() + 1, type: "bot", text: "Oops! I'm having trouble connecting to our store. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), type: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: "bot", text: "Please contact us for more personalized support at 9876543XXX or email us at support@ghoroabazar.com" }]);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50, x: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="pointer-events-auto w-[calc(100vw-2rem)] xs:w-[350px] sm:w-[380px] h-[65vh] sm:h-[520px] max-h-[calc(100vh-180px)] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-gray-100 origin-bottom-right"
          >
            {/* Header */}
            <div className="bg-[#1f7a3b] p-5 text-white flex justify-between items-center shadow-lg relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md relative border border-white/30">
                  <Bot size={26} className="text-white" />
                  <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 border-2 border-[#1f7a3b] rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight leading-none mb-1 text-white">Store Chat</h3>
                  <div className="flex items-center gap-1.5 opacity-90 text-[10px] font-bold uppercase tracking-wider text-white">
                     Online Now
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="bg-black/10 hover:bg-black/20 p-2 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#f0f2f5] space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm font-medium ${
                    msg.type === "user" ? "bg-[#1f7a3b] text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                  }`}>
                    {msg.text}
                  </div>
                  
                  {msg.options && (
                    <div className="grid gap-2 mt-3 w-full">
                      {msg.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleOptionClick(opt.label)}
                          className="flex items-center justify-between bg-white text-green-700 p-3 rounded-xl text-xs font-bold hover:bg-green-50 transition-all border border-green-100 shadow-sm"
                        >
                          <div className="flex items-center gap-2 text-green-700 font-bold">
                             <span className="text-green-600">{opt.icon}</span>
                             {opt.label}
                          </div>
                          <ChevronRight size={14} className="opacity-40" />
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.products && (
                    <div className="grid gap-3 mt-3 w-full">
                      {msg.products.map((p) => (
                        <Link key={p._id} to={`/product/${p._id}`} onClick={() => setIsOpen(false)} className="flex gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <img src={p.image} className="w-16 h-16 object-cover rounded-lg bg-gray-50 flex-shrink-0" alt="" />
                          <div className="flex flex-col justify-center min-w-0">
                            <h4 className="font-bold text-xs truncate text-gray-800">{p.name}</h4>
                            <p className="text-green-600 font-extrabold text-xs mt-0.5">₹{p.price}</p>
                            <div className="flex items-center gap-1 mt-1 text-[9px] text-[#1f7a3b] font-bold">
                               View Details <ChevronRight size={10} />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {loading && <div className="text-[10px] text-gray-400 font-bold ml-2 animate-pulse">Bot is thinking...</div>}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message..."
                className="flex-1 bg-gray-100 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1f7a3b]"
              />
              <button type="submit" className="bg-[#1f7a3b] text-white p-2.5 rounded-full hover:bg-[#185e2e] transition-colors">
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="pointer-events-auto bg-[#1f7a3b] text-white p-4 rounded-full shadow-2xl relative mb-16"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </span>
        )}
      </motion.button>

      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.02);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(31, 122, 59, 0.2);
            border-radius: 10px;
          }
        `}
      </style>
    </div>
  );
}
