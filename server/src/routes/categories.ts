import { Router } from 'express';
import * as categoryController from '../controllers/category.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.get('/', categoryController.list);
router.post(
  '/',
  protect,
  requireAdmin,
  validateBody([{ field: 'name', required: true, type: 'string', max: 80 }]),
  categoryController.create
);
router.put(
  '/:id',
  protect,
  requireAdmin,
  validateBody([{ field: 'name', required: true, type: 'string', max: 80 }]),
  categoryController.update
);
router.delete('/:id', protect, requireAdmin, categoryController.remove);

export default router;