import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import NotificationToast from "./components/NotificationToast";
import BroadcastPopup from "./components/BroadcastPopup";
import Loader from "./components/Loader";
// ---------- CUSTOMER PAGES ----------
import Home from "./pages/Home";
import MainLayout from "./layouts/MainLayout";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import OrderSuccess from "./pages/OrderSuccess";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import Invoice from "./pages/Invoice";
import NotFound from "./pages/NotFound";
import Faq from "./pages/Faq";
import Contact from "./pages/Contact";
import RefundPolicy from "./pages/RefundPolicy";

// ---------- AUTH ----------
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";

// ---------- ADMIN ----------
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";
import AdminRoute from "./components/AdminRoute";
import AdminMessages from "./pages/AdminMessages";
import AdminBroadcast from "./pages/AdminBroadcast";

import { Toaster } from "react-hot-toast";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // 2.5s premium loading feel
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Loader isLoading={isLoading} />
      <BrowserRouter>
        <ScrollToTop />
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '16px',
            background: '#fff',
            color: '#111827',
            fontSize: '14px',
            fontWeight: '800',
            padding: '16px 24px',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6'
          },
          success: {
            iconTheme: {
              primary: '#1F7A3B',
              secondary: '#fff',
            },
            duration: 4000
          },
          error: {
            duration: 4000
          }
        }}
      />
      <NotificationToast />
      <BroadcastPopup />
      <Routes>


        {/* ---------- Pages WITH Navbar + Footer ---------- */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products" element={<Products />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/return-policy" element={<RefundPolicy />} />

          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/order-success" element={<OrderSuccess />} />

          {/* Protected Customer Routes */}
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        </Route>

        {/* Pages WITHOUT Navbar + Footer */}
        <Route 
          path="/invoice/:orderId" 
          element={
            localStorage.getItem("adminLoggedIn") ? <Invoice /> : <ProtectedRoute><Invoice /></ProtectedRoute>
          } 
        />


        {/* ---------- AUTH ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ---------- ADMIN ---------- */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/messages" element={<AdminRoute><AdminMessages /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/broadcast" element={<AdminRoute><AdminBroadcast /></AdminRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      </BrowserRouter>
    </>
  );
}
