import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  let dbStatus = 'disconnected';
  if (dbState === 1) dbStatus = 'connected';
  else if (dbState === 2) dbStatus = 'connecting';
  else if (dbState === 3) dbStatus = 'disconnecting';

  res.status(200).json({
    status: 'success',
    message: 'Liquidity Lab Server is operational',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    uptime: `${Math.floor(process.uptime())}s`,
    database: dbStatus,
  });
});

export default router;
