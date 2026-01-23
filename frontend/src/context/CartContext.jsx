import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    if (!saved) return [];

    return JSON.parse(saved).map(item => ({
      ...item,
      selectedWeight: item.selectedWeight || "default"
    }));
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(
        item =>
          item.id === product.id &&
          item.selectedWeight === product.selectedWeight
      );

      if (existing) {
        return prev.map(item =>
          item.id === product.id &&
          item.selectedWeight === product.selectedWeight
            ? { ...item, qty: item.qty + product.qty }
            : item
        );
      }

      return [...prev, product];
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
