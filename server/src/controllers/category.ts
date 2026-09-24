import type { Request, Response } from 'express';
import { CategoryModel } from '../models/Category.js';
import { BookModel } from '../models/Book.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/response.js';
import { slugify } from '../utils/slugify.js';

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await CategoryModel.find().sort({ name: 1 }).lean();
  sendSuccess(res, categories);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const slug = slugify(name);
  if (!slug) {
    throw new ApiError(400, 'A valid category name is required.');
  }

  const existing = await CategoryModel.findOne({ slug });
  if (existing) {
    throw new ApiError(409, 'A category with this name already exists.');
  }

  const category = await CategoryModel.create({ name, slug });
  sendSuccess(res, category, undefined, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const slug = slugify(name);
  if (!slug) {
    throw new ApiError(400, 'A valid category name is required.');
  }

  const duplicate = await CategoryModel.findOne({ slug, _id: { $ne: req.params.id } });
  if (duplicate) {
    throw new ApiError(409, 'A category with this name already exists.');
  }

  const category = await CategoryModel.findByIdAndUpdate(
    req.params.id,
    { name, slug },
    { new: true }
  );
  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }
  sendSuccess(res, category);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const booksUsing = await BookModel.countDocuments({ category: req.params.id });
  if (booksUsing > 0) {
    throw new ApiError(409, 'Cannot delete a category that still has books assigned to it.');
  }

  const category = await CategoryModel.findByIdAndDelete(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }
  sendSuccess(res, { id: req.params.id });
});