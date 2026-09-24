import { api, unwrap } from './api';
import type { Cart, CartItem } from '../types';

export const cartService = {
  async get(): Promise<Cart> {
    return unwrap(api.get('/cart'));
  },
  async add(bookId: string, quantity = 1): Promise<CartItem> {
    return unwrap(api.post('/cart', { bookId, quantity }));
  },
  async updateQuantity(id: string, quantity: number): Promise<CartItem> {
    return unwrap(api.put(`/cart/${id}`, { quantity }));
  },
  async remove(id: string): Promise<{ id: string }> {
    return unwrap(api.delete(`/cart/${id}`));
  },
  async clear(): Promise<{ cleared: boolean }> {
    return unwrap(api.delete('/cart'));
  },
};