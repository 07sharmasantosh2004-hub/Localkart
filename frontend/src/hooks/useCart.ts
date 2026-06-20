import { useCallback, useEffect, useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  businessId: string;
  businessName: string;
  businessType: 'kirana' | 'food' | 'tiffin';
  image?: string;
}

const CART_STORAGE_KEY = 'localkart_cart';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setItems(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, isLoaded]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.businessId === item.businessId);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.businessId === item.businessId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, businessId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => !(i.id === itemId && i.businessId === businessId));
      }
      return prev.map((i) =>
        i.id === itemId && i.businessId === businessId
          ? { ...i, quantity }
          : i
      );
    });
  }, []);

  const removeItem = useCallback((itemId: string, businessId: string) => {
    setItems((prev) => prev.filter((i) => !(i.id === itemId && i.businessId === businessId)));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const getTotalPrice = useCallback(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const getItemsByBusiness = useCallback((businessId: string) => {
    return items.filter((i) => i.businessId === businessId);
  }, [items]);

  return {
    items,
    isLoaded,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getItemsByBusiness,
  };
}
