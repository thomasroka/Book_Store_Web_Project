import { OrderModel } from '../models/Order.js';
import { BookModel } from '../models/Book.js';
import { UserModel } from '../models/User.js';
import { ReviewModel } from '../models/Review.js';

export interface DashboardStats {
  revenue: number;
  orders: number;
  books: number;
  customers: number;
  lowStock: number;
  pendingReviews: number;
  monthly: Array<{ month: string; revenue: number; orders: number }>;
  recentOrders: Array<Record<string, unknown>>;
  topBooks: Array<Record<string, unknown>>;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [revenueResult, orders, books, customers, lowStock, pendingReviews, topBooks] =
    await Promise.all([
      OrderModel.aggregate<{ total: number }>([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      OrderModel.countDocuments(),
      BookModel.countDocuments(),
      UserModel.countDocuments({ role: 'customer' }),
      BookModel.countDocuments({ stock: { $lte: 5 } }),
      ReviewModel.countDocuments({ status: 'pending' }),
      OrderModel.aggregate<{
        _id: string;
        title: string;
        coverImage: string;
        quantity: number;
        revenue: number;
      }>([
        { $match: { status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.book',
            title: { $first: '$items.title' },
            coverImage: { $first: '$items.coverImage' },
            quantity: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { quantity: -1 } },
        { $limit: 5 },
      ]),
    ]);

  const revenue = Math.round((revenueResult[0]?.total ?? 0) * 100) / 100;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthAgg = await OrderModel.aggregate<{
    _id: { year: number; month: number };
    revenue: number;
    orders: number;
  }>([
    { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthMap = new Map<string, { revenue: number; orders: number }>();
  for (const row of monthAgg) {
    const key = `${row._id.year}-${row._id.month}`;
    monthMap.set(key, {
      revenue: Math.round(row.revenue * 100) / 100,
      orders: row.orders,
    });
  }

  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    const data = monthMap.get(key) ?? { revenue: 0, orders: 0 };
    return {
      month: d.toLocaleString('en-US', { month: 'short' }),
      revenue: data.revenue,
      orders: data.orders,
    };
  });

  const recentOrders = await OrderModel.find()
    .sort({ createdAt: -1 })
    .limit(6)
    .populate('user', 'name email')
    .lean();

  return {
    revenue,
    orders,
    books,
    customers,
    lowStock,
    pendingReviews,
    monthly,
    recentOrders,
    topBooks,
  };
}