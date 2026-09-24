import { OrderModel } from '../models/Order.js';
import { BookModel } from '../models/Book.js';
import { CartItemModel } from '../models/CartItem.js';
import { ApiError } from '../utils/ApiError.js';
import type { OrderStatus } from '../types/index.js';
import type { ShippingInfo } from '../models/Order.js';
import type { Book } from '../models/Book.js';

async function nextOrderNumber(): Promise<string> {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const dayPrefix = `${y}${m}${d}`;
  const count = await OrderModel.countDocuments();
  return `OBS-${dayPrefix}-${String(count + 1).padStart(4, '0')}`;
}

export async function createOrderFromCart(
  userId: string,
  shippingInfo: ShippingInfo
): Promise<Record<string, unknown>> {
  const cartItems = await CartItemModel.find({ user: userId })
    .populate<{ book: Book }>('book')
    .lean();

  if (cartItems.length === 0) {
    throw new ApiError(400, 'Your cart is empty.');
  }

  const booksToUpdate = new Map<string, Book>();
  const items: Array<Record<string, unknown>> = [];

  for (const item of cartItems) {
    const book = item.book;
    if (book.stock < item.quantity) {
      throw new ApiError(
        409,
        `"${book.title}" only has ${book.stock} in stock. Please adjust your cart.`
      );
    }
    booksToUpdate.set(book._id.toString(), book);
    items.push({
      book: book._id,
      title: book.title,
      author: book.author,
      price: book.price,
      quantity: item.quantity,
      coverImage: book.coverImage,
    });
  }

  const total = items.reduce((sum, item) => sum + (item.price as number) * (item.quantity as number), 0);
  const roundedTotal = Math.round(total * 100) / 100;

  const orderNumber = await nextOrderNumber();

  const order = await OrderModel.create({
    orderNumber,
    user: userId,
    items,
    total: roundedTotal,
    status: 'pending',
    shippingInfo,
  });

  for (const bookId of booksToUpdate.keys()) {
    const purchasedQty =
      cartItems.find((item) => item.book._id.toString() === bookId)?.quantity ?? 0;
    await BookModel.updateOne({ _id: bookId }, { $inc: { stock: -purchasedQty } });
  }

  return order.toObject() as unknown as Record<string, unknown>;
}

export async function listUserOrders(
  userId: string,
  page = 1,
  limit = 10
): Promise<{ orders: Array<Record<string, unknown>>; page: number; limit: number; total: number; totalPages: number }> {
  const total = await OrderModel.countDocuments({ user: userId });
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const orders = await OrderModel.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  return { orders, page, limit, total, totalPages };
}

export async function getUserOrder(userId: string, orderId: string): Promise<Record<string, unknown>> {
  const order = await OrderModel.findOne({ _id: orderId, user: userId }).lean();
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }
  return order;
}

export async function listAllOrders(query: {
  status?: OrderStatus;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ orders: Array<Record<string, unknown>>; page: number; limit: number; total: number; totalPages: number }> {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));

  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.search && query.search.trim()) {
    filter.orderNumber = { $regex: query.search.trim(), $options: 'i' };
  }

  const total = await OrderModel.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const orders = await OrderModel.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'name email')
    .lean();
  return { orders, page, limit, total, totalPages };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Record<string, unknown>> {
  const order = await OrderModel.findByIdAndUpdate(orderId, { status }, { new: true })
    .populate('user', 'name email')
    .lean();
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }
  return order;
}