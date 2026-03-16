import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";
import BackButton from "../components/BackButton";
import { Heart } from "lucide-react";

export default function Wishlist() {
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-white py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
            <BackButton color="#333" margin="0" />
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                My Wishlist <Heart className="text-red-500 fill-red-500" size={24} />
            </h1>
            <div className="w-10"></div> {/* Spacer for symmetry */}
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
            <Heart size={60} className="mx-auto text-gray-200 mb-4" />
            <p className="text-xl font-bold text-gray-400">Your wishlist is empty</p>
            <p className="text-sm text-gray-400 mt-2">Add items you love to find them easily later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
            {wishlist.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
