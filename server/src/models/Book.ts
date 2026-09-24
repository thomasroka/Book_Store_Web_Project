import mongoose, { Schema, model, models } from 'mongoose';
import type { Category } from './Category.js';

export interface BookDoc {
  _id: mongoose.Types.ObjectId;
  title: string;
  author: string;
  isbn: string;
  description: string;
  price: number;
  coverImage: string;
  stock: number;
  category: mongoose.Types.ObjectId | Category;
  ratingAvg: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type Book = BookDoc;

const bookSchema = new Schema<Book>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    author: { type: String, required: true, trim: true, maxlength: 120 },
    isbn: { type: String, trim: true, maxlength: 40 },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    coverImage: { type: String, default: '' },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

bookSchema.index({ title: 'text', author: 'text' });
bookSchema.index({ category: 1 });

export const BookModel = (models.Book as mongoose.Model<Book>) ?? model<Book>('Book', bookSchema);