import type { Request, Response } from 'express';
import { CartItemModel } from '../models/CartItem.js';
import {
  createOrderFromCart,
  getUserOrder,
  listUserOrders,
} from '../services/orderService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import type { ShippingInfo } from '../models/Order.js';

export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const shippingInfo: ShippingInfo = {
    name: req.body.name,
    address: req.body.address,
    city: req.body.city,
    postalCode: req.body.postalCode,
    phone: req.body.phone ?? '',
  };

  const order = await createOrderFromCart(req.user!.id, shippingInfo);
  await CartItemModel.deleteMany({ user: req.user!.id });

  sendSuccess(res, order, undefined, 201);
});

export const myOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));
  const result = await listUserOrders(req.user!.id, page, limit);
  sendSuccess(
    res,
    result.orders,
    { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }
  );
});

export const orderDetail = asyncHandler(async (req: Request, res: Response) => {
  const order = await getUserOrder(req.user!.id, req.params.id);
  sendSuccess(res, order);
});