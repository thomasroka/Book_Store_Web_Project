import { api, unwrap } from './api';
import type { Order, PaginationMeta, ShippingInfo } from '../types';

export const orderService = {
  async checkout(shipping: ShippingInfo): Promise<Order> {
    return unwrap(api.post('/orders', shipping));
  },
  async mine(page = 1, limit = 10): Promise<{ orders: Order[]; meta: PaginationMeta }> {
    const response = await api.get<{ success: boolean; data: Order[]; meta: PaginationMeta }>(
      '/orders',
      { params: { page, limit } }
    );
    return { orders: response.data.data, meta: response.data.meta };
  },
  async detail(id: string): Promise<Order> {
    return unwrap(api.get(`/orders/${id}`));
  },
};