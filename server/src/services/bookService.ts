import { BookModel } from '../models/Book.js';
import { ApiError } from '../utils/ApiError.js';

export type BookSort = 'newest' | 'price-asc' | 'price-desc' | 'rating';

export interface BookListQuery {
  search?: string;
  category?: string;
  sort?: BookSort;
  page?: number;
  limit?: number;
}

export interface BookListResult {
  books: Array<Record<string, unknown>>;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export async function listBooks(query: BookListQuery): Promise<BookListResult> {
  const { search, category, sort = 'newest' } = query;
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(60, Math.max(1, query.limit ?? 12));

  const filter: Record<string, unknown> = {};
  if (category) {
    filter.category = category;
  }
  if (search && search.trim()) {
    const term = search.trim();
    filter.$or = [
      { title: { $regex: term, $options: 'i' } },
      { author: { $regex: term, $options: 'i' } },
      { isbn: { $regex: term, $options: 'i' } },
    ];
  }

  const sortMap: Record<BookSort, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    rating: { ratingAvg: -1, ratingCount: -1 },
  };

  const total = await BookModel.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const books = await BookModel.find(filter)
    .sort(sortMap[sort])
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('category', 'name slug')
    .lean();

  return { books, page, limit, total, totalPages };
}

export async function getBookById(id: string): Promise<Record<string, unknown>> {
  const book = await BookModel.findById(id).populate('category', 'name slug').lean();
  if (!book) {
    throw new ApiError(404, 'Book not found.');
  }
  return book;
}

export async function getFeaturedBooks(limit = 8): Promise<Array<Record<string, unknown>>> {
  return BookModel.find()
    .sort({ ratingAvg: -1, ratingCount: -1 })
    .limit(limit)
    .populate('category', 'name slug')
    .lean();
}

export async function getNewArrivals(limit = 8): Promise<Array<Record<string, unknown>>> {
  return BookModel.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('category', 'name slug')
    .lean();
}