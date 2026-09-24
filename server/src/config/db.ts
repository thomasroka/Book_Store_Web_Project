import mongoose from 'mongoose';
import { env } from './env.js';

if (!env.mongoUri) {
  throw new Error(
    'MONGODB_URI is not set. Copy server/.env.example to server/.env and set your MongoDB Atlas connection string.'
  );
}

export async function connectDB(): Promise<void> {
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  await mongoose.connect(env.mongoUri);
  console.log('MongoDB connected');
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
}