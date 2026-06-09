import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { asyncHandler } from '../utils/asyncHandler';

// @desc    Update user settings
// @route   PATCH /api/users/settings
// @access  Private
export const updateSettings = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { baselineCapital, tradingPairs } = req.body;

  const settings = await UserService.updateSettings(req.user!.id, baselineCapital, tradingPairs);

  res.status(200).json({
    status: 'success',
    data: {
      settings
    }
  });
});

// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
export const getSettings = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const settings = await UserService.getSettings(req.user!.id);

  res.status(200).json({
    status: 'success',
    data: {
      settings
    }
  });
});
