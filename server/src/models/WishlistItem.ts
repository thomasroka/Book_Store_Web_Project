import mongoose, { Schema, model, models } from 'mongoose';
import type { User } from './User.js';

export interface WishlistItemDoc {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId | User;
  book: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type WishlistItem = WishlistItemDoc;

const wishlistItemSchema = new Schema<WishlistItem>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  },
  { timestamps: true }
);

wishlistItemSchema.index({ user: 1, book: 1 }, { unique: true });

export const WishlistItemModel =
  (models.WishlistItem as mongoose.Model<WishlistItem>) ??
  model<WishlistItem>('WishlistItem', wishlistItemSchema);