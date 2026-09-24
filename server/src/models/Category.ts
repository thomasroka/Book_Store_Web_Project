import mongoose, { Schema, model, models } from 'mongoose';

export interface CategoryDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Category = CategoryDoc;

const categorySchema = new Schema<Category>(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 80 },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
  },
  { timestamps: true }
);

export const CategoryModel =
  (models.Category as mongoose.Model<Category>) ?? model<Category>('Category', categorySchema);