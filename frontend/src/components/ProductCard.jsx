import { useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const navigate = useNavigate();
  const heartRef = useRef(null);

  const [showToast, setShowToast] = useState(false);

  const wished = isWishlisted(product._id);
  const isOutOfStock = !product.stock || product.stock === 0;

  const handleWishlistClick = (e) => {
    e.stopPropagation();

    if (heartRef.current) {
      heartRef.current.style.transform = "scale(1.35)";
      setTimeout(() => {
        heartRef.current.style.transform = wished ? "scale(1.15)" : "scale(1)";
      }, 150);
    }

    wished
      ? removeFromWishlist(product._id)
      : addToWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart({
      ...product,
      id: product._id,
      qty: 1,
      selectedWeight: product.defaultWeight || product.weight,
      price: product.price
    });


    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <>
      {/* TOAST */}
      {showToast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#1f7a3b",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: "8px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
            fontSize: "14px",
            fontWeight: "600",
            zIndex: 9999,
            animation: "slideIn 0.3s ease"
          }}
        >
          ✅ Added to cart
        </div>
      )}

      {/* PRODUCT CARD */}
      <div
        onClick={() => navigate(`/product/${product._id}`)}
        style={{
          width: "220px",
          background: "#fefffd",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          padding: "12px",
          position: "relative",
          opacity: isOutOfStock ? 0.5 : 1,
          cursor: "pointer"
        }}
      >
        {/* ❤️ Wishlist */}
        <span
          ref={heartRef}
          onClick={handleWishlistClick}
          onMouseEnter={() => {
            if (heartRef.current)
              heartRef.current.style.transform = "scale(1.2)";
          }}
          onMouseLeave={() => {
            if (heartRef.current)
              heartRef.current.style.transform = wished ? "scale(1.15)" : "scale(1)";
          }}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: wished ? "#ffe6e6" : "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "22px",
            color: wished ? "#e60000" : "#999",
            boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
            transition: "all 0.2s ease",
            transform: wished ? "scale(1.15)" : "scale(1)",
            userSelect: "none",
            zIndex: 2
          }}
        >
          ♥
        </span>

        {/* OUT OF STOCK */}
        {isOutOfStock && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              background: "#000",
              color: "#fff",
              fontSize: "11px",
              padding: "4px 8px",
              borderRadius: "12px",
              fontWeight: "bold",
              zIndex: 2
            }}
          >
            OUT OF STOCK
          </div>
        )}

        <img
          src={product.image}
          alt={product.name}
          style={{
            width: "100%",
            height: "140px",
            objectFit: "cover",
            borderRadius: "8px"
          }}
        />

        <h4 style={{ margin: "8px 0 4px" }}>{product.name}</h4>
        <p style={{ fontSize: "13px", margin: "0" }}>{product.bnName}</p>
        {(product.weight || product.weights?.length > 0) && (
          <p style={{ fontSize: "12px", margin: "2px 0", color: "#666" }}>
            Pack: {product.weight || product.weights[0].label}
          </p>
        )}



        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "10px"
          }}
        >
          <strong>₹{product.price}</strong>

          <button
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            style={{
              background: isOutOfStock ? "#ccc" : "#ffa500",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: isOutOfStock ? "not-allowed" : "pointer",
              fontWeight: "bold",
              color: "#000"
            }}
          >
            ADD
          </button>
        </div>
      </div>

      {/* TOAST ANIMATION */}
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(100%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
    </>
  );
}
