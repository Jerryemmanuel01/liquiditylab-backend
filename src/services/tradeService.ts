import { Trade, ITrade } from '../models/trade';

export class TradeService {
  /**
   * Create a new trade log
   */
  public static async createTrade(tradeData: Partial<ITrade>): Promise<ITrade> {
    return await Trade.create(tradeData);
  }

  /**
   * Fetch all trades with filters, sorting, and pagination
   */
  public static async getAllTrades(
    filter: Record<string, any>,
    sortOption?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ trades: ITrade[]; total: number }> {
    let query = Trade.find(filter);

    if (sortOption) {
      const sortBy = sortOption.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-executionTime');
    }

    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    const trades = await query;
    const total = await Trade.countDocuments(filter);

    return { trades, total };
  }

  /**
   * Retrieve a trade by ID
   */
  public static async getTradeById(id: string): Promise<ITrade | null> {
    return await Trade.findById(id);
  }

  /**
   * Update an existing trade and trigger validation hooks
   */
  public static async updateTrade(id: string, updateData: Partial<ITrade>): Promise<ITrade | null> {
    const trade = await Trade.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (trade) {
      // Explicitly call save() to trigger the pre-save hooks (recalculates planned/realized RR)
      await trade.save();
    }

    return trade;
  }

  /**
   * Delete a trade
   */
  public static async deleteTrade(id: string): Promise<ITrade | null> {
    return await Trade.findByIdAndDelete(id);
  }

  /**
   * Aggregate statistics for edge setups and psychological mood variables
   */
  public static async getTradeStats(): Promise<any> {
    const stats = await Trade.aggregate([
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
