import { Trade, ITrade } from '../models/trade';
import { Asset } from '../models/asset';
import { Types } from 'mongoose';

export class TradeService {
  /**
   * Create a new trade entry
   */
  async createTrade(userId: string, data: Partial<ITrade>): Promise<ITrade> {
    const trade = new Trade({
      ...data,
      user: new Types.ObjectId(userId)
    });
    
    await this.calculatePnL(trade);
    
    return await trade.save();
  }

  /**
   * Get all trades for a specific user, optionally filtered by strategy or date, with pagination
   */
  async getTrades(userId: string, filters: any = {}, page: number = 1, limit: number = 10): Promise<{ trades: ITrade[], totalPages: number, currentPage: number, totalCount: number }> {
    const query: any = { user: new Types.ObjectId(userId) };
    
    if (filters.strategyId) {
      query.strategy = new Types.ObjectId(filters.strategyId);
    }
    
    if (filters.startDate || filters.endDate) {
      query.executionTime = {};
      if (filters.startDate) query.executionTime.$gte = new Date(filters.startDate);
      if (filters.endDate) query.executionTime.$lte = new Date(filters.endDate);
    }

    const totalCount = await Trade.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    const trades = await Trade.find(query)
      .populate('strategy', 'name tags rules')
      .populate('asset', 'symbol assetClass multiplier')
      .sort({ executionTime: -1 })
      .skip(skip)
      .limit(limit);

    return {
      trades,
      totalPages,
      currentPage: page,
      totalCount
    };
  }

  /**
   * Get aggregated trade statistics (all-time)
   */
  async getTradeStats(userId: string): Promise<any> {
    const stats = await Trade.aggregate([
      { $match: { user: new Types.ObjectId(userId), status: 'CLOSED' } },
      { 
        $group: {
          _id: null,
          totalTrades: { $sum: 1 },
          winningTrades: { 
            $sum: { 
              $cond: [ { $gt: [ { $ifNull: [ "$actualPnl", "$pnl" ] }, 0 ] }, 1, 0 ] 
            } 
          },
          totalPnL: { 
            $sum: { $ifNull: [ "$actualPnl", "$pnl", 0 ] } 
          },
          totalRealizedRR: { $sum: { $ifNull: ["$realizedRR", 0] } },
          adheredTrades: { 
            $sum: { $cond: [ { $eq: ["$adheredToPlan", true] }, 1, 0 ] } 
          }
        }
      }
    ]);

    if (!stats || stats.length === 0) {
      return { winRate: 0, totalPnL: 0, totalRealizedRR: 0, adherenceRate: 0 };
    }

    const s = stats[0];
    const winRate = s.totalTrades > 0 ? Math.round((s.winningTrades / s.totalTrades) * 100) : 0;
    const adherenceRate = s.totalTrades > 0 ? Math.round((s.adheredTrades / s.totalTrades) * 100) : 0;

    return {
      winRate,
      totalPnL: s.totalPnL,
      totalRealizedRR: s.totalRealizedRR,
      adherenceRate
    };
  }

  /**
   * Get calendar daily stats for a specific month
   */
  async getCalendarStats(userId: string, year: number, month: number): Promise<any[]> {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const dailyStats = await Trade.aggregate([
      { 
        $match: { 
          user: new Types.ObjectId(userId),
          executionTime: { $gte: startDate, $lte: endDate }
        } 
      },
      {
        $group: {
          _id: { $dayOfMonth: "$executionTime" },
          pnl: { $sum: { $ifNull: [ "$actualPnl", "$pnl", 0 ] } },
          tradesCount: { $sum: 1 }
        }
      }
    ]);

    return dailyStats;
  }

  /**
   * Get a specific trade by ID
   */
  async getTradeById(userId: string, tradeId: string): Promise<ITrade | null> {
    if (!Types.ObjectId.isValid(tradeId)) return null;
    return await Trade.findOne({
      _id: new Types.ObjectId(tradeId),
      user: new Types.ObjectId(userId)
    })
      .populate('strategy', 'name tags rules')
      .populate('asset', 'symbol assetClass multiplier');
  }

  /**
   * Update a specific trade
   */
  async updateTrade(userId: string, tradeId: string, data: Partial<ITrade>): Promise<ITrade | null> {
    if (!Types.ObjectId.isValid(tradeId)) return null;
    const trade = await Trade.findOne({
      _id: new Types.ObjectId(tradeId),
      user: new Types.ObjectId(userId)
    });

    if (!trade) return null;

    Object.assign(trade, data);
    
    await this.calculatePnL(trade);
    
    return await trade.save();
  }

  /**
   * Helper method to calculate PnL based on the asset's multiplier
   */
  private async calculatePnL(trade: any) {
    // Auto-fill exit price based on exit reason if not provided
    if (trade.status === 'CLOSED' && !trade.exitPrice && trade.exitReason) {
      if (trade.exitReason === 'HIT_TP' && trade.takeProfit) {
        trade.exitPrice = trade.takeProfit;
      } else if (trade.exitReason === 'HIT_SL' && trade.stopLoss) {
        trade.exitPrice = trade.stopLoss;
      } else if (trade.exitReason === 'BREAKEVEN') {
        trade.exitPrice = trade.entryPrice;
      }
    }

    if (trade.status === 'CLOSED' && trade.exitPrice) {
      // Fetch the asset to get the multiplier
      const asset = await Asset.findById(trade.asset);
      if (asset) {
        const multiplier = asset.multiplier || 1;
        
        let pnl = 0;
        if (trade.direction === 'LONG') {
          pnl = (trade.exitPrice - trade.entryPrice) * multiplier * trade.lotSize;
        } else if (trade.direction === 'SHORT') {
          pnl = (trade.entryPrice - trade.exitPrice) * multiplier * trade.lotSize;
        }
        
        trade.pnl = pnl;
        
        // Calculate realized RR if stopLoss is defined
        if (trade.stopLoss && trade.entryPrice !== trade.stopLoss) {
          const riskPerUnit = Math.abs(trade.entryPrice - trade.stopLoss);
          const rewardPerUnit = Math.abs(trade.exitPrice - trade.entryPrice);
          trade.realizedRR = trade.direction === 'LONG' 
            ? (trade.exitPrice - trade.entryPrice) / riskPerUnit
            : (trade.entryPrice - trade.exitPrice) / riskPerUnit;
        }
      }
    }
  }

  /**
   * Delete a specific trade
   */
  async deleteTrade(userId: string, tradeId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(tradeId)) return false;
    const result = await Trade.deleteOne({
      _id: new Types.ObjectId(tradeId),
      user: new Types.ObjectId(userId)
    });

    return result.deletedCount === 1;
  }
}

export const tradeService = new TradeService();
