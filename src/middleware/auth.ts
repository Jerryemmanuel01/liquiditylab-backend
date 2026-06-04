import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';

// Extend Express Request type to include user object globally
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1. Retrieve bearer token from authorization headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Authentication failed: No token provided. Please log in.', 401));
  }

  // 2. Validate JWT signature and token expiration
  const secret = process.env.JWT_SECRET || 'super_secret_liquidity_lab_key_123_abc';
  
  let decoded: DecodedToken;
  try {
    decoded = jwt.verify(token, secret) as DecodedToken;
  } catch (error) {
    return next(new AppError('Authentication failed: Invalid or expired token. Please log in again.', 401));
  }

  // 3. Verify user still exists in database
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('Authentication failed: The user belonging to this token no longer exists.', 401));
  }

  // 4. Attach user instance to request object
  req.user = currentUser;
  next();
});
