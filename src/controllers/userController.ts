import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { asyncHandler } from '../utils/asyncHandler';

// @desc    Update user baseline capital
// @route   PATCH /api/users/settings
// @access  Private
export const updateSettings = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body;

  const user = await UserService.updateSettings(req.user!.id, payload);

  res.status(200).json({
    status: 'success',
    data: {
      settings: user
    }
  });
});

// @desc    Get user baseline capital
// @route   GET /api/users/settings
// @access  Private
export const getSettings = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await UserService.getSettings(req.user!.id);

  res.status(200).json({
    status: 'success',
    data: {
      settings: user
    }
  });
});
