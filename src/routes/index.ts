import { Router } from 'express';
import healthRoutes from './healthRoutes';
import tradeRoutes from './tradeRoutes';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import strategyRoutes from './strategyRoutes';
import assetRoutes from './assetRoutes';
import analyticsRoutes from './analyticsRoutes';
import journalRoutes from './journalRoutes';
import searchRoutes from './searchRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/strategies', strategyRoutes);
router.use('/trades', tradeRoutes);
router.use('/assets', assetRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/journals', journalRoutes);
router.use('/search', searchRoutes);

export default router;