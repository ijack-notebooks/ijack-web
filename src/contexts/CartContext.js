"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (notebook, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.notebookId === notebook._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.notebookId === notebook._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { notebookId: notebook._id, notebook, quantity }];
    });
  };

  const removeFromCart = (notebookId) => {
    setCart((prevCart) => prevCart.filter((item) => item.notebookId !== notebookId));
  };

  const updateQuantity = (notebookId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(notebookId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.notebookId === notebookId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.notebook.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

