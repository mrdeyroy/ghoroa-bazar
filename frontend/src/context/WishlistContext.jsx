import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id || "guest";

  const getWishlistKey = (id) => `wishlist_${id}`;

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem(getWishlistKey(userId));
    return saved ? JSON.parse(saved) : [];
  });

  // ✅ Reload wishlist when user changes
  useEffect(() => {
    const saved = localStorage.getItem(getWishlistKey(userId));
    if (!saved) {
      setWishlist([]);
    } else {
      setWishlist(JSON.parse(saved));
    }
  }, [userId]);

  // ✅ Save wishlist when it updates
  useEffect(() => {
    localStorage.setItem(getWishlistKey(userId), JSON.stringify(wishlist));
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
