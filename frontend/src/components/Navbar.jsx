import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useNotifications } from "../context/NotificationContext";
import { useState, useEffect, useRef } from "react";
import CartSidebar from "./CartSidebar";
import SearchModal from "./SearchModal";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

import {
  ShoppingCart,
  Heart,
  Search,
  User,
  LogOut,
  ShoppingBag,
  Bell,
  Menu,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  ChevronDown,
  X,
  MapPin
} from "lucide-react";

// ── Notification Bell Component (DESKTOP ONLY — renders inline in navbar) ──
function NotificationBell() {
  const { unreadCount: notifCount, notifications, markAllRead, clearNotifications, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          if (!isOpen && notifCount > 0) markAllRead();
        }}
        className="relative group p-2 text-green-800 hover:bg-green-100 rounded-full transition-all"
      >
        <Bell size={20} className="md:w-6 md:h-6 group-hover:scale-110 group-active:scale-95 transition-transform" />
        <AnimatePresence>
          {notifCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-md animate-bounce"
            >
              {notifCount > 9 ? "9+" : notifCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[190]" onClick={() => setIsOpen(false)} />
          <div className="fixed sm:absolute inset-x-4 sm:inset-auto sm:right-0 top-[70px] sm:top-full mt-2 w-auto sm:w-80 bg-white rounded-3xl shadow-2xl border border-green-100 z-[200] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-gray-900">Notifications</h4>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Order Updates</p>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={() => { clearNotifications(); setIsOpen(false); }}
                  className="text-[10px] font-black text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="max-h-[320px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <Bell className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-xs text-gray-400 font-medium">No order updates yet</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((notif) => (
                  <div
                    key={notif._id || notif.id}
                    className="relative group/notif w-full flex items-start gap-3 px-5 py-4 hover:bg-green-50 transition-colors text-left border-b border-gray-50 last:border-0"
                  >
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        if (notif.type === "order_status" || notif.type === "order") navigate("/my-orders");
                      }}
                      className="flex items-start gap-3 flex-1 min-w-0"
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm bg-green-100 text-green-700">
                        {notif.icon || "📦"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 line-clamp-2">{notif.message}</p>
                        <p className="text-[9px] font-bold text-gray-400 mt-1">
                          {new Date(notif.createdAt || notif.timestamp || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif._id || notif.id);
                      }}
                      className="opacity-0 group-hover/notif:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                      title="Delete"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Navbar() {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { unreadCount: notifCount } = useNotifications();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoryDropdown, setCategoryDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [scrolled, setScrolled] = useState(false);

  const dropdownRef = useRef(null);

  // Scroll logic for Glass Effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setUserDropdown(false);
    navigate("/");
  };

  const categories = [
    { name: "All Categories", path: "/products" },
    { name: "Honey & Natural Sweeteners", path: "/products?category=Honey%20%26%20Natural%20Sweeteners" },
    { name: "Fresh Fruits", path: "/products?category=Fresh%20Fruits" },
    { name: "Ghee & Dairy", path: "/products?category=Ghee%20%26%20Dairy" },
    { name: "Spices & Masala", path: "/products?category=Spices%20%26%20Masala" },
    { name: "Dry Fruits", path: "/products?category=Dry%20Fruits" },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-500 ${scrolled ? 'bg-white/70 backdrop-blur-xl shadow-lg border-b border-green-100/30' : 'bg-white'}`}>
        {/* --- TOP ANNOUNCEMENT BAR --- */}
        <div className={`transition-all duration-500 overflow-hidden ${scrolled ? 'h-0 opacity-0' : 'h-9 bg-orange-50/80 border-b border-orange-100'}`}>
          <div className="max-w-7xl mx-auto h-full flex justify-between items-center px-4 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-orange-900/80">
            <div className="hidden sm:flex items-center gap-4">
              <a href="tel:+880123456789" className="flex items-center gap-1.5 hover:text-orange-600 transition-colors">
                <Phone size={12} className="text-orange-500" />
                <span>Call Us: +880 1234 56789</span>
              </a>
            </div>

            <div className="flex-1 text-center truncate px-4 font-black tracking-widest text-orange-600">
              ✨ Free Shipping on Orders Over ₹500! Shop Now ✨
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden xs:flex items-center gap-3">
                <Facebook size={14} className="cursor-pointer hover:text-orange-500 transition-colors" />
                <Twitter size={14} className="cursor-pointer hover:text-orange-500 transition-colors" />
                <Instagram size={14} className="cursor-pointer hover:text-orange-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN HEADER --- */}
        <nav className={`transition-all duration-500 ${scrolled ? 'py-1.5 md:py-2 bg-transparent border-none' : 'py-2.5 md:py-4 bg-green-50/80 border-b border-green-100'}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-8">

            {/* ======== LEFT: Hamburger + Logo ======== */}
            <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0 min-w-0">
              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMenuOpen(true)}
                className="lg:hidden text-green-800 hover:text-green-600 transition-colors p-1.5 -ml-1 flex items-center justify-center"
                aria-label="Open menu"
              >
                <Menu size={20} className="md:w-6 md:h-6" />
              </button>

              {/* Logo + Brand */}
              <Link to="/" className="flex items-center gap-1 group min-w-0">
                <div className="bg-white p-1 rounded-lg shadow-sm border border-green-100 group-hover:scale-110 transition-transform flex-shrink-0">
                  <img src="/gblogo.png" alt="Logo" className="h-6 md:h-10 w-auto object-contain" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-green-900 text-[13px] xs:text-[15px] md:text-xl font-black leading-tight tracking-tight whitespace-nowrap truncate">
                    Ghoroa <span className="text-[#ffa500]">Bazar</span>
                  </span>
                  {/* Location — hidden on small mobile, visible on sm+ */}
                  <div className="hidden sm:flex items-center gap-1 text-green-600/80">
                    <MapPin size={10} className="fill-green-600" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Kolkata, INDIA</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* ======== CENTER: Search Bar (desktop only) ======== */}
            <div className={`hidden md:flex flex-1 max-w-xl bg-white rounded-full border border-green-100 shadow-sm h-11 relative group focus-within:ring-2 focus-within:ring-green-200 focus-within:border-green-300 transition-all overflow-visible`}>
              <div
                className="px-5 bg-gray-50/50 border-r border-green-50 flex items-center gap-2 cursor-pointer hover:bg-green-100 transition-colors text-green-800 font-bold text-[11px] relative rounded-l-full"
                onClick={() => setCategoryDropdown(!categoryDropdown)}
              >
                <span className="whitespace-nowrap">{selectedCategory}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${categoryDropdown ? 'rotate-180' : ''}`} />

                <AnimatePresence>
                  {categoryDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-green-50 py-3 z-[110] overflow-hidden"
                    >
                      {categories.map((cat, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setSelectedCategory(cat.name); navigate(cat.path); setCategoryDropdown(false); }}
                          className="w-full px-6 py-2.5 text-left text-xs font-bold text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center gap-3"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          {cat.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex-1 relative flex items-center" onClick={() => setSearchOpen(true)}>
                <input
                  type="text"
                  placeholder="Search for natural products..."
                  className="w-full px-5 text-sm font-medium outline-none text-gray-700 placeholder-gray-400 cursor-pointer bg-transparent"
                  readOnly
                />
                <div className="absolute right-1 p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-lg hover:rotate-12 transition-transform">
                  <Search size={18} />
                </div>
              </div>
            </div>

            {/* ======== RIGHT: Action Icons ======== */}
            <div className="flex items-center gap-1 md:gap-2 lg:gap-5 flex-shrink-0">

              {/* Search Icon — mobile only (replaces search bar) */}
              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden text-green-800 p-1.5 hover:bg-green-100 rounded-full transition-all flex items-center justify-center"
                aria-label="Search"
              >
                <Search size={19} />
              </button>

              {/* Notification Bell — DESKTOP ONLY (hidden on mobile, moved to user dropdown) */}
              <div className="block">
                {user && <NotificationBell />}
              </div>

              {/* Wishlist Icon — DESKTOP ONLY (hidden on mobile, moved to user dropdown) */}
              <Link to="/wishlist" className="hidden md:flex relative group p-2 text-green-800 hover:bg-green-100 rounded-full transition-all">
                <Heart size={24} className="group-hover:scale-110 group-active:scale-95 transition-transform" />
                <AnimatePresence>
                  {wishlist.length > 0 && (
                    <motion.span
                      key="wishlist-badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-md animate-bounce"
                    >
                      {wishlist.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Cart Icon — ALWAYS VISIBLE */}
              <button
                onClick={() => user ? setCartOpen(true) : navigate("/login")}
                className="relative group p-1.5 text-green-800 hover:bg-green-100 rounded-full transition-all flex items-center justify-center"
                aria-label="Cart"
              >
                <ShoppingCart size={19} className="md:w-6 md:h-6 group-hover:scale-110 group-active:scale-95 transition-transform" />
                <AnimatePresence>
                  {cart.length > 0 && (
                    <motion.span
                      key="cart-badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-md animate-bounce"
                    >
                      {cart.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* ======== User Profile / Auth ======== */}
              <div className="relative" ref={dropdownRef}>
                {user ? (
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="flex items-center gap-1 text-green-800 p-0.5 hover:bg-green-100 rounded-full transition-all border border-green-100 shadow-sm justify-center"
                    aria-label="User menu"
                  >
                    <div className="w-7 h-7 xs:w-8 xs:h-8 md:w-9 md:h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-black text-[10px] md:text-sm border-2 border-white overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-4">
                    <Link
                      to="/login"
                      className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] text-green-800 hover:text-green-600 transition-all px-2 py-1"
                    >
                      Login
                    </Link>
                    {/* Mobile: show user icon that links to login */}
                    <Link
                      to="/login"
                      className="sm:hidden text-green-800 p-2 hover:bg-green-100 rounded-full transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
                      aria-label="Login"
                    >
                      <User size={20} />
                    </Link>
                    <Link
                      to="/signup"
                      className="hidden sm:block bg-green-600 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-green-200 hover:bg-green-700 hover:scale-105 active:scale-95 transition-all text-center whitespace-nowrap"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}

                {/* ======== USER DROPDOWN (consolidated for mobile) ======== */}
                <AnimatePresence>
                  {userDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-64 md:w-60 bg-white rounded-2xl shadow-2xl border border-green-100 py-2 z-[110] overflow-hidden"
                    >
                      {/* User Info Header */}
                      <div className="px-5 py-4 border-b border-gray-50 mb-1 bg-green-50/50">
                        <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Signed in as</span>
                        <span className="block text-sm font-black text-green-900 truncate tracking-tight">{user.name}</span>
                        <span className="block text-[10px] text-green-600 mt-1 font-bold">{user.email}</span>
                      </div>

                      {/* Wishlist — mobile only */}
                      <Link
                        to="/wishlist"
                        onClick={() => setUserDropdown(false)}
                        className="w-full md:hidden flex items-center gap-3 px-5 py-3.5 text-[13px] font-bold text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <Heart size={18} />
                        Wishlist
                        {wishlist.length > 0 && (
                          <span className="ml-auto bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-full">{wishlist.length}</span>
                        )}
                      </Link>



                      {/* Profile */}
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdown(false)}
                        className="w-full flex items-center gap-3 px-5 py-3.5 text-[13px] font-bold text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <User size={18} />
                        My Profile
                      </Link>

                      {/* My Orders */}
                      <Link
                        to="/my-orders"
                        onClick={() => setUserDropdown(false)}
                        className="w-full flex items-center gap-3 px-5 py-3.5 text-[13px] font-bold text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <ShoppingBag size={18} />
                        My Orders
                      </Link>

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-3.5 text-[13px] font-bold text-red-500 hover:bg-red-50 transition-colors mt-1 border-t border-gray-50"
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </nav>

        {/* --- BOTTOM NAVIGATION (MENU) — desktop only --- */}
        <div className={`transition-all duration-500 overflow-hidden ${scrolled ? 'h-0 opacity-0 pointer-events-none' : 'h-[52px] opacity-100 bg-white border-b border-gray-50'} hidden md:block`}>
          <div className="max-w-7xl mx-auto h-full flex items-center justify-center">
            <div className="flex items-center gap-10 md:gap-16">
              {[
                { name: "Home", path: "/" },
                { name: "Shop", path: "/products" },
                { name: "About Us", path: "/#about-section" },
                { name: "Contact Us", path: "/contact" }
              ].map((link, idx) => (
                <Link
                  key={idx}
                  to={link.path}
                  className="text-[11px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-green-600 transition-all relative group py-4"
                >
                  {link.name}
                  <span className="absolute bottom-2 left-0 w-0 h-0.5 bg-green-500 transition-all group-hover:w-full" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* --- MOBILE SIDEBAR --- */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[80%] max-w-sm bg-white z-[210] shadow-2xl flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="bg-green-50 p-5 flex justify-between items-center border-b border-green-100">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-1.5 rounded-xl shadow-sm border border-green-100">
                    <img src="/gblogo.png" alt="Logo" className="h-8 w-auto object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-green-900 text-lg font-black leading-none">Ghoroa <span className="text-[#ffa500]">Bazar</span></span>
                    <span className="text-[9px] font-black text-green-600 uppercase tracking-widest mt-0.5">Kolkata, INDIA</span>
                  </div>
                </div>
                <button onClick={() => setMenuOpen(false)} className="text-green-800 p-2 hover:bg-green-100 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <X size={22} />
                </button>
              </div>

              {/* Sidebar User Quick Info (if logged in) */}
              {user && (
                <div className="px-6 py-4 bg-white border-b border-gray-50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-black text-sm border-2 border-white overflow-hidden flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-gray-900 truncate">{user.name}</p>
                    <p className="text-[10px] text-green-600 font-bold truncate">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Sidebar Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Navigation Links */}
                <div className="space-y-1">
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Navigation</span>
                  {[
                    { name: "Home", path: "/" },
                    { name: "Shop", path: "/products" },
                    { name: "About Us", path: "/#about-section" },
                    { name: "Contact Us", path: "/contact" }
                  ].map((link, idx) => (
                    <Link
                      key={idx}
                      to={link.path}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3.5 rounded-2xl text-[15px] font-black text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all min-h-[44px] flex items-center"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>



                {/* Shop Categories */}
                <div className="space-y-1">
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Shop Categories</span>
                  {categories.map((cat, idx) => (
                    <Link
                      key={idx}
                      to={cat.path}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-gray-600 hover:bg-green-50 transition-all min-h-[44px]"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="p-5 bg-gray-50 border-t border-gray-100">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-100 transition-all min-h-[48px]"
                  >
                    <LogOut size={18} />
                    Logout Account
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-green-100 text-green-800 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-50 transition-all min-h-[48px]"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-green-200 hover:bg-green-700 transition-all min-h-[48px]"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {user && (
        <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      )}
    </>
  );
}
