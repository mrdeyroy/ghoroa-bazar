import { useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MainLayout() {
    const location = useLocation();

useEffect(() => {
  if (location.hash) {
    const el = document.querySelector(location.hash);
    el?.scrollIntoView({ behavior: "smooth" });
  }
}, [location]);

const linkStyle = {
  display: "block",
  color: "#333",
  textDecoration: "none",
  marginBottom: "6px",
  fontSize: "14px",
  cursor: "pointer"
};


  return (
    <>
      <Navbar />

      {/* Page content */}
      <Outlet />

      {/* ================================
          🟢 FOOTER
      ================================= */}
      <footer style={{ background: "#f5f6f4", padding: "50px 8% 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1.5fr",
            gap: "24px",
            marginBottom: 30
          }}
        >
          {/* Column 1 */}
          <div>
            <h4 style={{ color: "#1f7a3b" }}>Ghorer Bazar</h4>
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>
              Ghorer Bazar is your trusted source for safe, healthy,
              and organic food in Bangladesh. From premium mustard oil
              to fresh nuts and pure honey, we bring nature to your doorstep.
            </p>
      
            <p style={{ marginTop: 12, fontWeight: 600 }}>We Accept</p>
      
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <img src="/src/assets/gpay.png" style={{ height: 30 }} />
              <img src="/src/assets/cod.png" style={{ height: 26 }} />
              <img src="/src/assets/mastercard.png" style={{ height: 26 }} />
            </div>
          </div>
      
          {/* Column 2 */}
                <div>
                  <h4 style={{ color: "#1f7a3b" }}>Quick Links</h4>
      
                  <Link to="/" style={linkStyle}>Home</Link>
      
                  <Link to="/#products-section" style={linkStyle}>Shop</Link>
      
                  <Link to="/contact" style={linkStyle}>Contact</Link> 

                  <Link to="/faq" style={linkStyle}>FAQ</Link>
                </div>
      
          {/* Column 3 */}
                <div>
                  <h4 style={{ color: "#1f7a3b" }}>Customer Service</h4>
      
                  <Link to="/#about-section" style={linkStyle}>About Us</Link>
                  <Link to="/return-policy" style={linkStyle}>Return Policy</Link>
                  <Link to="/refund-policy" style={linkStyle}>Refund Policy</Link>
                  <Link to="/contact" style={linkStyle}>Customer Care</Link>
                </div>
      
      
          {/* Column 4 */}
          <div>
            <h4 style={{ color: "#1f7a3b" }}>Get in Touch</h4>
      
            {/* GOOGLE MAP */}
            <iframe
              title="Ghorer Bazar Location"
              src="https://www.google.com/maps?q=Kolkata,India&output=embed"
              width="100%"
              height="140"
              style={{
                border: 0,
                borderRadius: 10,
                marginBottom: 10
              }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
      
            <p>📞 +91 880019300X</p>
            <p>✉ contact@ghoroabazar.shop</p>
          </div>
        </div>
      
        {/* bottom bar */}
        <div
          style={{
            textAlign: "center",
            padding: "12px 0",
            borderTop: "1px solid #ddd",
            color: "#1f7a3b",
            fontWeight: 600
          }}
        >
          © 2025 Ghorer Bazar | All Rights Reserved.
        </div>
      </footer>
    </>
  );
}
