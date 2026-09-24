import mongoose, { Schema, model, models } from 'mongoose';
import type { ReviewStatus } from '../types/index.js';
import type { User } from './User.js';

export interface ReviewDoc {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId | User;
  book: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type Review = ReviewDoc;

const reviewSchema = new Schema<Review>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

reviewSchema.index({ book: 1, status: 1 });
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

export const ReviewModel =
  (models.Review as mongoose.Model<Review>) ?? model<Review>('Review', reviewSchema);