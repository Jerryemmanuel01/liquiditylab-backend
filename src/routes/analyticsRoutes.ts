import express from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/dashboard').get(getDashboardAnalytics);

export default router;
