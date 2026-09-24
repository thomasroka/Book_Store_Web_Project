import { Router } from 'express';
import authRoutes from './auth.js';
import bookRoutes from './books.js';
import categoryRoutes from './categories.js';
import cartRoutes from './cart.js';
import wishlistRoutes from './wishlist.js';
import reviewRoutes from './reviews.js';
import orderRoutes from './orders.js';
import adminRoutes from './admin.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/reviews', reviewRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);

export default router;