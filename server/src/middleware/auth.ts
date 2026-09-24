import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';

export async function protect(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required. Please log in.');
    }

    const token = header.slice(7).trim();
    if (!token) {
      throw new ApiError(401, 'Authentication required. Please log in.');
    }

    const payload = verifyToken(token);
    const user = await UserModel.findById(payload.sub).lean();
    if (!user) {
      throw new ApiError(401, 'User no longer exists.');
    }

    req.user = { id: user._id.toString(), role: user.role, email: user.email };
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
      next(new ApiError(401, 'Your session is invalid or has expired. Please log in again.'));
      return;
    }
    next(err);
  }
}