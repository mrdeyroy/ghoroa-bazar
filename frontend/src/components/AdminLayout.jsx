import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  MessageSquare, 
  LogOut,
  Bell,
  User,
  Clock,
  ChevronRight
} from "lucide-react";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/contact/unread-count");
      const data = await res.json();
      setUnreadCount(data.count);
    } catch (err) {
      console.error("Failed to fetch unread count");
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/");
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Messages", path: "/admin/messages", icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-gray-900">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`fixed inset-y-0 left-0 w-[280px] bg-[#0F1E11] text-white z-[110] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:block shadow-2xl`}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#66FF99] tracking-tighter">Ghoroa Bazar</h2>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-0.5">Management Pro</p>
            </div>
            <button 
              className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group relative ${
                    isActive 
                      ? "bg-[#66FF99]/10 text-[#66FF99] font-black" 
                      : "text-white/60 hover:text-white hover:bg-white/5 font-medium"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#66FF99] rounded-r-full shadow-[0_0_15px_rgba(102,255,153,0.5)]" />
                  )}
                  <div className={`p-2 rounded-xl transition-colors ${isActive ? "bg-[#66FF99]/10" : "bg-transparent group-hover:bg-white/5"}`}>
                    <Icon className={`w-5 h-5 ${isActive ? "text-[#66FF99]" : "text-white/40 group-hover:text-white/80"}`} />
                  </div>
                  <span className="flex-1">{item.name}</span>
                  
                  {item.name === "Messages" && unreadCount > 0 && (
                    <span className="bg-[#66FF99] text-[#0F1E11] text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(102,255,153,0.4)] animate-pulse">
                      {unreadCount}
                    </span>
                  )}

                  {isActive && <ChevronRight className="w-4 h-4 text-[#66FF99]/40" />}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative" onClick={() => isProfileOpen && setIsProfileOpen(false)}>
        
        {/* TOP HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all shadow-sm active:scale-95"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black text-gray-900 tracking-tight capitalize">
                {location.pathname.split("/").pop()?.replace("-", " ")}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400">
              <Clock className="w-3.5 h-3.5 text-green-600" />
              System Active
            </div>

            <div className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-gray-100 relative">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-black text-gray-900 leading-none">Admin Official</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Super Manager</p>
              </div>
              
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileOpen(!isProfileOpen);
                  }}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#006837] text-white flex items-center justify-center font-black text-lg shadow-lg shadow-green-900/20 ring-2 ring-white overflow-hidden relative group cursor-pointer active:scale-90 transition-all"
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  A
                </button>

                {/* PROFILE DROPDOWN */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 animate-in fade-in slide-in-from-top-4 duration-200 z-[200]">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1 sm:hidden">
                       <p className="text-sm font-black text-gray-900 leading-none">Admin Official</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Super Manager</p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center h-12 gap-3 px-4 rounded-2xl hover:bg-red-50 text-red-500 transition-all font-black text-xs uppercase tracking-widest group"
                    >
                      <div className="p-2 bg-red-50 group-hover:bg-red-500 group-hover:text-white rounded-xl transition-colors">
                        <LogOut className="w-4 h-4" />
                      </div>
                      Logout System
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-[1600px] mx-auto w-full">
          {typeof children === "function"
            ? children({ refreshUnread: fetchUnreadCount })
            : children}
        </main>

        {/* FOOTER - OPTIONAL FOR MOBILE */}
        <footer className="px-8 py-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] border-t border-gray-50 lg:hidden">
          © 2026 Ghoroa Bazar Registry
        </footer>
      </div>
    </div>
  );
}
