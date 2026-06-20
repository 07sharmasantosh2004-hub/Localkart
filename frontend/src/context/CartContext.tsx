import { createContext, useContext, type ReactNode } from 'react';
import { useCart } from '../hooks/useCart';
import type { CartItem } from '../hooks/useCart';

interface CartContextType {
  items: CartItem[];
  isLoaded: boolean;
  addItem: (item: CartItem) => void;
  updateQuantity: (itemId: string, businessId: string, quantity: number) => void;
  removeItem: (itemId: string, businessId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemsByBusiness: (businessId: string) => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCart();

  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within CartProvider');
  }
  return context;
}
