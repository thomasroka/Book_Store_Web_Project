import mongoose, { Schema, model, models } from 'mongoose';
import type { User } from './User.js';

export interface CartItemDoc {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId | User;
  book: mongoose.Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CartItem = CartItemDoc;

const cartItemSchema = new Schema<CartItem>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { timestamps: true }
);

cartItemSchema.index({ user: 1, book: 1 }, { unique: true });

export const CartItemModel =
  (models.CartItem as mongoose.Model<CartItem>) ?? model<CartItem>('CartItem', cartItemSchema);