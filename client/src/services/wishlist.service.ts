import { api, unwrap } from './api';
import type { WishlistItem } from '../types';

export const wishlistService = {
  async get(): Promise<WishlistItem[]> {
    return unwrap(api.get('/wishlist'));
  },
  async add(bookId: string): Promise<WishlistItem> {
    return unwrap(api.post('/wishlist', { bookId }));
  },
  async remove(bookId: string): Promise<{ id: string }> {
    return unwrap(api.delete(`/wishlist/${bookId}`));
  },
};