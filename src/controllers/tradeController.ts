import { Request, Response, NextFunction } from 'express';
import { TradeService } from '../services/tradeService';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';

// @desc    Create a new trade experiment
// @route   POST /api/trades
// @access  Public
export const createTrade = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const newTrade = await TradeService.createTrade(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      trade: newTrade,
    },
  });
});

// @desc    Get all trades with filtering, sorting, and pagination
// @route   GET /api/trades
// @access  Public
export const getAllTrades = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Simple filtering
  const queryObj = { ...req.query };
  const excludeFields = ['page', 'sort', 'limit', 'fields'];
  excludeFields.forEach((el) => delete queryObj[el]);

  const sort = req.query.sort as string | undefined;
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 20;

  const { trades, total } = await TradeService.getAllTrades(queryObj, sort, page, limit);

  res.status(200).json({
    status: 'success',
    results: trades.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: {
      trades,
    },
  });
});

// @desc    Get trade by ID
// @route   GET /api/trades/:id
// @access  Public
export const getTrade = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const trade = await TradeService.getTradeById(req.params.id);

  if (!trade) {
    return next(new AppError('No trade found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      trade,
    },
  });
});

// @desc    Update a trade
// @route   PATCH /api/trades/:id
// @access  Public
export const updateTrade = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const trade = await TradeService.updateTrade(req.params.id, req.body);

  if (!trade) {
    return next(new AppError('No trade found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      trade,
    },
  });
});

// @desc    Delete a trade
// @route   DELETE /api/trades/:id
// @access  Public
export const deleteTrade = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const trade = await TradeService.deleteTrade(req.params.id);

  if (!trade) {
    return next(new AppError('No trade found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// @desc    Get trade analytics (Edge vs Psychology stats)
// @route   GET /api/trades/stats
// @access  Public
export const getTradeStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const stats = await TradeService.getTradeStats();

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});
