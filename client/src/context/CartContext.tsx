import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { cartService } from '../services/cart.service';
import type { CartItem } from '../types';
import { useAuth } from './AuthContext';

interface CartContextValue {
  items: CartItem[];
  total: number;
  count: number;
  loading: boolean;
  setItems: (items: CartItem[]) => void;
  refresh: () => Promise<void>;
  add: (bookId: string, quantity?: number) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const cart = await cartService.get();
      setItems(cart.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = useCallback(
    async (bookId: string, quantity = 1) => {
      await cartService.add(bookId, quantity);
      await refresh();
    },
    [refresh]
  );

  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      await cartService.updateQuantity(id, quantity);
      await refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await cartService.remove(id);
      await refresh();
    },
    [refresh]
  );

  const clear = useCallback(async () => {
    await cartService.clear();
    setItems([]);
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.book.price, 0),
    [items]
  );
  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, total, count, loading, setItems, refresh, add, updateQuantity, remove, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}