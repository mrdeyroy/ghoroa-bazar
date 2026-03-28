import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useStock } from "../context/StockContext";
import { ShoppingCart, Heart, Eye, Star } from "lucide-react";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const { getStock } = useStock();
  const navigate = useNavigate();

  const [toast, setToast] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const wished = isWishlisted(product._id);
  const currentStock = getStock(product._id, product.stock);
  const isOutOfStock = currentStock === 0;
  const isLowStock = currentStock > 0 && currentStock <= 5;

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (wished) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    addToCart({
      ...product,
      id: product._id,
      qty: 1,
      selectedWeight: product.weights?.[0]?.label || product.weight || "Default",
      price: product.weights?.[0]?.price || product.price
    });

    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  return (
    <motion.div
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      className="group relative bg-white rounded-2xl p-3 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full cursor-pointer"
      onClick={() => navigate(`/product/${product._id}`)}
    >
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-full z-50 shadow-lg whitespace-nowrap"
          >
            Added to Cart! ✅
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP SECTION: IMAGE & BADGES */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50 mb-3">
        {/* IMAGE WITH HOVER ZOOM & GRAYSCALE WHEN OUT OF STOCK */}
        <motion.img
          src={product.image}
          alt={product.name}
          animate={{ scale: isHovered && !isOutOfStock ? 1.1 : 1 }}
          transition={{ duration: 0.4 }}
          className={`w-full h-full object-cover transition-all duration-500 ${isOutOfStock ? "grayscale opacity-60" : "grayscale-0 opacity-100"}`}
        />

        {/* WISHLIST HEART */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-all duration-300 z-10 ${wished ? "bg-red-50 text-red-500" : "bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500"
            }`}
        >
          <motion.div whileTap={{ scale: 1.5 }}>
            <Heart size={18} fill={wished ? "currentColor" : "none"} strokeWidth={wished ? 0 : 2} />
          </motion.div>
        </button>

        {/* TOP-LEFT TAG CONTAINER (Prevents Overlap) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10 items-start">
          {/* 1. OUT OF STOCK BADGE */}
          {isOutOfStock && (
            <div className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md">
              OUT OF STOCK
            </div>
          )}

          {/* 2. LOW STOCK BADGE */}
          {isLowStock && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg"
            >
              ONLY {currentStock} LEFT
            </motion.div>
          )}

          {/* 3. TRENDING TAG */}
          {product.tags?.includes("trending") && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-purple-600 text-white text-[9px] font-black px-2 py-1 rounded-md shadow-lg flex items-center gap-1"
            >
              <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
              TRENDING
            </motion.div>
          )}

          {/* 4. BEST VALUE TAG */}
          {product.tags?.includes("best_value") && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-yellow-400 text-gray-900 text-[9px] font-black px-2 py-1 rounded-md shadow-lg"
            >
              BEST VALUE
            </motion.div>
          )}
        </div>

        {/* QUICK VIEW OVERLAY (DESKTOP) */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Eye size={20} className="text-gray-700" />
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: DETAILS */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded-md">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] font-bold text-yellow-700 ml-1">{product.rating || "4.5"}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">({product.numReviews || "23"} reviews)</span>
        </div>

        <h3 className="font-bold text-gray-800 text-sm md:text-base leading-tight line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-black uppercase tracking-wider">
            {product.category}
          </span>
          <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
            {product.weights?.[0]?.label || product.weight || "Pack"}
          </span>
        </div>

        <p className="text-[10px] text-gray-400 italic line-clamp-1">{product.bnName}</p>
      </div>

      {/* BOTTOM SECTION: PRICE & ADD BUTTON */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-lg font-black text-gray-900">₹{product.price}</span>
          {/* Discount Placeholder if applicable */}
          {product.discountPrice && (
            <span className="text-[10px] text-gray-400 line-through">₹{product.originalPrice}</span>
          )}
        </div>

        <motion.button
          whileTap={!isOutOfStock ? { scale: 0.95 } : {}}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`px-3 sm:px-4 py-2 rounded-xl border-2 font-black text-[10px] sm:text-xs tracking-tighter sm:tracking-normal transition-all flex items-center justify-center gap-1 sm:gap-2 min-h-[44px] min-w-[80px] sm:min-w-[100px] whitespace-nowrap ${isOutOfStock
              ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
              : "border-green-600 bg-white text-green-600 hover:bg-green-600 hover:text-white"
            }`}
        >
          {isOutOfStock ? (
            "SOLD OUT"
          ) : (
            <>
              <span className="hidden sm:inline">ADD</span>
              <ShoppingCart size={14} />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
