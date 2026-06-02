import { Router } from 'express';
import healthRoutes from './healthRoutes';
import tradeRoutes from './tradeRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/trades', tradeRoutes);

export default router;
