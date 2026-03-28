import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { NotificationProvider } from "./context/NotificationContext";
import { SocketProvider } from "./context/SocketContext";
import { StockProvider } from "./context/StockContext";
import "./index.css";

console.log("Running in:", import.meta.env.MODE);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <StockProvider>
          <CartProvider>
            <WishlistProvider>
              <NotificationProvider>
                <App />
              </NotificationProvider>
            </WishlistProvider>
          </CartProvider>
        </StockProvider>
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);
