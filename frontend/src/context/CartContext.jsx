import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.product_id);
      if (existing) {
        return prev.map(i => i.product_id === product.product_id
          ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (product_id) => {
    setCart(prev => prev.filter(i => i.product_id !== product_id));
  };

  const updateQty = (product_id, qty) => {
    if (qty < 1) return removeFromCart(product_id);
    setCart(prev => prev.map(i => i.product_id === product_id ? { ...i, qty } : i));
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, total, count, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);