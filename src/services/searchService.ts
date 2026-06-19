import { Trade } from '../models/trade';
import { Journal } from '../models/journal';
import { Types } from 'mongoose';

export class SearchService {
  async performGlobalSearch(userId: string, query: string) {
    if (!query || query.trim() === '') {
      return { trades: [], journals: [] };
    }

    const regex = new RegExp(query, 'i');

    // 1. Search Trades
    // Match against asset symbol (via lookup or nested schema if populated? Wait, asset is a reference. We need to populate or search differently)
    // Actually, searching references in MongoDB directly with a regex requires $lookup.
    // For simplicity and speed, let's search fields directly on the Trade document: tags, notes, strategy (if name is copied or we just search tags), exitReason
    
    // To search Assets specifically, we can find Assets matching the symbol, then find Trades with those Asset IDs.
    // We will do a robust search using a simple parallel pipeline.

    const tradeQuery: any = {
      user: new Types.ObjectId(userId),
      $or: [
        { tags: { $regex: regex } },
        { notes: { $regex: regex } },
        { exitReason: { $regex: regex } },
        { smcElements: { $regex: regex } }
      ]
    };

    const trades = await Trade.find(tradeQuery)
      .populate('asset', 'symbol assetClass')
      .populate('strategy', 'name')
      .sort({ executionTime: -1 })
      .limit(5)
      .lean();

    // 2. Search Journals
    const journalQuery: any = {
      user: new Types.ObjectId(userId),
      $or: [
        { title: { $regex: regex } },
        { content: { $regex: regex } },
        { tags: { $regex: regex } }
      ]
    };

    const journals = await Journal.find(journalQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Formatted response
    return {
      trades: trades.map(t => ({
        _id: t._id,
        type: 'TRADE',
        title: `${(t.asset as any)?.symbol || 'Unknown'} ${t.direction}`,
        subtitle: `${new Date(t.executionTime).toLocaleDateString()} • PnL: ${t.actualPnl !== undefined ? t.actualPnl : t.pnl || 0}`,
        status: t.status,
        url: `/dashboard/history/${t._id}`
      })),
      journals: journals.map(j => ({
        _id: j._id,
        type: 'JOURNAL',
        title: j.title,
        subtitle: new Date(j.createdAt).toLocaleDateString(),
        url: `/dashboard/journal`
      }))
    };
  }
}

export const searchService = new SearchService();
