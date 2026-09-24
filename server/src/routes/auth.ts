import { Router } from 'express';
import * as authController from '../controllers/auth.js';
import { protect } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.post(
  '/register',
  validateBody([
    { field: 'name', required: true, type: 'string', min: 2, max: 120 },
    { field: 'email', required: true, type: 'string', max: 200 },
    { field: 'password', required: true, type: 'string', min: 6, max: 100 },
  ]),
  authController.register
);

router.post(
  '/login',
  validateBody([
    { field: 'email', required: true, type: 'string', max: 200 },
    { field: 'password', required: true, type: 'string' },
  ]),
  authController.login
);

router.get('/me', protect, authController.me);
router.put(
  '/profile',
  protect,
  validateBody([{ field: 'name', required: true, type: 'string', min: 2, max: 120 }]),
  authController.updateProfile
);

export default router;