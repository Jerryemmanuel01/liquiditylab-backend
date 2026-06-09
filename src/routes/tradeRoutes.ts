import { Router } from 'express';
import {
  createTrade,
  getTrades,
  getTradeById,
  updateTrade,
  deleteTrade,
  getTradeStats,
  getCalendarStats
} from '../controllers/tradeController';
import { protect } from '../middleware/auth';

const router = Router();

// Protect all trade routes
router.use(protect);

router.route('/')
  .post(createTrade)
  .get(getTrades);

router.get('/stats', getTradeStats);
router.get('/calendar', getCalendarStats);

router.route('/:id')
  .get(getTradeById)
  .patch(updateTrade)
  .delete(deleteTrade);

export default router;
