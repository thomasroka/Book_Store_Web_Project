import type { Request, Response } from 'express';
import { BookModel } from '../models/Book.js';
import { UserModel } from '../models/User.js';
import { OrderModel } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { getDashboardStats } from '../services/statsService.js';
import {
  deleteReview,
  listAll,
  setReviewStatus,
} from '../services/reviewService.js';
import {
  listAllOrders,
  updateOrderStatus,
} from '../services/orderService.js';
import type { OrderStatus } from '../types/index.js';

export const dashboard = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getDashboardStats();
  sendSuccess(res, stats);
});

/* ------------------------------- Books ------------------------------- */

export const listBooks = asyncHandler(async (req: Request, res: Response) => {
  const { search, category, lowStock, page, limit } = req.query;
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

  const filter: Record<string, unknown> = {};
  if (typeof category === 'string' && category) filter.category = category;
  if (lowStock === 'true') filter.stock = { $lte: 5 };
  if (typeof search === 'string' && search.trim()) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { author: { $regex: search.trim(), $options: 'i' } },
      { isbn: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const total = await BookModel.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / limitNum));
  const books = await BookModel.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .populate('category', 'name slug')
    .lean();

  sendSuccess(res, books, { page: pageNum, limit: limitNum, total, totalPages });
});

export const getBook = asyncHandler(async (req: Request, res: Response) => {
  const book = await BookModel.findById(req.params.id).populate('category', 'name slug').lean();
  if (!book) {
    throw new ApiError(404, 'Book not found.');
  }
  sendSuccess(res, book);
});

export const createBook = asyncHandler(async (req: Request, res: Response) => {
  const book = await BookModel.create({
    title: req.body.title,
    author: req.body.author,
    isbn: req.body.isbn ?? '',
    description: req.body.description ?? '',
    price: req.body.price,
    coverImage: req.body.coverImage ?? '',
    stock: req.body.stock ?? 0,
    category: req.body.category,
  });
  sendSuccess(res, book, undefined, 201);
});

export const updateBook = asyncHandler(async (req: Request, res: Response) => {
  const book = await BookModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!book) {
    throw new ApiError(404, 'Book not found.');
  }
  sendSuccess(res, book);
});

export const updateStock = asyncHandler(async (req: Request, res: Response) => {
  const book = await BookModel.findByIdAndUpdate(
    req.params.id,
    { stock: req.body.stock },
    { new: true, runValidators: true }
  );
  if (!book) {
    throw new ApiError(404, 'Book not found.');
  }
  sendSuccess(res, book);
});

export const deleteBook = asyncHandler(async (req: Request, res: Response) => {
  const book = await BookModel.findByIdAndDelete(req.params.id);
  if (!book) {
    throw new ApiError(404, 'Book not found.');
  }
  sendSuccess(res, { id: req.params.id });
});

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    throw new ApiError(400, 'No image file provided.');
  }
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  sendSuccess(res, { url: `${baseUrl}/uploads/${file.filename}` }, undefined, 201);
});

/* ------------------------------- Orders ------------------------------ */

export const orders = asyncHandler(async (req: Request, res: Response) => {
  const { status, search, page, limit } = req.query;
  const result = await listAllOrders({
    status: (typeof status === 'string' ? status : undefined) as OrderStatus | undefined,
    search: typeof search === 'string' ? search : undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  sendSuccess(
    res,
    result.orders,
    { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }
  );
});

export const setOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await updateOrderStatus(req.params.id, req.body.status);
  sendSuccess(res, order);
});

/* ------------------------------ Customers ---------------------------- */

export const customers = asyncHandler(async (req: Request, res: Response) => {
  const { search, page, limit } = req.query;
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

  const filter: Record<string, unknown> = { role: 'customer' };
  if (typeof search === 'string' && search.trim()) {
    const term = search.trim();
    filter.$or = [
      { name: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
    ];
  }

  const total = await UserModel.countDocuments(filter);
  const users = await UserModel.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .select('-passwordHash')
    .lean();

  const stats = await OrderModel.aggregate<{
    _id: string;
    orders: number;
    spent: number;
  }>([
    { $match: { status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: { $toString: '$user' },
        orders: { $sum: 1 },
        spent: { $sum: '$total' },
      },
    },
  ]);
  const statsMap = new Map(stats.map((s) => [s._id, s]));

  const data = users.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    createdAt: u.createdAt,
    orders: statsMap.get(u._id.toString())?.orders ?? 0,
    spent: statsMap.get(u._id.toString())?.spent ?? 0,
  }));

  sendSuccess(res, data, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.max(1, Math.ceil(total / limitNum)),
  });
});

/* ------------------------------- Reviews ----------------------------- */

export const reviews = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const reviews = await listAll(
    (typeof status === 'string' && ['pending', 'approved', 'rejected'].includes(status)
      ? status
      : undefined) as 'pending' | 'approved' | 'rejected' | undefined
  );
  sendSuccess(res, reviews);
});

export const moderateReview = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Invalid review status.');
  }
  await setReviewStatus(req.params.id, status);
  sendSuccess(res, { id: req.params.id, status });
});

export const badReviews = asyncHandler(async (req: Request, res: Response) => {
  await deleteReview(req.params.id);
  sendSuccess(res, { id: req.params.id });
});