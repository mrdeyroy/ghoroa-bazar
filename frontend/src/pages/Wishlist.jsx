import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";
import BackButton from "../components/BackButton";

export default function Wishlist() {
  const { wishlist } = useWishlist();

  return (
    <>
      <div style={{ padding: "40px" }}>
        <BackButton />

        <h2
          style={{
            color: "#1f7a3b",
            fontWeight: "700",
            fontSize: "22px",
            marginBottom: "12px",
            textAlign: "center"
          }}
        >
          My Wishlist
        </h2>
        

        {wishlist.length === 0 && <p>No items in wishlist</p>}

        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {wishlist.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </>
  );
}
