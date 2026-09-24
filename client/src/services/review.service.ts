import { api, unwrap } from './api';
import type { Review } from '../types';

export interface ReviewInput {
  rating: number;
  comment: string;
}

export const reviewService = {
  async byBook(bookId: string): Promise<Review[]> {
    return unwrap(api.get(`/reviews/book/${bookId}`));
  },
  async create(bookId: string, input: ReviewInput): Promise<Review> {
    return unwrap(api.post(`/reviews/book/${bookId}`, input));
  },
  async mine(): Promise<Review[]> {
    return unwrap(api.get('/reviews/mine'));
  },
};