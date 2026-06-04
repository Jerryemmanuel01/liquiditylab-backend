import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { asyncHandler } from '../utils/asyncHandler';

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { user, token } = await AuthService.signup(req.body);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

// @desc    User login
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { user, token } = await AuthService.login(req.body);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});
