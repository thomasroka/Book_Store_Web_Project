import { api, unwrap } from './api';
import type {
  Book,
  Customer,
  DashboardStats,
  Order,
  OrderStatus,
  PaginationMeta,
  Review,
  ReviewStatus,
} from '../types';

export interface AdminBookInput {
  title: string;
  author: string;
  category: string;
  price: number;
  stock: number;
  isbn?: string;
  description?: string;
  coverImage?: string;
}

export interface AdminListResult<T> {
  items: T[];
  meta: PaginationMeta;
}

async function listWithMeta<T>(
  path: string,
  params: Record<string, string | number | undefined>
): Promise<AdminListResult<T>> {
  const response = await api.get<{ success: boolean; data: T[]; meta: PaginationMeta }>(path, {
    params,
  });
  return { items: response.data.data, meta: response.data.meta };
}

export const adminService = {
  async stats(): Promise<DashboardStats> {
    return unwrap(api.get('/admin/stats'));
  },
  async listBooks(params: {
    search?: string;
    category?: string;
    lowStock?: boolean;
    page?: number;
    limit?: number;
  }): Promise<AdminListResult<Book>> {
    return listWithMeta<Book>('/admin/books', {
      search: params.search || undefined,
      category: params.category || undefined,
      lowStock: params.lowStock ? 'true' : undefined,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    });
  },
  async getBook(id: string): Promise<Book> {
    return unwrap(api.get(`/admin/books/${id}`));
  },
  async createBook(input: AdminBookInput): Promise<Book> {
    return unwrap(api.post('/admin/books', input));
  },
  async updateBook(id: string, input: Partial<AdminBookInput>): Promise<Book> {
    return unwrap(api.put(`/admin/books/${id}`, input));
  },
  async updateStock(id: string, stock: number): Promise<Book> {
    return unwrap(api.patch(`/admin/books/${id}/stock`, { stock }));
  },
  async deleteBook(id: string): Promise<{ id: string }> {
    return unwrap(api.delete(`/admin/books/${id}`));
  },
  async listOrders(params: {
    status?: OrderStatus;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<AdminListResult<Order>> {
    return listWithMeta<Order>('/admin/orders', {
      status: params.status || undefined,
      search: params.search || undefined,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    });
  },
  async setOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    return unwrap(api.patch(`/admin/orders/${id}/status`, { status }));
  },
  async listCustomers(params: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<AdminListResult<Customer>> {
    return listWithMeta<Customer>('/admin/customers', {
      search: params.search || undefined,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    });
  },
  async listReviews(status?: ReviewStatus): Promise<Review[]> {
    return unwrap(api.get('/admin/reviews', { params: status ? { status } : {} }));
  },
  async moderateReview(id: string, status: ReviewStatus): Promise<{ id: string; status: ReviewStatus }> {
    return unwrap(api.patch(`/admin/reviews/${id}`, { status }));
  },
  async deleteReview(id: string): Promise<{ id: string }> {
    return unwrap(api.delete(`/admin/reviews/${id}`));
  },
  async uploadImage(file: File): Promise<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    return unwrap(
      api.post('/admin/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    );
  },
};