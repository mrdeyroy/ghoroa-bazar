import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
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
  Menu,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  ChevronDown,
  X,
  MapPin
} from "lucide-react";

export default function Navbar() {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
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
      setScrolled(window.scrollY > 50);
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
      <header className={`sticky top-0 z-[100] w-full transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-md' : 'bg-white'}`}>
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
        <nav className={`transition-colors duration-300 py-3 md:py-4 px-4 ${scrolled ? 'bg-transparent border-none' : 'bg-green-50/80 border-b border-green-100'}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
            
            {/* Logo & Location */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <button 
                onClick={() => setMenuOpen(true)}
                className="lg:hidden text-green-800 hover:text-green-600 transition-colors"
              >
                <Menu size={26} />
              </button>

              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-white p-1.5 rounded-xl shadow-sm border border-green-100 group-hover:scale-110 transition-transform">
                  <img src="/gblogo.png" alt="Logo" className="h-8 md:h-10 w-auto object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-green-900 text-lg md:text-xl font-black leading-tight tracking-tight">
                    Ghoroa <span className="text-[#ffa500]">Bazar</span>
                  </span>
                  <div className="flex items-center gap-1 text-green-600/80">
                    <MapPin size={10} className="fill-green-600" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Kolkata, INDIA</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Modern Search Bar */}
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

            {/* Icons */}
            <div className="flex items-center gap-2 sm:gap-5 flex-shrink-0">
              <button 
                onClick={() => setSearchOpen(true)}
                className="md:hidden text-green-800 p-2 hover:bg-green-100 rounded-full transition-all"
              >
                <Search size={22} />
              </button>

              {/* Wishlist Icon */}
              <Link to="/wishlist" className="relative group p-2 text-green-800 hover:bg-green-100 rounded-full transition-all">
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

              {/* Cart Icon */}
              <button 
                onClick={() => user ? setCartOpen(true) : navigate("/login")}
                className="relative group p-2 text-green-800 hover:bg-green-100 rounded-full transition-all"
              >
                <ShoppingCart size={24} className="group-hover:scale-110 group-active:scale-95 transition-transform" />
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

              <div className="relative" ref={dropdownRef}>
                {user ? (
                  <button 
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="flex items-center gap-2 text-green-800 p-1 hover:bg-green-100 rounded-full transition-all border border-green-100 shadow-sm"
                  >
                    <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-black text-sm border-2 border-white group-hover:scale-105 transition-transform overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 sm:gap-4">
                    <Link 
                      to="/login" 
                      className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] text-green-800 hover:text-green-600 transition-all px-2 py-1"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/signup" 
                      className="bg-green-600 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-green-200 hover:bg-green-700 hover:scale-105 active:scale-95 transition-all text-center whitespace-nowrap"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
                
                <AnimatePresence>
                  {userDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-green-100 py-2 z-[110] overflow-hidden"
                    >
                      <div className="px-6 py-4 border-b border-gray-50 mb-1 bg-green-50/50">
                         <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Signed in as</span>
                         <span className="block text-sm font-black text-green-900 truncate tracking-tight">{user.name}</span>
                         <span className="block text-[10px] text-green-600 mt-1 font-bold">{user.email}</span>
                      </div>
                      <Link 
                        to="/profile" 
                        onClick={() => setUserDropdown(false)}
                        className="w-full flex items-center gap-3 px-6 py-3.5 text-[13px] font-bold text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <User size={18} />
                        My Profile
                      </Link>
                      <Link 
                        to="/my-orders" 
                        onClick={() => setUserDropdown(false)}
                        className="w-full flex items-center gap-3 px-6 py-3.5 text-[13px] font-bold text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <ShoppingBag size={18} />
                        My Orders
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-6 py-3.5 text-[13px] font-bold text-red-500 hover:bg-red-50 transition-colors mt-2 border-t border-gray-50"
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

        {/* --- BOTTOM NAVIGATION (MENU) --- */}
        <div className={`transition-all duration-300 py-1 px-4 shadow-sm border-b border-gray-50 ${scrolled ? 'hidden' : 'bg-white hidden md:block'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center gap-10 md:gap-16">
              {[
                { name: "Home", path: "/" },
                { name: "Shop", path: "/products" },
                { name: "About Us", path: "/#about-section" },
                { name: "Contact Us", path: "/contact" }
              ].map((link, idx) => (
                <Link 
                  key={idx}
                  to={link.path}
                  className="text-[11px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-green-600 transition-all relative group py-3.5"
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
              <div className="bg-green-50 p-6 flex justify-between items-center border-b border-green-100">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-1.5 rounded-xl shadow-sm border border-green-100">
                    <img src="/gblogo.png" alt="Logo" className="h-8 w-auto object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-green-900 text-lg font-black leading-none">Ghoroa <span className="text-[#ffa500]">Bazar</span></span>
                    <span className="text-[9px] font-black text-green-600 uppercase tracking-widest mt-0.5">Kolkata, INDIA</span>
                  </div>
                </div>
                <button onClick={() => setMenuOpen(false)} className="text-green-800 p-2 hover:bg-green-100 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
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
                      className="block px-4 py-4 rounded-2xl text-base font-black text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Shop Categories</span>
                  {categories.map((cat, idx) => (
                    <Link 
                      key={idx}
                      to={cat.path}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-gray-600 hover:bg-green-50 transition-all"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                {user ? (
                   <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-100 transition-all"
                  >
                    <LogOut size={18} />
                    Logout Account
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link 
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-green-100 text-green-800 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-50 transition-all"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/signup"
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-green-200 hover:bg-green-700 transition-all"
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
