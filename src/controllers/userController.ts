import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { asyncHandler } from '../utils/asyncHandler';

// @desc    Update user baseline capital
// @route   PATCH /api/users/settings
// @access  Private
export const updateSettings = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { baselineCapital } = req.body;

  const newCapital = await UserService.updateBaselineCapital(req.user!.id, baselineCapital);

  res.status(200).json({
    status: 'success',
    data: {
      settings: {
        baselineCapital: newCapital
      }
    }
  });
});

// @desc    Get user baseline capital
// @route   GET /api/users/settings
// @access  Private
export const getSettings = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const capital = await UserService.getBaselineCapital(req.user!.id);

  res.status(200).json({
    status: 'success',
    data: {
      settings: {
        baselineCapital: capital
      }
    }
  });
});
