import { Router } from 'express';
import {
  createTrade,
  getAllTrades,
  getTrade,
  updateTrade,
  deleteTrade,
  closeTrade,
  getTradeStats,
} from '../controllers/tradeController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { CreateTradeValidation, CloseTradeValidation } from '../validations/tradeValidation';

const router = Router();

// Protect all trade endpoints with authentication middleware
router.use(protect);

// Stats must be defined before ID routes to prevent it from matching as an ID parameter
router.route('/stats').get(getTradeStats);

router.route('/')
  .post(validate(CreateTradeValidation), createTrade)
  .get(getAllTrades);

router.route('/:id/close')
  .patch(validate(CloseTradeValidation), closeTrade);

router.route('/:id')
  .get(getTrade)
  .patch(updateTrade)
  .delete(deleteTrade);

export default router;
