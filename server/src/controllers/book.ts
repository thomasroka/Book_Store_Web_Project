import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import {
  getBookById,
  getFeaturedBooks,
  getNewArrivals,
  listBooks,
  type BookSort,
} from '../services/bookService.js';
import { listApprovedByBook } from '../services/reviewService.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { search, category, sort, page, limit } = req.query;

  const result = await listBooks({
    search: typeof search === 'string' ? search : undefined,
    category: typeof category === 'string' ? category : undefined,
    sort: (typeof sort === 'string' ? sort : undefined) as BookSort | undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  sendSuccess(
    res,
    result.books,
    { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }
  );
});

export const detail = asyncHandler(async (req: Request, res: Response) => {
  const book = await getBookById(req.params.id);
  const reviews = await listApprovedByBook(req.params.id);
  sendSuccess(res, { book, reviews });
});

export const featured = asyncHandler(async (_req: Request, res: Response) => {
  const books = await getFeaturedBooks(8);
  sendSuccess(res, books);
});

export const newArrivals = asyncHandler(async (_req: Request, res: Response) => {
  const books = await getNewArrivals(8);
  sendSuccess(res, books);
});