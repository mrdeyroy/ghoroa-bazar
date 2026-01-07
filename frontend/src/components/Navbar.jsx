import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useState, useEffect, useRef } from "react";
import CartSidebar from "./CartSidebar";
import SearchModal from "./SearchModal";

import {
  ShoppingCart,
  Heart,
  Search,
  User,
  Menu
} from "lucide-react";

export default function Navbar() {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [prevCartCount, setPrevCartCount] = useState(cart.length);
  const [searchOpen, setSearchOpen] = useState(false);


  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (userId && cart.length > prevCartCount) {
      setCartOpen(true);
    }
    setPrevCartCount(cart.length);
  }, [cart.length, userId]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    navigate("/login");
    setUserDropdown(false);
    setMenuOpen(false);
  };

  const iconStyle = { cursor: "pointer" };

  return (
    <>
      <nav
        style={{
          background: "#00ad5cff",
          height: 72,                     // 🔒 fixed navbar height
          padding: "0 16px",
          position: "relative",
          zIndex: 1000,
          display: "flex",
          alignItems: "center"
        }}
      >
        {/* MAIN ROW */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%"
          }}
        >
          {/* LEFT SECTION */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center"
            }}
          >
            <div className="mobile-only">
              <Menu
                size={24}
                style={iconStyle}
                onClick={() => setMenuOpen(!menuOpen)}
              />
            </div>
          </div>

          {/* CENTER LOGO */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Link to="/" style={{ display: "flex", alignItems: "center" }}>
              <img
                src="/gblogo.png"
                alt="Ghoroa Bazar"
                style={{
                  height: 120,            // ✅ bigger logo
                  maxHeight: "100%",     // ❌ never grows navbar
                  width: "auto",
                  objectFit: "contain"
                }}
              />
            </Link>
          </div>

          {/* RIGHT ICONS */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 24
            }}
          >
            <Search
              size={20}
              style={iconStyle}
              onClick={() => setSearchOpen(true)}
            />


            {/* WISHLIST */}
            <div style={{ position: "relative" }}>
              <Heart
                size={20}
                style={iconStyle}
                onClick={() => navigate("/wishlist")}
              />
              {wishlist.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    background: "orange",
                    color: "#000",
                    borderRadius: "50%",
                    fontSize: 10,
                    padding: "2px 6px",
                    fontWeight: "bold"
                  }}
                >
                  {wishlist.length}
                </span>
              )}
            </div>

            {/* CART */}
            <div style={{ position: "relative" }}>
              <ShoppingCart
                size={20}
                style={iconStyle}
                onClick={() => setCartOpen(true)}
              />
              {cart.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    background: "orange",
                    color: "#000",
                    borderRadius: "50%",
                    fontSize: 10,
                    padding: "2px 6px",
                    fontWeight: "bold"
                  }}
                >
                  {cart.length}
                </span>
              )}
            </div>

            {/* USER (DESKTOP) */}
            {userId && (
              <div
                className="desktop-only"
                ref={dropdownRef}
                style={{ position: "relative" }}
              >
                <User
                  size={20}
                  style={iconStyle}
                  onClick={() => setUserDropdown(!userDropdown)}
                />

                {userDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 36,
                      background: "#fff",
                      color: "#000",
                      borderRadius: 6,
                      width: 170,
                      boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
                      zIndex: 2000
                    }}
                  >
                    <div
                      style={{
                        padding: 10,
                        borderBottom: "1px solid #eee",
                        fontSize: 13
                      }}
                    >
                      Hello, <strong>{userName}</strong>
                    </div>

                    <div
                      style={{ padding: 10, cursor: "pointer" }}
                      onClick={() => {
                        navigate("/my-orders");
                        setUserDropdown(false);
                      }}
                    >
                      My Orders
                    </div>

                    <div
                      style={{
                        padding: 10,
                        cursor: "pointer",
                        color: "red"
                      }}
                      onClick={logout}
                    >
                      Logout
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: 72,
              left: 0,
              width: "100%",
              background: "#005a2f",
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              textAlign: "center"
            }}
          >
            <Link to="/" style={{ color: "#fff" }} onClick={() => setMenuOpen(false)}>
              Home
            </Link>

            {userId && (
              <Link
                to="/my-orders"
                style={{ color: "#fff" }}
                onClick={() => setMenuOpen(false)}
              >
                My Orders
              </Link>
            )}

            {userId ? (
              <button
                onClick={logout}
                style={{
                  background: "#ffa500",
                  border: "none",
                  padding: 8,
                  borderRadius: 6,
                  fontWeight: "bold"
                }}
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" style={{ color: "#fff" }}>Login</Link>
                <Link
                  to="/signup"
                  style={{
                    background: "#ffa500",
                    color: "#000",
                    padding: 8,
                    borderRadius: 6,
                    fontWeight: "bold"
                  }}
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        )}

        <style>
          {`
            .mobile-only { display: none; }
            .desktop-only { display: block; }

            @media (max-width: 768px) {
              .mobile-only { display: block; }
              .desktop-only { display: none; }
            }
          `}
        </style>
      </nav>

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {userId && (
        <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      
        
      )}
    </>
  );
}
