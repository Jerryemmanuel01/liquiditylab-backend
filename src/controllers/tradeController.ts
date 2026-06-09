import { Request, Response, NextFunction } from 'express';
import { tradeService } from '../services/tradeService';
import { asyncHandler } from '../utils/asyncHandler';

export const createTrade = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const trade = await tradeService.createTrade(req.user!.id, req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      trade
    }
  });
});

export const getTrades = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const filters = {
    strategyId: req.query.strategyId as string,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string
  };
  
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const result = await tradeService.getTrades(req.user!.id, filters, page, limit);
  
  res.status(200).json({
    status: 'success',
    data: result.trades,
    pagination: {
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      totalCount: result.totalCount
    }
  });
});

export const getTradeStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const stats = await tradeService.getTradeStats(req.user!.id);
  res.status(200).json({
    status: 'success',
    data: stats
  });
});

export const getCalendarStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const year = parseInt(req.query.year as string);
  const month = parseInt(req.query.month as string);

  if (isNaN(year) || isNaN(month)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Year and month are required query parameters'
    });
  }

  const calendarStats = await tradeService.getCalendarStats(req.user!.id, year, month);
  
  res.status(200).json({
    status: 'success',
    data: calendarStats
  });
});

export const getTradeById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const trade = await tradeService.getTradeById(req.user!.id, req.params.id);
  
  if (!trade) {
    return res.status(404).json({
      status: 'fail',
      message: 'Trade not found'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      trade
    }
  });
});

export const updateTrade = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const trade = await tradeService.updateTrade(req.user!.id, req.params.id, req.body);
  
  if (!trade) {
    return res.status(404).json({
      status: 'fail',
      message: 'Trade not found'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      trade
    }
  });
});

export const deleteTrade = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const success = await tradeService.deleteTrade(req.user!.id, req.params.id);
  
  if (!success) {
    return res.status(404).json({
      status: 'fail',
      message: 'Trade not found'
    });
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});
