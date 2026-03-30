import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { Megaphone, Trash2, Send, Clock, AlertCircle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { BASE_URL } from "../config/api";

export default function AdminBroadcast() {
  const [message, setMessage] = useState("");
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const token = localStorage.getItem("adminToken");
  const API = BASE_URL;

  // Fetch all broadcasts
  const fetchBroadcasts = async () => {
    try {
      const res = await fetch(`${API}/api/admin/broadcast`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setBroadcasts(data);
    } catch (err) {
      console.error("Failed to fetch broadcasts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  // Send broadcast
  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${API}/api/admin/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: message.trim() })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Broadcast message sent successfully");
        setMessage("");
        fetchBroadcasts();
      } else {
        toast.error(data.error || "Failed to send broadcast");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSending(false);
    }
  };

  // Delete broadcast
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/api/admin/broadcast/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Broadcast deleted");
        setBroadcasts(prev => prev.filter(b => b._id !== id));
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8 sm:mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Broadcast Center</h1>
            <p className="text-gray-400 font-medium mt-1 uppercase tracking-widest text-[8px] sm:text-[10px] pl-1">
              Send announcements to all users in real-time
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black bg-white shadow-sm border border-gray-100 px-4 py-2 rounded-2xl text-gray-400 italic w-fit">
            <Megaphone className="w-3.5 h-3.5 text-green-600" />
            {broadcasts.length} Broadcast{broadcasts.length !== 1 ? "s" : ""} Sent
          </div>
        </div>
      </div>

      {/* COMPOSE SECTION */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center">
            <Send className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Compose Broadcast</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">All online users will see this instantly</p>
          </div>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your announcement here... (e.g., Flash Sale starting now! 🎉)"
          rows={4}
          maxLength={500}
          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all resize-none"
        />

        <div className="flex items-center justify-between mt-4">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {message.length}/500 characters
          </span>
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="flex items-center gap-2 px-8 py-3 bg-[#1F7A3B] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-[#185e2e] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Broadcast
              </>
            )}
          </button>
        </div>
      </div>

      {/* HISTORY SECTION */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Broadcast History</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Previously sent announcements</p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-green-100 border-t-green-600 rounded-full animate-spin" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading broadcasts...</p>
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-gray-50 rounded-[32px]">
            <Megaphone className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold text-sm">No broadcasts sent yet</p>
            <p className="text-gray-300 text-xs mt-1">Your announcements will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {broadcasts.map((bc) => (
              <div
                key={bc._id}
                className="group flex items-start gap-4 p-5 bg-gray-50 hover:bg-green-50/50 rounded-2xl border border-gray-100 hover:border-green-100 transition-all"
              >
                <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg">
                  📢
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 leading-relaxed">{bc.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {new Date(bc.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Delivered
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(bc._id)}
                  className="p-2.5 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                  title="Delete broadcast"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
