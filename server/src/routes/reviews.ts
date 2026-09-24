import { Router } from 'express';
import * as reviewController from '../controllers/review.js';
import { protect } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.get('/book/:bookId', reviewController.byBook);
router.get('/mine', protect, reviewController.mine);
router.post(
  '/book/:bookId',
  protect,
  validateBody([
    { field: 'rating', required: true, type: 'number', min: 1, max: 5 },
    { field: 'comment', type: 'string', max: 1000 },
  ]),
  reviewController.create
);

export default router;