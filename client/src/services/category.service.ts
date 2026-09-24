import { api, unwrap } from './api';
import type { Category } from '../types';

export const categoryService = {
  async list(): Promise<Category[]> {
    return unwrap(api.get('/categories'));
  },
  async create(name: string): Promise<Category> {
    return unwrap(api.post('/categories', { name }));
  },
  async update(id: string, name: string): Promise<Category> {
    return unwrap(api.put(`/categories/${id}`, { name }));
  },
  async remove(id: string): Promise<{ id: string }> {
    return unwrap(api.delete(`/categories/${id}`));
  },
};