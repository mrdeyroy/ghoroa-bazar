import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const userId = localStorage.getItem("userId");

  const [wishlist, setWishlist] = useState(() => {
    if (!userId) return [];
    const saved = localStorage.getItem(`wishlist_${userId}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (userId) {
      localStorage.setItem(
        `wishlist_${userId}`,
        JSON.stringify(wishlist)
      );
    }
  }, [wishlist, userId]);

  const addToWishlist = (product) => {
    setWishlist((prev) => {
      if (prev.some((p) => p._id === product._id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((p) => p._id !== id));
  };

  const isWishlisted = (id) => {
    return wishlist.some((p) => p._id === id);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isWishlisted
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// ✅ THIS EXPORT WAS MISSING / BROKEN BEFORE
export function useWishlist() {
  return useContext(WishlistContext);
}
