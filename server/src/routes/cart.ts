import { Router } from 'express';
import * as cartController from '../controllers/cart.js';
import { protect } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.get('/', cartController.getCart);
router.post(
  '/',
  validateBody([
    { field: 'bookId', required: true, type: 'string' },
    { field: 'quantity', type: 'number', min: 1 },
  ]),
  cartController.addItem
);
router.put(
  '/:id',
  validateBody([{ field: 'quantity', required: true, type: 'number', min: 1 }]),
  cartController.updateQuantity
);
router.delete('/:id', cartController.removeItem);
router.delete('/', cartController.clearCart);

export default router;