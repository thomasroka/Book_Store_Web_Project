export type Role = 'customer' | 'admin';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  description: string;
  price: number;
  coverImage: string;
  stock: number;
  category: Category | string;
  ratingAvg: number;
  ratingCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Review {
  _id: string;
  user: { _id: string; name: string } | string;
  book: { _id: string; title: string; author: string; coverImage: string } | string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface CartItem {
  _id: string;
  user: string;
  book: Book;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface WishlistItem {
  _id: string;
  user: string;
  book: Book;
}

export interface OrderItem {
  book: string;
  title: string;
  author: string;
  price: number;
  quantity: number;
  coverImage: string;
}

export interface ShippingInfo {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: { _id: string; name: string; email: string } | string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingInfo: ShippingInfo;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  orders: number;
  spent: number;
}

export interface DashboardStats {
  revenue: number;
  orders: number;
  books: number;
  customers: number;
  lowStock: number;
  pendingReviews: number;
  monthly: Array<{ month: string; revenue: number; orders: number }>;
  recentOrders: Order[];
  topBooks: Array<{
    _id: string;
    title: string;
    coverImage: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export interface BookQuery {
  search?: string;
  category?: string;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'rating';
  page?: number;
  limit?: number;
}

export interface BookListResult {
  books: Book[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BookDetailResult {
  book: Book;
  reviews: Review[];
}