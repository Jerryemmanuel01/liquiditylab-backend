import express from 'express';
import { getDashboardAnalytics, getOverviewDashboard } from '../controllers/analyticsController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/dashboard').get(getDashboardAnalytics);
router.route('/overview').get(getOverviewDashboard);

export default router;
