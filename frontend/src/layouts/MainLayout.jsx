import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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

      {/* Page content — with padding-top to offset fixed navbar */}
      <main className="pt-[105px] md:pt-[175px]">
        <Outlet />
      </main>

      {/* ================================
          🟢 FOOTER
      ================================= */}
      <Footer />
      <ChatBot />
      <ScrollToTopButton />
    </>
  );
}
