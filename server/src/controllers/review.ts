import type { Request, Response } from 'express';
import {
  createReview,
  listApprovedByBook,
  listMine,
} from '../services/reviewService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const review = await createReview(req.user!.id, req.params.bookId, {
    rating: req.body.rating,
    comment: req.body.comment,
  });
  sendSuccess(res, review, undefined, 201);
});

export const byBook = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await listApprovedByBook(req.params.bookId);
  sendSuccess(res, reviews);
});

export const mine = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await listMine(req.user!.id);
  sendSuccess(res, reviews);
});