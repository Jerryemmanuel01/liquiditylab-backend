import { Router } from 'express';
import { updateSettings, getSettings } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = Router();

// Protect all routes below this middleware
router.use(protect);

router.route('/settings')
  .get(getSettings)
  .patch(updateSettings);

export default router;
