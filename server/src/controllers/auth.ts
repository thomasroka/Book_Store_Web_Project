import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/response.js';

function toPublicUser(user: {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existing = await UserModel.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ name, email, passwordHash });
  const token = signToken({ sub: user._id.toString(), role: user.role });

  sendSuccess(res, { token, user: toPublicUser(user) }, undefined, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = signToken({ sub: user._id.toString(), role: user.role });
  sendSuccess(res, { token, user: toPublicUser(user) });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.user!.id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  sendSuccess(res, { user: toPublicUser(user) });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const user = await UserModel.findById(req.user!.id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  if (typeof name === 'string' && name.trim()) {
    user.name = name.trim();
  }
  await user.save();
  sendSuccess(res, { user: toPublicUser(user) });
});