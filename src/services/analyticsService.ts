import { Trade } from '../models/trade';
import { Types } from 'mongoose';

export class AnalyticsService {
  static async getDashboardAnalytics(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    // Common query to only fetch closed trades for the user
    const matchClosed = {
      $match: {
        user: userObjectId,
        status: 'CLOSED'
      }
    };

    // Calculate effective PnL for each trade ($ifNull checks if actualPnl exists)
    const addEffectiveFields = {
      $addFields: {
        effectivePnl: { $ifNull: ['$actualPnl', '$pnl', 0] },
        // A trade is a win if effectivePnl > 0
        isWin: { $cond: [{ $gt: [{ $ifNull: ['$actualPnl', '$pnl', 0] }, 0] }, 1, 0] },
        isLoss: { $cond: [{ $lt: [{ $ifNull: ['$actualPnl', '$pnl', 0] }, 0] }, 1, 0] }
      }
    };

    // --- 1. Core Metrics & Time-Efficiency (Scatter Plot) ---
    // We can fetch the raw array of trades to compute Max Drawdown and Scatter Plot, 
    // because Max Drawdown requires chronological ordering which is tricky in pure $group.
    const allClosedTrades = await Trade.find({ user: userObjectId, status: 'CLOSED' })
      .sort({ executionTime: 1 })
      .select('executionTime exitTime actualPnl pnl realizedRR')
      .lean();

    let peakEquity = 0;
    let currentEquity = 0;
    let maxDrawdownValue = 0;
    let maxDrawdownPct = 0; // Relative to peak equity (we'll assume a starting balance or just calculate absolute drop)
    let sumRealizedRR = 0;
    let sumGrossProfit = 0;
    let sumGrossLoss = 0;
    let winCount = 0;
    let lossCount = 0;
    let sumWinningPnl = 0;
    let sumLosingPnl = 0;
    
    const scatterData: any[] = [];

    allClosedTrades.forEach(trade => {
      const pnl = trade.actualPnl !== undefined ? trade.actualPnl : (trade.pnl || 0);
      const rr = trade.realizedRR || 0;
      
      // For Scatter Plot
      if (trade.executionTime && trade.exitTime) {
        const durationMinutes = (new Date(trade.exitTime).getTime() - new Date(trade.executionTime).getTime()) / (1000 * 60);
        scatterData.push({ duration: Math.max(1, Math.round(durationMinutes)), profit: pnl });
      }

      // For Core Metrics
      sumRealizedRR += rr;
      currentEquity += pnl;

      if (currentEquity > peakEquity) {
        peakEquity = currentEquity;
      }

      const drawdown = peakEquity - currentEquity;
      if (drawdown > maxDrawdownValue) {
        maxDrawdownValue = drawdown;
      }

      if (pnl > 0) {
        sumGrossProfit += pnl;
        sumWinningPnl += pnl;
        winCount++;
      } else if (pnl < 0) {
        sumGrossLoss += Math.abs(pnl);
        sumLosingPnl += Math.abs(pnl);
        lossCount++;
      }
    });

    const totalTrades = allClosedTrades.length;
    const systemExpectancy = totalTrades > 0 ? sumRealizedRR / totalTrades : 0;
    const profitFactor = sumGrossLoss > 0 ? sumGrossProfit / sumGrossLoss : (sumGrossProfit > 0 ? 999 : 0);
    
    const avgWin = winCount > 0 ? sumWinningPnl / winCount : 0;
    const avgLoss = lossCount > 0 ? sumLosingPnl / lossCount : 0;
    const wlAsymmetry = avgLoss > 0 ? avgWin / avgLoss : (avgWin > 0 ? 999 : 0);

    // We'll return maxDrawdownValue as the primary drawdown metric. 
    // To get a true %, we'd need a starting balance. For now, we return the raw value or calculate relative to peak.
    const maxDrawdownPctCalc = peakEquity > 0 ? (maxDrawdownValue / peakEquity) * 100 : 0;

    // --- 2. Qualitative & Psychological Diagnostics ---
    const moodAgg = await Trade.aggregate([
      matchClosed,
      addEffectiveFields,
      {
        $group: {
          _id: '$preTradeMood',
          avgRR: { $avg: '$realizedRR' },
          count: { $sum: 1 }
        }
      }
    ]);

    const disciplineAgg = await Trade.aggregate([
      matchClosed,
      addEffectiveFields,
      {
        $group: {
          _id: '$adheredToPlan',
          capitalLeaked: {
            $sum: { $cond: [{ $eq: ['$adheredToPlan', false] }, '$effectivePnl', 0] }
          },
          rLeaked: {
            $sum: { $cond: [{ $eq: ['$adheredToPlan', false] }, '$realizedRR', 0] }
          }
        }
      }
    ]);

    // Find the leaked capital from the discipline Agg
    const notAdhered = disciplineAgg.find(d => d._id === false) || { capitalLeaked: 0, rLeaked: 0 };
    // Usually leaked means it's negative, we want the absolute magnitude of the loss
    const capitalLeaked = notAdhered.capitalLeaked < 0 ? Math.abs(notAdhered.capitalLeaked) : 0;
    const rLeaked = notAdhered.rLeaked < 0 ? Math.abs(notAdhered.rLeaked) : 0;

    // --- 3. Structural Edge Matrix ---
    // Unwind SMC elements to get Win-Rate per setup
    const smcAgg = await Trade.aggregate([
      matchClosed,
      addEffectiveFields,
      { $unwind: '$smcElements' },
      {
        $group: {
          _id: '$smcElements',
          totalTrades: { $sum: 1 },
          wins: { $sum: '$isWin' }
        }
      },
      {
        $project: {
          setup: '$_id',
          winRate: { $multiply: [{ $divide: ['$wins', '$totalTrades'] }, 100] },
          _id: 0
        }
      },
      { $sort: { totalTrades: -1 } }
    ]);

    // Session Confluence Synergy
    const sessionAgg = await Trade.aggregate([
      matchClosed,
      addEffectiveFields,
      {
        $group: {
          _id: '$tradingSession',
          totalTrades: { $sum: 1 },
          wins: { $sum: '$isWin' },
          avgRR: { $avg: '$realizedRR' }
        }
      },
      {
        $project: {
          session: '$_id',
          winRate: { $multiply: [{ $divide: ['$wins', '$totalTrades'] }, 100] },
          avgRR: 1,
          _id: 0
        }
      }
    ]);

    return {
      coreMetrics: {
        systemExpectancy,
        profitFactor,
        wlAsymmetry,
        maxDrawdown: maxDrawdownValue,
        maxDrawdownPct: maxDrawdownPctCalc
      },
      scatterData,
      moodData: moodAgg.map(m => ({
        mood: m._id || 'Unknown',
        avgRR: m.avgRR || 0
      })),
      disciplineDiscount: {
        capitalLeaked,
        rLeaked
      },
      smcData: smcAgg,
      sessionData: sessionAgg
    };
  }
}
