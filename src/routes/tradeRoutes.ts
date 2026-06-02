import { Router } from 'express';
import {
  createTrade,
  getAllTrades,
  getTrade,
  updateTrade,
  deleteTrade,
  getTradeStats
} from '../controllers/tradeController';

const router = Router();

// Stats must be defined before ID routes to prevent it from matching as an ID parameter
router.route('/stats').get(getTradeStats);

router.route('/')
  .post(createTrade)
  .get(getAllTrades);

router.route('/:id')
  .get(getTrade)
  .patch(updateTrade)
  .delete(deleteTrade);

export default router;
