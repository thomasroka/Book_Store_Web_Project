import type { Request, Response } from 'express';
import { CartItemModel } from '../models/CartItem.js';
import { BookModel } from '../models/Book.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/response.js';

interface PopulatedBook {
  _id: string;
  title: string;
  author: string;
  price: number;
  coverImage: string;
  stock: number;
  ratingAvg: number;
  ratingCount: number;
}

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const items = await CartItemModel.find({ user: req.user!.id })
    .populate<{ book: PopulatedBook }>(
      'book',
      'title author price coverImage stock ratingAvg ratingCount'
    )
    .sort({ createdAt: -1 })
    .lean();

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.book.price,
    0
  );

  sendSuccess(res, { items, total: Math.round(total * 100) / 100 });
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const { bookId, quantity = 1 } = req.body;

  const book = await BookModel.findById(bookId);
  if (!book) {
    throw new ApiError(404, 'Book not found.');
  }

  const qty = Math.max(1, Number(quantity));

  const existing = await CartItemModel.findOne({ user: req.user!.id, book: bookId });
  let item;
  if (existing) {
    const newQty = existing.quantity + qty;
    if (newQty > book.stock) {
      throw new ApiError(409, `Only ${book.stock} copies of "${book.title}" are available.`);
    }
    item = await CartItemModel.findByIdAndUpdate(existing._id, { quantity: newQty }, { new: true });
  } else {
    if (qty > book.stock && book.stock !== 0) {
      throw new ApiError(409, `Only ${book.stock} copies of "${book.title}" are available.`);
    }
    item = await CartItemModel.create({ user: req.user!.id, book: bookId, quantity: qty });
  }

  sendSuccess(res, item, undefined, 201);
});

export const updateQuantity = asyncHandler(async (req: Request, res: Response) => {
  const { quantity } = req.body;
  const qty = Number(quantity);

  const item = await CartItemModel.findOne({ _id: req.params.id, user: req.user!.id })
    .populate<{ book: { title: string; stock: number } }>('book', 'title stock');
  if (!item) {
    throw new ApiError(404, 'Cart item not found.');
  }

  if (qty > item.book.stock && item.book.stock !== 0) {
    throw new ApiError(409, `Only ${item.book.stock} copies of "${item.book.title}" are available.`);
  }

  item.quantity = qty;
  await item.save();
  sendSuccess(res, item);
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await CartItemModel.findOneAndDelete({
    _id: req.params.id,
    user: req.user!.id,
  });
  if (!item) {
    throw new ApiError(404, 'Cart item not found.');
  }
  sendSuccess(res, { id: req.params.id });
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  await CartItemModel.deleteMany({ user: req.user!.id });
  sendSuccess(res, { cleared: true });
});