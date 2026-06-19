import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/searchService';
import { asyncHandler } from '../utils/asyncHandler';

export const globalSearch = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const query = req.query.q as string;

  if (!query) {
    return res.status(200).json({
      status: 'success',
      data: {
        trades: [],
        journals: []
      }
    });
  }

  const results = await searchService.performGlobalSearch(req.user!.id, query);

  res.status(200).json({
    status: 'success',
    data: results
  });
});
