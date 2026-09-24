import { api, unwrap } from './api';
import type { Book, BookDetailResult, BookListResult, BookQuery, PaginationMeta } from '../types';

export const bookService = {
  async list(query: BookQuery = {}): Promise<BookListResult> {
    const params: Record<string, string> = {};
    if (query.search) params.search = query.search;
    if (query.category) params.category = query.category;
    if (query.sort) params.sort = query.sort;
    if (query.page) params.page = String(query.page);
    if (query.limit) params.limit = String(query.limit);
    const response = await api.get<{
      success: boolean;
      data: Book[];
      meta: PaginationMeta;
    }>('/books', { params });
    return {
      books: response.data.data,
      page: response.data.meta.page,
      limit: response.data.meta.limit,
      total: response.data.meta.total,
      totalPages: response.data.meta.totalPages,
    };
  },
  async detail(id: string): Promise<BookDetailResult> {
    return unwrap(api.get(`/books/${id}`));
  },
  async featured(): Promise<Book[]> {
    return unwrap(api.get('/books/featured'));
  },
  async newArrivals(): Promise<Book[]> {
    return unwrap(api.get('/books/new'));
  },
};