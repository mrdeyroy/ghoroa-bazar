import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

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
                      ${
                        i === activeImage
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

            <p className="text-gray-600 mt-3 leading-relaxed">
              {product.description}
            </p>

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
                        ${
                          selectedWeight?.label === w.label
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

            {/* ACCORDION */}
            <div className="border-t mt-7 pt-3 space-y-3">
              <details className="group border-b pb-2">
                <summary className="cursor-pointer font-medium flex justify-between">
                  Ingredients and Allergens
                  <span className="group-open:rotate-180 transition">⌄</span>
                </summary>
                <p className="text-gray-600 mt-2">
                  {product.ingredients || "Not provided"}
                </p>
              </details>

              <details className="group border-b pb-2">
                <summary className="cursor-pointer font-medium flex justify-between">
                  Nutrition Facts
                  <span className="group-open:rotate-180 transition">⌄</span>
                </summary>
                <p className="text-gray-600 mt-2">
                  {product.nutrition || "Not provided"}
                </p>
              </details>
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
    </div>
  );
}
