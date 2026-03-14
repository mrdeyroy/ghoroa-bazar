import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Star, MessageSquare, Send, User, ChevronDown } from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState("");

  // ⭐ NEW: selected weight
  const [selectedWeight, setSelectedWeight] = useState(null);
  const { user, token } = useAuth();
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setQty(1);

        // ⭐ auto select first weight
        if (data.weights?.length > 0) {
          setSelectedWeight(data.weights[0]);
        } else {
          setSelectedWeight(null);
        }

        fetch(`http://localhost:5000/api/products?category=${data.category}`)
          .then(res => res.json())
          .then(list => setRelated(list.filter(p => p._id !== data._id)));
      });
  }, [id]);

  if (!product) return <p className="p-6">Loading...</p>;

  const finalPrice = selectedWeight ? selectedWeight.price : product.price;

  const handleAddToCart = () => {
    addToCart({
      id: product._id,
      name: product.name,
      image: product.image,
      qty: 1,

      // 🔥 THESE TWO LINES FIX EVERYTHING
      selectedWeight: selectedWeight.label,   // "250g"
      price: selectedWeight.price,             // price for 250g

      // optional (helps fallback)
      weights: product.weights,
      stock: product.stock
    });



    setToast(`${product.name} added to cart✅`);
    setTimeout(() => setToast(""), 2500);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setToast("Please login to submit a review");

    setReviewLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(reviewForm)
      });
      const data = await res.json();

      if (res.ok) {
        setToast("Review submitted successfully!✅");
        setReviewForm({ rating: 5, comment: "" });
        // Refresh product data
        const prodRes = await fetch(`http://localhost:5000/api/products/${id}`);
        const prodData = await prodRes.json();
        setProduct(prodData);
      } else {
        setToast(data.error || "Failed to submit review");
      }
    } catch (err) {
      setToast("Error submitting review");
    } finally {
      setReviewLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-700 py-16 px-6">

      {/* TOAST */}
      {toast && (
        <div className="fixed top-6 right-6 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* WHITE CARD */}
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-emerald-200 p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

          {/* LEFT — IMAGE */}
          <div className="bg-[#fbfaf2] rounded-2xl p-8 shadow-sm border border-emerald-100">
            <img
              src={product.images?.[activeImage] || product.image}
              className="max-h-[420px] w-full object-contain rounded-lg"
            />

            {product.images?.length > 1 && (
              <div className="flex gap-3 mt-6">
                {product.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 object-cover rounded-xl cursor-pointer border transition
                      ${i === activeImage
                        ? "border-emerald-700 ring-2 ring-emerald-300"
                        : "border-gray-300 hover:border-gray-500"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — DETAILS */}
          <div className="pt-2">
            <p className="uppercase tracking-widest text-gray-500 text-xs">
              {product.brand || product.category}
            </p>

            <h1 className="text-3xl font-semibold mt-1">{product.name}</h1>

            {/* ⭐ RATING SUMMARY */}
            <div className="flex items-center gap-3 mt-2">
              {renderStars(product.rating)}
              <span className="text-sm text-gray-500">
                ({product.numReviews || 0} reviews)
              </span>
            </div>

            <p className="text-gray-600 mt-3 leading-relaxed">
              {product.description}
            </p>

            {/* ACCORDIONS */}
            <div className="mt-8 space-y-4">
              {/* Ingredients */}
              <div className="border-b border-gray-100 pb-4">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "ingredients" ? null : "ingredients")}
                  className="flex justify-between items-center w-full text-left font-bold text-gray-800"
                >
                  Ingredients
                  <ChevronDown className={`transition-transform ${activeAccordion === "ingredients" ? "rotate-180" : ""}`} size={20} />
                </button>
                {activeAccordion === "ingredients" && (
                  <p className="mt-3 text-gray-600 text-sm leading-relaxed animate-fadeIn">
                    {product.ingredients || "No ingredients information available."}
                  </p>
                )}
              </div>

              {/* Nutrition */}
              <div className="border-b border-gray-100 pb-4">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "nutrition" ? null : "nutrition")}
                  className="flex justify-between items-center w-full text-left font-bold text-gray-800"
                >
                  Nutrition Facts
                  <ChevronDown className={`transition-transform ${activeAccordion === "nutrition" ? "rotate-180" : ""}`} size={20} />
                </button>
                {activeAccordion === "nutrition" && (
                  <p className="mt-3 text-gray-600 text-sm leading-relaxed animate-fadeIn">
                    {product.nutrition || "No nutrition information available."}
                  </p>
                )}
              </div>
            </div>

            {/* PRICE */}
            <div className="flex items-center gap-3 mt-5">
              {product.oldPrice && (
                <span className="line-through text-gray-400 text-lg">
                  ₹{product.oldPrice}
                </span>
              )}
              <span className="text-2xl font-bold">₹{finalPrice}</span>
            </div>

            {/* ⭐ WEIGHT SELECTION */}
            {product.weights?.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-2">Select Weight</p>
                <div className="flex gap-3 flex-wrap">
                  {product.weights.map((w, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedWeight(w)}
                      className={`px-4 py-2 rounded-lg border text-sm transition
                        ${selectedWeight?.label === w.label
                          ? "bg-emerald-700 text-white border-emerald-700"
                          : "border-gray-300 hover:border-gray-500"
                        }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ADD TO CART */}
            <button
              onClick={handleAddToCart}
              className="mt-6 px-6 py-3 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white shadow-md hover:shadow-lg transition"
            >
              Add to Cart
            </button>
          </div>

          {/* ⭐ REVIEWS SECTION */}
          <div className="mt-12 border-t pt-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="text-emerald-700" size={24} />
              Customer Reviews
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Review List */}
              <div className="space-y-6">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev, idx) => (
                    <div key={idx} className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xs">
                            {rev.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-sm">{rev.name}</span>
                        </div>
                        {renderStars(rev.rating)}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{rev.comment}</p>
                      <p className="text-[10px] text-gray-400 mt-3">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-sm">No reviews yet. Be the first to review!</p>
                )}
              </div>

              {/* Submit Review Form */}
              <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 h-fit">
                {user ? (
                  <>
                    <h3 className="font-bold text-emerald-900 mb-4">Write a Review</h3>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Your Rating</label>
                        <select
                          value={reviewForm.rating}
                          onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                          className="w-full mt-1 p-2 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                          <option value="5">5 Stars - Excellent</option>
                          <option value="4">4 Stars - Very Good</option>
                          <option value="3">3 Stars - Good</option>
                          <option value="2">2 Stars - Fair</option>
                          <option value="1">1 Star - Poor</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Comment</label>
                        <textarea
                          required
                          placeholder="Share your experience with this product..."
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          className="w-full mt-1 p-3 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px] text-sm"
                        />
                      </div>
                      <button
                        disabled={reviewLoading}
                        type="submit"
                        className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10"
                      >
                        {reviewLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />}
                        Submit Review
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <User className="mx-auto text-emerald-200 mb-2" size={40} />
                    <p className="text-sm text-emerald-900 font-medium">Please login to write a review</p>
                    <button
                      onClick={() => window.location.href = "/login"}
                      className="mt-3 text-emerald-700 font-bold hover:underline text-sm"
                    >
                      Go to Login
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RELATED */}
          {related.length > 0 && (
            <div className="mt-10">
              <p className="font-medium mb-3">You may also like</p>
              <div className="grid grid-cols-2 gap-6">
                {related.slice(0, 2).map(p => (
                  <div
                    key={p._id}
                    onClick={() => (window.location.href = `/product/${p._id}`)}
                    className="rounded-2xl border bg-white p-4 hover:shadow-xl hover:-translate-y-[2px] transition cursor-pointer"
                  >
                    <img
                      src={p.image}
                      className="h-28 mx-auto object-contain"
                    />
                    <p className="mt-2 text-sm text-center font-medium">
                      {p.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
