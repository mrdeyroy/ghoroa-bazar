import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {

  // 🔹 Get real default weight from product schema
  const getDefaultWeight = (item) => {
    // Case 1: weights array (PRIMARY)
    if (Array.isArray(item.weights) && item.weights.length > 0) {
      return item.weights[0].label; // 👈 exact default
    }

    // Case 2: legacy single weight
    if (item.weight) return item.weight;

    return ""; // should rarely happen
  };

  // 🔹 Normalize cart item
  const normalizeWeight = (item) => {
    if (!item.selectedWeight || item.selectedWeight === "default") {
      return {
        ...item,
        selectedWeight: getDefaultWeight(item)
      };
    }
    return item;
  };

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    if (!saved) return [];

    return JSON.parse(saved).map(item => normalizeWeight(item));
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

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
            ? { ...item, qty: item.qty + normalizedProduct.qty }
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
    localStorage.removeItem("cart");
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
