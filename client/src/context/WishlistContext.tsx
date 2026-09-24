import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { wishlistService } from '../services/wishlist.service';
import type { WishlistItem } from '../types';
import { useAuth } from './AuthContext';

interface WishlistContextValue {
  items: WishlistItem[];
  loading: boolean;
  bookIds: Set<string>;
  has: (bookId: string) => boolean;
  toggle: (bookId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      setItems(await wishlistService.get());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const bookIds = useMemo(() => new Set(items.map((item) => String(item.book._id))), [items]);

  const has = useCallback(
    (bookId: string) => bookIds.has(bookId),
    [bookIds]
  );

  const toggle = useCallback(
    async (bookId: string) => {
      if (bookIds.has(bookId)) {
        await wishlistService.remove(bookId);
      } else {
        await wishlistService.add(bookId);
      }
      await refresh();
    },
    [bookIds, refresh]
  );

  return (
    <WishlistContext.Provider value={{ items, loading, bookIds, has, toggle, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}