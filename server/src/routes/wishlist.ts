import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.js';
import { protect } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.get('/', wishlistController.getWishlist);
router.post(
  '/',
  validateBody([{ field: 'bookId', required: true, type: 'string' }]),
  wishlistController.addItem
);
router.delete('/:bookId', wishlistController.removeItem);

export default router;