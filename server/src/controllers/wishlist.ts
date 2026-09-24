import type { Request, Response } from 'express';
import { WishlistItemModel } from '../models/WishlistItem.js';
import { BookModel } from '../models/Book.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/response.js';

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const items = await WishlistItemModel.find({ user: req.user!.id })
    .populate('book', 'title author price coverImage stock ratingAvg ratingCount')
    .sort({ createdAt: -1 })
    .lean();
  sendSuccess(res, items);
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const { bookId } = req.body;

  const book = await BookModel.exists({ _id: bookId });
  if (!book) {
    throw new ApiError(404, 'Book not found.');
  }

  const existing = await WishlistItemModel.findOne({ user: req.user!.id, book: bookId });
  if (existing) {
    sendSuccess(res, existing);
    return;
  }

  const item = await WishlistItemModel.create({ user: req.user!.id, book: bookId });
  sendSuccess(res, item, undefined, 201);
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await WishlistItemModel.findOneAndDelete({
    user: req.user!.id,
    book: req.params.bookId,
  });
  if (!item) {
    throw new ApiError(404, 'Wishlist item not found.');
  }
  sendSuccess(res, { id: req.params.bookId });
});