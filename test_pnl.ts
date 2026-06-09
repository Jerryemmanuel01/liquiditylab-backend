import mongoose from 'mongoose';
import { Trade } from './src/models/trade';
import { Asset } from './src/models/asset';
import { tradeService } from './src/services/tradeService';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/liquiditylab');

  // Find a trade that was closed as a loss or create a mock
  const trade = new Trade({
    user: new mongoose.Types.ObjectId(),
    strategy: new mongoose.Types.ObjectId(),
    asset: new mongoose.Types.ObjectId(),
    direction: 'LONG',
    entryPrice: 100,
    stopLoss: 90,
    takeProfit: 120,
    lotSize: 1,
    riskPercentage: 1,
    status: 'OPEN',
    timeframe: '15m',
    tradingSession: 'LONDON',
    htfBias: 'BULLISH',
    disciplineScore: 5,
    adheredToPlan: true,
    executionTime: new Date()
  });

  await trade.save();
  console.log("Mock trade created:", trade._id);

  // Update it via service
  const updated = await tradeService.updateTrade(
    trade.user.toString(), 
    trade._id.toString(), 
    { status: 'CLOSED', exitReason: 'HIT_SL' } as any
  );

  console.log("Updated Trade PnL:", updated?.pnl);
  console.log("Updated Trade RR:", updated?.realizedRR);
  console.log("Exit Price:", updated?.exitPrice);

  await mongoose.disconnect();
}

run().catch(console.error);
