import { Router } from 'express';
import healthRoutes from './healthRoutes';
import tradeRoutes from './tradeRoutes';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/trades', tradeRoutes);

export default router;
