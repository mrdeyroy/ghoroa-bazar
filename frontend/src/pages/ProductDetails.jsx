import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { 
  Star, 
  MessageSquare, 
  Send, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Heart, 
  ShoppingCart,
  Loader2,
  Plus,
  Minus,
  ShieldCheck,
  Leaf,
  Truck,
  ThumbsUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "../components/Skeleton";
import ProductCard from "../components/ProductCard";
import BackButton from "../components/BackButton";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();
  const { user, token } = useAuth();
  const { wishlist, addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState("");
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [heartAnimate, setHeartAnimate] = useState(false);

  const mainImageRef = useRef(null);
  const wished = product ? isWishlisted(product._id) : false;

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setQty(1);
        if (data.weights?.length > 0) {
          setSelectedWeight(data.weights[0]);
        } else {
          setSelectedWeight(null);
        }

        const cartProductIds = cart.map(item => item.id).join(",");
        const wishlistProductIds = wishlist.map(item => item._id).join(",");
        const userId = user?.id || "guest";

        fetch(`${import.meta.env.VITE_API_URL}/api/products/recommend/${id}/${userId}?cartProductIds=${cartProductIds}&wishlistProductIds=${wishlistProductIds}`)
          .then(res => res.json())
          .then(list => {
            setRelated(list);
            setLoading(false);
          });
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, [id, user?.id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product._id,
      name: product.name,
      image: product.image,
      qty: qty,
      selectedWeight: selectedWeight?.label || product.weight || "default",
      price: selectedWeight?.price || product.price,
      weights: product.weights,
      stock: product.stock
    });
    setToast(`${product.name} added to cart! ✅`);
    setTimeout(() => setToast(""), 2500);
  };

  const toggleWishlist = () => {
    setHeartAnimate(true);
    setTimeout(() => setHeartAnimate(false), 300);
    if (wished) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setToast("Please login to submit a review");
      setTimeout(() => setToast(""), 2500);
      return;
    }

    setReviewLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}/reviews`, { credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(reviewForm)
      });
      const data = await res.json();

      if (res.ok) {
        setToast("Review submitted successfully! ✅");
        setTimeout(() => setToast(""), 2500);
        setReviewForm({ rating: 5, comment: "" });
        const prodRes = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
        const prodData = await prodRes.json();
        setProduct(prodData);
      } else {
        setToast(data.error || "Failed to submit review");
        setTimeout(() => setToast(""), 2500);
      }
    } catch (err) {
      setToast("Error submitting review");
      setTimeout(() => setToast(""), 2500);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = mainImageRef.current.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomPos({ x, y });
  };

  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={16}
          className={s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <Skeleton height="500px" className="rounded-2xl" />
              <div className="flex gap-4 mt-4">
                <Skeleton width="80px" height="80px" className="rounded-lg" />
                <Skeleton width="80px" height="80px" className="rounded-lg" />
                <Skeleton width="80px" height="80px" className="rounded-lg" />
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton height="40px" width="70%" />
              <Skeleton height="20px" width="30%" />
              <Skeleton height="60px" width="40%" />
              <Skeleton height="100px" />
              <Skeleton height="50px" width="100%" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="p-20 text-center text-gray-500">Product not found</div>;

  const finalPrice = selectedWeight ? selectedWeight.price : product.price;

  return (
    <div className="min-h-screen bg-white">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-24 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[100] animate-in fade-in slide-in-from-right-10 duration-300">
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <BackButton color="#333" margin="0 0 20px 0" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-20">
          
          {/* LEFT COLUMN: IMAGES */}
          <div className="space-y-6">
            <div 
              className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 aspect-square cursor-zoom-in group"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              ref={mainImageRef}
            >
              <motion.img
                key={activeImage}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, { offset, velocity }) => {
                    const swipe = offset.x > 50 ? -1 : offset.x < -50 ? 1 : 0;
                    if (swipe !== 0 && product.images?.length > 1) {
                        const newIdx = (activeImage + swipe + product.images.length) % product.images.length;
                        setActiveImage(newIdx);
                    }
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                src={product.images?.[activeImage]?.url || product.image}
                alt={product.name}
                className={`w-full h-full object-contain transition-transform duration-200 ${isZoomed ? 'scale-[2]' : 'scale-100'}`}
                style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
              />
              
              {/* MOBILE SWIPE INDICATOR */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
                {product.images?.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === activeImage ? "w-6 bg-green-600" : "w-1.5 bg-gray-300"}`} />
                ))}
              </div>
            </div>
            
            {product.images?.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all ${
                      i === activeImage ? "border-green-600 scale-105" : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img src={img.url || img} className="w-full h-full object-cover" alt="thumbnail" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: DETAILS */}
          <div className="flex flex-col space-y-6">
            <div>
              <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-2">
                {product.brand || product.category}
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center bg-green-50 px-3 py-1 rounded-full">
                  <span className="text-green-700 font-bold mr-1">{product.rating || "4.5"}</span>
                  <Star size={14} className="fill-green-600 text-green-600" />
                </div>
                <span className="text-gray-400 text-sm">|</span>
                <span className="text-gray-500 text-sm hover:underline cursor-pointer">
                  {product.numReviews || 0} Ratings & Reviews
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-gray-900">₹{finalPrice}</span>
                {product.oldPrice && (
                  <span className="text-xl text-gray-400 line-through font-medium">₹{product.oldPrice}</span>
                )}
                {product.oldPrice && (
                  <span className="text-green-600 font-bold text-sm bg-green-100 px-2 py-0.5 rounded-lg">
                    {Math.round(((product.oldPrice - finalPrice) / product.oldPrice) * 100)}% OFF
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium italic">Inclusive of all taxes</p>
            </div>

            {/* VARIANT SELECTION */}
            {product.weights?.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-gray-900">Select Variant</p>
                <div className="flex gap-3 flex-wrap">
                  {product.weights.map((w, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedWeight(w)}
                      className={`px-5 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
                        selectedWeight?.label === w.label
                          ? "bg-green-600 text-white border-green-600 shadow-md scale-105"
                          : "border-gray-200 text-gray-600 bg-white hover:border-green-600 hover:text-green-600"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 pt-2">
              <div className="flex-1 flex items-center bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-4 hover:bg-gray-200 transition text-gray-600"
                >
                  <Minus size={18} />
                </button>
                <div className="flex-1 text-center font-bold text-lg">{qty}</div>
                <button 
                  onClick={() => setQty(qty + 1)}
                  className="px-4 py-4 hover:bg-gray-200 transition text-gray-600"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-[2] bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <ShoppingCart size={22} />
                Add to Cart
              </button>

              <button 
                onClick={toggleWishlist}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center ${
                  wished 
                    ? "bg-red-50 border-red-200 text-red-500 shadow-sm" 
                    : "bg-white border-gray-100 text-gray-400 hover:border-red-100 hover:text-red-400"
                } ${heartAnimate ? "scale-125" : "scale-100"}`}
              >
                <Heart size={24} className={wished ? "fill-red-500" : ""} />
              </button>
            </div>

            {/* DESCRIPTION & ACCORDIONS */}
            {/* TRUST BADGES */}
            <div className="grid grid-cols-3 gap-2 pt-4">
              {[
                { icon: ShieldCheck, label: "Secure Payment", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: Leaf, label: "Fresh Products", color: "text-green-600", bg: "bg-green-50" },
                { icon: Truck, label: "Fast Delivery", color: "text-orange-600", bg: "bg-orange-50" }
              ].map((badge, i) => (
                <div key={i} className={`${badge.bg} p-3 rounded-2xl flex flex-col items-center text-center gap-1`}>
                  <badge.icon size={20} className={badge.color} />
                  <span className="text-[10px] font-bold text-gray-700 leading-tight">{badge.label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4">
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                {product.description || "Indulge in the pure, natural flavor of our premium products. Sourced directly from farms to ensure the highest quality and freshness for your kitchen."}
              </p>
            </div>
            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                {['Ingredients', 'Nutrition info'].map((label, idx) => {
                  const key = label.toLowerCase().split(' ')[0];
                  const isOpen = activeAccordion === key;
                  return (
                    <div key={idx} className={idx !== 0 ? "border-t border-gray-100" : ""}>
                      <button
                        onClick={() => setActiveAccordion(isOpen ? null : key)}
                        className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-gray-50 transition"
                      >
                        <span className="font-bold text-gray-800">{label}</span>
                        {isOpen ? <ChevronUp size={20} className="text-green-600" /> : <ChevronDown size={20} className="text-gray-400" />}
                      </button>
                      <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 py-4 opacity-100" : "max-h-0 opacity-0"}`}>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {key === 'ingredients' ? product.ingredients : product.nutrition || "Information coming soon."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        {/* CUSTOMER REVIEWS SECTION */}
        <div className="mt-20 lg:mt-32 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Customer Reviews</h2>
            <div className="flex justify-center items-center gap-2">
              {renderStars(product.rating || 4.5)}
              <span className="text-gray-500 text-sm font-bold">Based on {product.numReviews || 0} verified reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* REVIEW LIST */}
            <div className="lg:col-span-2 space-y-4">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                          {rev.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{rev.name}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                            {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      {renderStars(rev.rating)}
                    </div>
                    <p className="text-gray-600 text-[15px] leading-relaxed italic mb-4">"{rev.comment}"</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(rev.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <button className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-green-600 transition-colors">
                        <ThumbsUp size={14} />
                        Helpful
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                  <p className="text-gray-400 font-bold">No reviews yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>

            {/* REVIEW FORM */}
            <div className="sticky top-24 h-fit bg-gray-50 p-8 rounded-[40px] border border-gray-100 shadow-sm">
              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  <h3 className="text-xl font-black text-gray-900">Share your thoughts</h3>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">My Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                          className={`p-2 rounded-xl transition-all ${reviewForm.rating >= s ? "text-yellow-400 scale-110" : "text-gray-300 scale-100"}`}
                        >
                          <Star size={24} className={reviewForm.rating >= s ? "fill-yellow-400" : ""} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">My Thoughts</label>
                    <textarea
                      required
                      placeholder="Was it worth it? How did it taste?"
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none min-h-[120px] text-sm font-medium transition-all"
                    />
                  </div>
                  <button
                    disabled={reviewLoading}
                    type="submit"
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-green-100"
                  >
                    {reviewLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    Post My Review
                  </button>
                </form>
              ) : (
                <div className="text-center py-10">
                  <User className="mx-auto text-gray-300 mb-4" size={50} />
                  <p className="font-bold text-gray-800 mb-6">Want to review this product?</p>
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full py-3 bg-white border-2 border-green-600 text-green-600 font-bold rounded-2xl hover:bg-green-50 transition"
                  >
                    Login Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RECOMMENDATIONS SECTION */}
        <div className="mt-20 lg:mt-32 border-t border-gray-100 pt-20">
          <h2 className="text-3xl font-black text-gray-900 mb-10 text-center tracking-tight">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
            {related.length > 0 ? (
              related.map(p => (
                <ProductCard key={p._id} product={p} />
              ))
            ) : (
              // Skeletons while loading recommendations
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton height="250px" className="rounded-3xl" />
                  <Skeleton height="20px" width="70%" />
                  <Skeleton height="20px" width="40%" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BUTTON */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[90]">
        <div className="flex gap-3">
          <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden border border-gray-200 h-14">
            <button 
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="px-4 h-full flex items-center"
            >
              <Minus size={16} />
            </button>
            <div className="w-10 text-center font-bold">{qty}</div>
            <button 
              onClick={() => setQty(qty + 1)}
              className="px-4 h-full flex items-center"
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-green-100 h-14 active:scale-95 transition-all"
          >
            <ShoppingCart size={20} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
