import { Router } from 'express';
import * as bookController from '../controllers/book.js';

const router = Router();

router.get('/featured', bookController.featured);
router.get('/new', bookController.newArrivals);
router.get('/:id', bookController.detail);
router.get('/', bookController.list);

export default router;