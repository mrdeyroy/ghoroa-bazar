import { BrowserRouter, Routes, Route } from "react-router-dom";

// ---------- CUSTOMER PAGES ----------
import Home from "./pages/Home";
import MainLayout from "./layouts/MainLayout";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import OrderSuccess from "./pages/OrderSuccess";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import MyOrders from "./pages/MyOrders";
import Invoice from "./pages/Invoice";
import NotFound from "./pages/NotFound";
import Faq from "./pages/Faq";
import Contact from "./pages/Contact";



// ---------- AUTH ----------
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// ---------- ADMIN ----------
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";
import AdminRoute from "./components/AdminRoute";
import AdminMessages from "./pages/AdminMessages";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ---------- Pages WITH Navbar + Footer ---------- */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<Contact />} />


        </Route>

        {/* Pages WITHOUT Navbar + Footer */}
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/invoice/:orderId" element={<Invoice />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="*" element={<NotFound />} />

        {/* ---------- AUTH ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ---------- ADMIN ---------- */}
        <Route path="/admin/messages" element={<AdminMessages />} />


        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
