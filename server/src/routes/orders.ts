import { Router } from 'express';
import * as orderController from '../controllers/order.js';
import { protect } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.post(
  '/',
  validateBody([
    { field: 'name', required: true, type: 'string', min: 2, max: 120 },
    { field: 'address', required: true, type: 'string', min: 5, max: 300 },
    { field: 'city', required: true, type: 'string', min: 2, max: 100 },
    { field: 'postalCode', required: true, type: 'string', min: 2, max: 20 },
    { field: 'phone', type: 'string', max: 30 },
  ]),
  orderController.checkout
);
router.get('/', orderController.myOrders);
router.get('/:id', orderController.orderDetail);

export default router;