import { Types } from 'mongoose';
import { Trade, ITrade } from '../models/trade';

export class TradeService {
  /**
   * Create a new trade log belonging to a user
   */
  public static async createTrade(tradeData: Partial<ITrade>, userId: string): Promise<ITrade> {
    tradeData.user = userId;
    return await Trade.create(tradeData);
  }

  /**
   * Fetch all trades for a user with filters, sorting, and pagination
   */
  public static async getAllTrades(
    filter: Record<string, any>,
    sortOption?: string,
    page: number = 1,
    limit: number = 20,
    userId: string = ''
  ): Promise<{ trades: ITrade[]; total: number }> {
    // Force isolation to the user
    const scopedFilter = { ...filter, user: userId };
    let query = Trade.find(scopedFilter);

    if (sortOption) {
      const sortBy = sortOption.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-executionTime');
    }

    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    const trades = await query;
    const total = await Trade.countDocuments(scopedFilter);

    return { trades, total };
  }

  /**
   * Retrieve a trade belonging to a user by ID
   */
  public static async getTradeById(id: string, userId: string): Promise<ITrade | null> {
    return await Trade.findOne({ _id: id, user: userId });
  }

  /**
   * Update a user's trade and trigger validation hooks
   */
  public static async updateTrade(id: string, updateData: Partial<ITrade>, userId: string): Promise<ITrade | null> {
    const trade = await Trade.findOne({ _id: id, user: userId });
    if (!trade) return null;

    // Apply the updates to the Mongoose document instance
    Object.assign(trade, updateData);
    
    // Safety check: ensure user cannot be changed
    trade.user = userId;

    // Explicitly call save() to trigger the pre-save hooks (recalculates planned/realized RR)
    await trade.save();
    return trade;
  }

  /**
   * Delete a user's trade
   */
  public static async deleteTrade(id: string, userId: string): Promise<ITrade | null> {
    return await Trade.findOneAndDelete({ _id: id, user: userId });
  }

  /**
   * Close a user's trade position and calculate outcomes
   */
  public static async closeTrade(
    id: string,
    closeData: {
      exitPrice: number;
      pnl?: number;
      exitReason: string;
      inTradeEmotion?: string;
      exitTime?: Date;
    },
    userId: string
  ): Promise<ITrade | null> {
    const trade = await Trade.findOne({ _id: id, user: userId });
    if (!trade) return null;

    trade.status = 'CLOSED';
    trade.exitPrice = closeData.exitPrice;
    trade.exitReason = closeData.exitReason;
    if (closeData.pnl !== undefined) trade.pnl = closeData.pnl;
    if (closeData.inTradeEmotion !== undefined) trade.inTradeEmotion = closeData.inTradeEmotion;
    trade.exitTime = closeData.exitTime || new Date();

    // Trigger save so pre-save middleware computes realized RR and defaults PnL
    await trade.save();
    return trade;
  }

  /**
   * Aggregate statistics for edge setups and psychological mood variables isolated to the user
   */
  public static async getTradeStats(userId: string): Promise<any> {
    const stats = await Trade.aggregate([
      // Match only this user's trades first for security and optimization
      {
        $match: { user: new Types.ObjectId(userId) },
      },
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                totalTrades: { $sum: 1 },
                totalPnL: { $sum: { $ifNull: ['$pnl', 0] } },
                avgDiscipline: { $avg: '$disciplineScore' },
                avgPlannedRR: { $avg: '$plannedRR' },
                avgRealizedRR: { $avg: '$realizedRR' },
                winningTrades: {
                  $sum: { $cond: [{ $gt: [{ $ifNull: ['$pnl', 0] }, 0] }, 1, 0] },
                },
              },
            },
          ],
          bySetup: [
            {
              $group: {
                _id: '$setupType',
                count: { $sum: 1 },
                totalPnL: { $sum: { $ifNull: ['$pnl', 0] } },
                avgDiscipline: { $avg: '$disciplineScore' },
                winningTrades: {
                  $sum: { $cond: [{ $gt: [{ $ifNull: ['$pnl', 0] }, 0] }, 1, 0] },
                },
              },
            },
            {
              $project: {
                setup: '$_id',
                count: 1,
                totalPnL: 1,
                avgDiscipline: 1,
                winRate: {
                  $cond: [{ $gt: ['$count', 0] }, { $multiply: [{ $divide: ['$winningTrades', '$count'] }, 100] }, 0],
                },
              },
            },
            { $sort: { totalPnL: -1 } },
          ],
          byMood: [
            {
              $group: {
                _id: '$preTradeMood',
                count: { $sum: 1 },
                totalPnL: { $sum: { $ifNull: ['$pnl', 0] } },
                avgDiscipline: { $avg: '$disciplineScore' },
                winningTrades: {
                  $sum: { $cond: [{ $gt: [{ $ifNull: ['$pnl', 0] }, 0] }, 1, 0] },
                },
              },
            },
            {
              $project: {
                mood: '$_id',
                count: 1,
                totalPnL: 1,
                avgDiscipline: 1,
                winRate: {
                  $cond: [{ $gt: ['$count', 0] }, { $multiply: [{ $divide: ['$winningTrades', '$count'] }, 100] }, 0],
                },
              },
            },
            { $sort: { totalPnL: -1 } },
          ],
        },
      },
    ]);

    const rawOverall = stats[0].overall[0] || {
      totalTrades: 0,
      totalPnL: 0,
      avgDiscipline: 0,
      avgPlannedRR: 0,
      avgRealizedRR: 0,
      winningTrades: 0,
    };

    const winRate = rawOverall.totalTrades > 0
      ? (rawOverall.winningTrades / rawOverall.totalTrades) * 100
      : 0;

    return {
      summary: {
        totalTrades: rawOverall.totalTrades,
        totalPnL: rawOverall.totalPnL,
        winRate: parseFloat(winRate.toFixed(2)),
        avgDiscipline: parseFloat((rawOverall.avgDiscipline || 0).toFixed(2)),
        avgPlannedRR: parseFloat((rawOverall.avgPlannedRR || 0).toFixed(2)),
        avgRealizedRR: parseFloat((rawOverall.avgRealizedRR || 0).toFixed(2)),
      },
      bySetup: stats[0].bySetup,
      byMood: stats[0].byMood,
    };
  }
}
