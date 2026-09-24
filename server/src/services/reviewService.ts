import { ReviewModel } from '../models/Review.js';
import { BookModel } from '../models/Book.js';
import { ApiError } from '../utils/ApiError.js';
import type { ReviewStatus } from '../types/index.js';

export interface ReviewInput {
  rating: number;
  comment?: string;
}

export async function createReview(
  userId: string,
  bookId: string,
  input: ReviewInput
): Promise<Record<string, unknown>> {
  const book = await BookModel.findById(bookId);
  if (!book) {
    throw new ApiError(404, 'Book not found.');
  }

  const existing = await ReviewModel.findOne({ user: userId, book: bookId });
  if (existing) {
    throw new ApiError(409, 'You have already reviewed this book.');
  }

  const review = await ReviewModel.create({
    user: userId,
    book: bookId,
    rating: input.rating,
    comment: input.comment?.trim() ?? '',
    status: 'pending',
  });

  return review.toObject() as unknown as Record<string, unknown>;
}

export async function listApprovedByBook(bookId: string): Promise<Array<Record<string, unknown>>> {
  return ReviewModel.find({ book: bookId, status: 'approved' })
    .sort({ createdAt: -1 })
    .populate('user', 'name')
    .lean();
}

export async function listMine(userId: string): Promise<Array<Record<string, unknown>>> {
  return ReviewModel.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('book', 'title coverImage author')
    .lean();
}

export async function listAll(status?: ReviewStatus): Promise<Array<Record<string, unknown>>> {
  const filter = status ? { status } : {};
  return ReviewModel.find(filter)
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
    .populate('book', 'title coverImage author')
    .lean();
}

export async function setReviewStatus(
  reviewId: string,
  status: ReviewStatus
): Promise<void> {
  const review = await ReviewModel.findByIdAndUpdate(reviewId, { status }, { new: true });
  if (!review) {
    throw new ApiError(404, 'Review not found.');
  }
  await recomputeBookRating(review.book.toString());
}

export async function deleteReview(reviewId: string): Promise<void> {
  const review = await ReviewModel.findByIdAndDelete(reviewId);
  if (!review) {
    throw new ApiError(404, 'Review not found.');
  }
  await recomputeBookRating(review.book.toString());
}

export async function recomputeBookRating(bookId: string): Promise<void> {
  const [result] = await ReviewModel.aggregate<{
    avg: number;
    count: number;
  }>([
    { $match: { book: bookId, status: 'approved' } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const avg = result ? Math.round(result.avg * 10) / 10 : 0;
  const count = result ? result.count : 0;

  await BookModel.updateOne(
    { _id: bookId },
    { $set: { ratingAvg: avg, ratingCount: count } }
  );
}