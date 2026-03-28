import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";

const StockContext = createContext();

export const StockProvider = ({ children }) => {
  const socket = useSocket();
  const [stocks, setStocks] = useState({});

  useEffect(() => {
    if (!socket) return;

    const handleStockUpdate = ({ productId, stock }) => {
      setStocks((prev) => ({
        ...prev,
        [productId]: stock,
      }));
    };

    socket.on("stockUpdated", handleStockUpdate);

    return () => {
      socket.off("stockUpdated", handleStockUpdate);
    };
  }, [socket]);

  /**
   * Helper to get the most current stock for a product.
   * Falls back to the provided initial value if no real-time update has been received yet.
   */
  const getStock = (productId, initialStock) => {
    return stocks[productId] !== undefined ? stocks[productId] : initialStock;
  };

  return (
    <StockContext.Provider value={{ stocks, getStock }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error("useStock must be used within a StockProvider");
  }
  return context;
};
