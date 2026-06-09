import { Router } from 'express';
import {
  createStrategy,
  getStrategies,
  updateStrategy,
  deleteStrategy
} from '../controllers/strategyController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(getStrategies)
  .post(createStrategy);

router
  .route('/:id')
  .patch(updateStrategy)
  .delete(deleteStrategy);

export default router;
