import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export function notFound(_req: Request, _res: Response, next: NextFunction): void {
  next(new ApiError(404, 'Route not found.'));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image must be smaller than 5 MB.'
        : 'Upload failed. Please try a different image.';
    res.status(400).json({ success: false, message });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(' ');
    res.status(400).json({ success: false, message });
    return;
  }

  if (err instanceof mongoose.mongo.MongoServerError) {
    if (err.code === 11000) {
      res.status(409).json({ success: false, message: 'This record already exists.' });
      return;
    }
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ success: false, message: 'Invalid identifier provided.' });
    return;
  }

  console.error('[unhandled error]', err);
  const message =
    env.nodeEnv === 'production'
      ? 'Something went wrong. Please try again.'
      : err instanceof Error
        ? err.message
        : 'Something went wrong.';
  res.status(500).json({ success: false, message });
}