import mongoose, { Schema, model, models } from 'mongoose';
import type { OrderStatus } from '../types/index.js';
import type { User } from './User.js';

export interface OrderItemDoc {
  book: mongoose.Types.ObjectId;
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

export interface OrderDoc {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  user: mongoose.Types.ObjectId | User;
  items: OrderItemDoc[];
  total: number;
  status: OrderStatus;
  shippingInfo: ShippingInfo;
  createdAt: Date;
  updatedAt: Date;
}

export type Order = OrderDoc;

const orderItemSchema = new Schema<OrderItemDoc>(
  {
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    coverImage: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new Schema<Order>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingInfo: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      phone: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });

export const OrderModel =
  (models.Order as mongoose.Model<Order>) ?? model<Order>('Order', orderSchema);