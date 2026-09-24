import { Router } from 'express';
import * as adminController from '../controllers/admin.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validateBody } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(protect, requireAdmin);

router.get('/stats', adminController.dashboard);

router.post('/uploads', upload.single('file'), adminController.uploadImage);

router.get('/books', adminController.listBooks);
router.get('/books/:id', adminController.getBook);
router.post(
  '/books',
  validateBody([
    { field: 'title', required: true, type: 'string', min: 1, max: 200 },
    { field: 'author', required: true, type: 'string', min: 1, max: 120 },
    { field: 'category', required: true, type: 'string' },
    { field: 'price', required: true, type: 'number', min: 0 },
    { field: 'stock', type: 'number', min: 0 },
    { field: 'isbn', type: 'string', max: 40 },
    { field: 'description', type: 'string', max: 3000 },
    { field: 'coverImage', type: 'string', max: 500 },
  ]),
  adminController.createBook
);
router.put(
  '/books/:id',
  validateBody([
    { field: 'title', type: 'string', min: 1, max: 200 },
    { field: 'author', type: 'string', min: 1, max: 120 },
    { field: 'category', type: 'string' },
    { field: 'price', type: 'number', min: 0 },
    { field: 'stock', type: 'number', min: 0 },
    { field: 'isbn', type: 'string', max: 40 },
    { field: 'description', type: 'string', max: 3000 },
    { field: 'coverImage', type: 'string', max: 500 },
  ]),
  adminController.updateBook
);
router.patch(
  '/books/:id/stock',
  validateBody([{ field: 'stock', required: true, type: 'number', min: 0 }]),
  adminController.updateStock
);
router.delete('/books/:id', adminController.deleteBook);

router.get('/orders', adminController.orders);
router.patch(
  '/orders/:id/status',
  validateBody([{ field: 'status', required: true, type: 'string' }]),
  adminController.setOrderStatus
);

router.get('/customers', adminController.customers);

router.get('/reviews', adminController.reviews);
router.patch(
  '/reviews/:id',
  validateBody([{ field: 'status', required: true, type: 'string' }]),
  adminController.moderateReview
);
router.delete('/reviews/:id', adminController.badReviews);

export default router;