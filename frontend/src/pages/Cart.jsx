import { useCart } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import BackButton from "../components/BackButton";
import ProductCard from "../components/ProductCard";

export default function Cart() {
  const { cart, increaseQty, decreaseQty, removeItem } = useCart();
  const navigate = useNavigate();

  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState("");

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const hasStockIssue = cart.some(
    item => !item.stock || item.qty >= item.stock
  );

  const triggerToast = (text) => {
    setToastText(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link
            to="/#products-section"
            className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all active:scale-95 w-full shadow-lg shadow-green-100"
          >
            Start Shopping <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9f7] pb-20">
      {/* TOAST */}
      {showToast && (
        <div className="fixed top-24 right-6 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[100] animate-in fade-in slide-in-from-right-10 duration-300">
          {toastText}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 relative">

          <div className="flex items-center gap-4">
            <BackButton color="#000" margin="0" />
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1F7A3B] tracking-tight">
            Shopping Cart
          </h1>

          <p className="text-gray-500 font-medium hidden md:block">
            {cart.length} Items in your bag
          </p>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: CART ITEMS */}
          <div className="lg:col-span-8 space-y-4">
            {/* DESKTOP HEADER */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-sm font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* ITEM LIST */}
            <div className="space-y-4">
              {cart.map(item => {
                const maxReached = item.stock !== undefined && item.qty >= item.stock;

                return (
                  <div
                    key={`${item.id}-${item.selectedWeight}`}
                    className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-50 hover:shadow-md transition-shadow relative group"
                  >
                    {/* MOBILE LAYOUT & DESKTOP MERGED RESPONSIVELY */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center">

                      {/* PRODUCT INFO (COL-SPAN-6 ON DESKTOP) */}
                      <div className="md:col-span-6 flex gap-4 md:gap-6">
                        <div className="relative flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-2xl bg-gray-50 border border-gray-100 p-2"
                          />
                        </div>

                        <div className="flex flex-col justify-center min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate pr-8 md:pr-0">
                            {item.name}
                          </h3>
                          {item.selectedWeight !== "default" && (
                            <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 text-[10px] md:text-xs font-bold rounded-full mt-1 w-fit">
                              {item.selectedWeight}
                            </span>
                          )}

                          {/* Price visible on mobile only here */}
                          <p className="text-green-600 font-bold mt-2 md:hidden">
                            ₹{item.price.toFixed(2)}
                          </p>

                          <button
                            onClick={() => {
                              removeItem(item.id, item.selectedWeight);
                              triggerToast(`❌ ${item.name} removed`);
                            }}
                            className="mt-3 md:mt-4 text-red-500 text-xs font-bold flex items-center gap-1 hover:text-red-700 transition-colors w-fit"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>

                      {/* PRICE (COL-SPAN-2 ON DESKTOP) - HIDDEN ON MOBILE */}
                      <div className="hidden md:block md:col-span-2 text-center font-bold text-gray-700">
                        ₹{item.price.toFixed(2)}
                      </div>

                      {/* QTY SELECTOR (COL-SPAN-2 ON DESKTOP) */}
                      <div className="md:col-span-2 flex flex-col items-center gap-1">
                        <div className="flex items-center bg-gray-50 rounded-full border border-gray-100 p-1">
                          <button
                            onClick={() => decreaseQty(item.id, item.selectedWeight)}
                            disabled={item.qty === 1}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all text-green-600"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-bold text-gray-800 text-sm">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => {
                              if (!maxReached) increaseQty(item.id, item.selectedWeight);
                            }}
                            disabled={maxReached}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all text-green-600"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {maxReached && (
                          <p className="text-[10px] text-red-500 font-bold animate-pulse">Stock limit</p>
                        )}
                      </div>

                      {/* TOTAL (COL-SPAN-2 ON DESKTOP) */}
                      <div className="md:col-span-2 text-right">
                        <p className="text-xs text-gray-400 font-medium md:hidden mb-1 uppercase tracking-tighter">Subtotal</p>
                        <p className="text-lg font-extrabold text-[#1f7a3b]">
                          ₹{(item.price * item.qty).toFixed(2)}
                        </p>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* TRUST BADGES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 px-2">
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <ShieldCheck className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-xs font-bold text-gray-800">Secure Payments</p>
                  <p className="text-[10px] text-gray-500">100% encryption</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Truck className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-xs font-bold text-gray-800">Fast Delivery</p>
                  <p className="text-[10px] text-gray-500">Express delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <RotateCcw className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-xs font-bold text-gray-800">Easy Returns</p>
                  <p className="text-[10px] text-gray-500">7-day policy</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: SUMMARY (STICKY ON DESKTOP) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-xl border border-gray-100">
              <h2 className="text-xl font-extrabold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Bag Total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Delivery Charges</span>
                  <span className="text-green-600 font-bold uppercase text-xs bg-green-50 px-2 py-1 rounded">Free</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Packaging Charges</span>
                  <span>₹0.00</span>
                </div>
                <div className="h-px bg-gray-100 my-4"></div>
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-black text-[#1f7a3b]">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              {hasStockIssue && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold mb-4 flex items-center gap-2">
                  ⚠️ Some items have stock issues. Please adjust quantities.
                </div>
              )}

              <button
                disabled={hasStockIssue}
                onClick={() => navigate("/checkout")}
                className="w-full bg-[#1f7a3b] text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-green-100 hover:bg-[#185e2e] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </button>

            </div>
          </div>
        </div>

        {/* RECENTLY VIEWED PRODUCTS */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-black text-gray-900">You might also like</h2>
            <Link to="/#products-section" className="text-green-600 font-bold text-sm hover:underline">View all</Link>
          </div>

          <div className="flex overflow-x-auto gap-4 pb-8 -mx-4 px-4 snap-x pr-10 scrollbar-hide md:grid md:grid-cols-4 lg:grid-cols-5 md:overflow-visible">
            {/* Logic to show recently viewed items, using current cart items as placeholder */}
            {cart.slice(0, 5).map(item => (
              <div key={item.id} className="min-w-[200px] md:min-w-0 snap-start">
                {/* Reusing ProductCard component if possible, but here we just mock it for now or use the existing one */}
                {/* Since we have the ProductCard component, we should ideally fetch products. 
                     For this redesign, we'll keep the logic simple to avoid complex state changes */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col hover:shadow-lg transition-all group">
                  <img src={item.image} className="w-full aspect-square object-contain transition-transform group-hover:scale-105" alt="" />
                  <h4 className="font-bold text-gray-800 mt-4 line-clamp-1">{item.name}</h4>
                  <p className="text-green-600 font-black mt-2">₹{item.price}</p>
                  <button
                    onClick={() => increaseQty(item.id, item.selectedWeight)}
                    className="mt-auto w-full border-2 border-green-600 text-green-600 py-2 rounded-xl font-bold text-sm hover:bg-green-600 hover:text-white transition-all active:scale-95"
                  >
                    Quick Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
