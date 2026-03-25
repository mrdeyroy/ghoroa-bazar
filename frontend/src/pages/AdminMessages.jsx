import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { 
  Mail, 
  MessageSquare, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  User, 
  ChevronRight,
  ShieldAlert,
  Archive,
  Star,
  Search,
  Check
} from "lucide-react";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMessages = () => {
    fetch(import.meta.env.VITE_API_URL + "/api/contact")
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id, refreshUnread) => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/contact/${id}/read`, { credentials: "include",
      method: "PATCH"
    });

    setMessages(prev =>
      prev.map(m =>
        m._id === id ? { ...m, status: "read" } : m
      )
    );

    refreshUnread(); 
  };

  const deleteMessage = async (id, refreshUnread) => {
    if (!window.confirm("Delete this message?")) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/contact/${id}`, { credentials: "include",
      method: "DELETE"
    });

    setMessages(prev => prev.filter(m => m._id !== id));

    refreshUnread();
  };

  const filteredMessages = messages.filter(msg => 
    msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      {({ refreshUnread }) => (
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Communications</h1>
              <p className="text-gray-400 font-medium mt-1 uppercase tracking-widest text-[10px] pl-1">Inbox & customer engagement console</p>
            </div>
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Scan messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#1F7A3B] outline-none transition-all font-bold text-sm"
                />
            </div>
          </div>

          {loading ? (
             <div className="py-20 text-center animate-pulse">
                <div className="w-12 h-12 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Decrypting messages from terminal...</p>
             </div>
          ) : filteredMessages.length === 0 ? (
            <div className="py-20 bg-white rounded-[40px] border border-dashed border-gray-200 text-center">
              <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">The inbox is at zero state.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map(msg => (
                <div
                  key={msg._id}
                  className={`group relative p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    msg.status === "unread"
                      ? "bg-white border-[#66FF99]/30 ring-4 ring-[#66FF99]/5"
                      : "bg-white/50 border-gray-100 opacity-80"
                  }`}
                >
                  {/* Status Indicator Bar */}
                  {msg.status === "unread" && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-[#66FF99] rounded-r-full shadow-[0_0_15px_rgba(102,255,153,0.5)]" />
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                    <div className="flex-1 flex gap-5">
                      <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center flex-shrink-0 shadow-inner ${
                        msg.status === "unread" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"
                      }`}>
                        {msg.status === "unread" ? <Mail className="w-6 h-6" /> : <Archive className="w-6 h-6" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-black text-gray-900 tracking-tight">{msg.name}</p>
                          <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest ${
                            msg.status === "unread" 
                              ? "bg-green-100 text-green-700 animate-pulse" 
                              : "bg-gray-100 text-gray-400"
                          }`}>
                            {msg.status}
                          </span>
                        </div>
                        <p className="text-xs font-black text-[#1F7A3B] opacity-80 underline decoration-[#66FF99] decoration-2 underline-offset-4">{msg.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-2xl">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                        {new Date(msg.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 ml-0 sm:ml-19">
                    {msg.subject && (
                      <div className="mb-3">
                         <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5">Communication Subject</p>
                         <p className="text-sm font-black text-gray-800 tracking-tight">{msg.subject}</p>
                      </div>
                    )}

                    <div className="bg-gray-50/50 p-6 rounded-[24px] border border-gray-50/50">
                       <p className="text-sm font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-8">
                      {msg.status === "unread" && (
                        <button
                          onClick={() => markAsRead(msg._id, refreshUnread)}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0F1E11] px-6 py-4 rounded-2xl text-xs font-black text-[#66FF99] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-green-900/10 active:scale-95 group"
                        >
                          <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          Resolve Signal
                        </button>
                      )}

                      <button
                        onClick={() => deleteMessage(msg._id, refreshUnread)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-gray-100 px-6 py-4 rounded-2xl text-xs font-black text-gray-400 hover:text-red-500 hover:border-red-100 transition-all active:scale-95 group"
                      >
                        <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        Trash Message
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
