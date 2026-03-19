import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import BackButton from "../components/BackButton";
import ChatBot from "../components/ChatBot";
import ScrollToTopButton from "../components/ScrollToTopButton";

export default function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  return (
    <>
      <Navbar />

      {/* Page content */}
      <Outlet />

      {/* ================================
          🟢 FOOTER
      ================================= */}
      <footer className="bg-[#f5f6f4] py-12 px-4 md:px-8 lg:px-[8%]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 mb-12">
          
          {/* Column 1: About */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-2xl font-bold text-[#1f7a3b]">Ghorer Bazar</h4>
              <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
                Ghorer Bazar is your trusted source for safe, healthy,
                and organic food in Bangladesh. From premium mustard oil
                to fresh nuts and pure honey, we bring nature to your doorstep.
              </p>
            </div>
      
            <div className="space-y-3">
              <p className="font-bold text-gray-800 text-sm">We Accept</p>
              <div className="flex flex-wrap gap-3 items-center">
                <img src="/src/assets/gpay.png" alt="Google Pay" className="h-8 object-contain" />
                <img src="/src/assets/cod.png" alt="Cash on Delivery" className="h-7 object-contain" />
                <img src="/src/assets/mastercard.png" alt="Mastercard" className="h-7 object-contain" />
              </div>
            </div>
          </div>
      
          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-[#1f7a3b]">Quick Links</h4>
            <div className="flex flex-col space-y-3">
              <Link to="/" className="text-sm text-gray-700 hover:text-[#1f7a3b] transition-colors font-medium">Home</Link>
              <Link to="/#products-section" className="text-sm text-gray-700 hover:text-[#1f7a3b] transition-colors font-medium">Shop</Link>
              <Link to="/contact" className="text-sm text-gray-700 hover:text-[#1f7a3b] transition-colors font-medium">Contact</Link> 
              <Link to="/faq" className="text-sm text-gray-700 hover:text-[#1f7a3b] transition-colors font-medium">FAQ</Link>
            </div>
          </div>
      
          {/* Column 3: Customer Service */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-[#1f7a3b]">Customer Service</h4>
            <div className="flex flex-col space-y-3">
              <Link to="/#about-section" className="text-sm text-gray-700 hover:text-[#1f7a3b] transition-colors font-medium">About Us</Link>
              <Link to="/return-policy" className="text-sm text-gray-700 hover:text-[#1f7a3b] transition-colors font-medium">Return Policy</Link>
              <Link to="/refund-policy" className="text-sm text-gray-700 hover:text-[#1f7a3b] transition-colors font-medium">Refund Policy</Link>
              <Link to="/contact" className="text-sm text-gray-700 hover:text-[#1f7a3b] transition-colors font-medium">Customer Care</Link>
            </div>
          </div>
      
          {/* Column 4: Location & Contact */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-[#1f7a3b]">Get in Touch</h4>
              <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white group">
                <iframe
                  title="Ghorer Bazar Location"
                  src="https://www.google.com/maps?q=Kolkata,India&output=embed"
                  className="w-full aspect-video border-0 grayscale hover:grayscale-0 transition-all duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-700 flex items-center gap-3">
                <span className="bg-green-100 p-2 rounded-full text-green-600 text-xs text-center flex items-center justify-center w-8 h-8">📞</span> 
                <span className="font-medium">+91 880019300X</span>
              </p>
              <p className="text-sm text-gray-700 flex items-center gap-3">
                <span className="bg-green-100 p-2 rounded-full text-green-600 text-xs text-center flex items-center justify-center w-8 h-8">✉</span> 
                <span className="font-medium">contact@ghoroabazar.shop</span>
              </p>
            </div>
          </div>
        </div>
      
        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-200 text-center">
          <p className="text-sm font-bold text-[#1f7a3b] tracking-wide">
            © 2025 Ghorer Bazar | All Rights Reserved.
          </p>
        </div>
      </footer>
      <ChatBot />
      <ScrollToTopButton />
    </>
  );
}
