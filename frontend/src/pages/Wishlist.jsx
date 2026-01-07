import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";

export default function Wishlist() {
  const { wishlist } = useWishlist();

  return (
    <>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <h2>My Wishlist</h2>

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
