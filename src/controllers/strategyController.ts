import { Request, Response, NextFunction } from 'express';
import { StrategyService } from '../services/strategyService';
import { asyncHandler } from '../utils/asyncHandler';

// @desc    Create a new strategy
// @route   POST /api/strategies
// @access  Private
export const createStrategy = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const strategy = await StrategyService.createStrategy(req.user!.id, req.body);

  res.status(201).json({
    status: 'success',
    data: {
      strategy
    }
  });
});

// @desc    Get all user strategies
// @route   GET /api/strategies
// @access  Private
export const getStrategies = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const strategies = await StrategyService.getStrategies(req.user!.id);

  res.status(200).json({
    status: 'success',
    results: strategies.length,
    data: {
      strategies
    }
  });
});

// @desc    Update a strategy
// @route   PATCH /api/strategies/:id
// @access  Private
export const updateStrategy = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const strategy = await StrategyService.updateStrategy(req.user!.id, req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: {
      strategy
    }
  });
});

// @desc    Delete a strategy
// @route   DELETE /api/strategies/:id
// @access  Private
export const deleteStrategy = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  await StrategyService.deleteStrategy(req.user!.id, req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
