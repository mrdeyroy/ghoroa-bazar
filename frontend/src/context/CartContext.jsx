import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {

  // ✅ Make userId reactive
  const [userId, setUserId] = useState(
    localStorage.getItem("userId") || "guest"
  );

  // ✅ Listen for login/logout changes
  useEffect(() => {
    const handleAuthChange = () => {
      setUserId(localStorage.getItem("userId") || "guest");
    };

    window.addEventListener("authChanged", handleAuthChange);
    return () => window.removeEventListener("authChanged", handleAuthChange);
  }, []);

  // ✅ Generate key dynamically
  const getCartKey = (id) => `cart_${id}`;

  // 🔹 Get default weight
  const getDefaultWeight = (item) => {
    if (Array.isArray(item.weights) && item.weights.length > 0) {
      return item.weights[0].label;
    }
    if (item.weight) return item.weight;
    return "";
  };

  const normalizeWeight = (item) => {
    if (!item.selectedWeight || item.selectedWeight === "default") {
      return {
        ...item,
        selectedWeight: getDefaultWeight(item)
      };
    }
    return item;
  };

  // ✅ Load cart initially
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(getCartKey(userId));
    if (!saved) return [];
    return JSON.parse(saved).map(item => normalizeWeight(item));
  });

  // ✅ Reload cart when user changes
  useEffect(() => {
    const saved = localStorage.getItem(getCartKey(userId));
    if (!saved) {
      setCart([]);
    } else {
      setCart(JSON.parse(saved));
    }
  }, [userId]);

  // ✅ Save cart when it updates
  useEffect(() => {
    localStorage.setItem(getCartKey(userId), JSON.stringify(cart));
  }, [cart, userId]);

  const addToCart = (product) => {
    const normalizedProduct = normalizeWeight(product);

    setCart(prev => {
      const existing = prev.find(
        item =>
          item.id === normalizedProduct.id &&
          item.selectedWeight === normalizedProduct.selectedWeight
      );

      if (existing) {
        return prev.map(item =>
          item.id === normalizedProduct.id &&
            item.selectedWeight === normalizedProduct.selectedWeight
            ? { ...normalizedProduct, ...item, image: normalizedProduct.image || item.image, qty: item.qty + normalizedProduct.qty }
            : item
        );
      }

      return [...prev, normalizedProduct];
    });
  };

  const increaseQty = (id, weight) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id && item.selectedWeight === weight
          ? { ...item, qty: item.qty + 1 }
          : item
      )
    );
  };

  const decreaseQty = (id, weight) => {
    setCart(prev =>
      prev
        .map(item =>
          item.id === id && item.selectedWeight === weight
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter(item => item.qty > 0)
    );
  };

  const removeItem = (id, weight) => {
    setCart(prev =>
      prev.filter(
        item =>
          !(item.id === id && item.selectedWeight === weight)
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(getCartKey(userId));
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQty,
        decreaseQty,
        removeItem,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
