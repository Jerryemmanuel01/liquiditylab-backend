import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user';
import { AppError } from '../utils/appError';

export class AuthService {
  /**
   * Helper to sign JWT token
   */
  public static signToken(userId: string): string {
    const secret = process.env.JWT_SECRET || 'super_secret_liquidity_lab_key_123_abc';
    return jwt.sign({ id: userId }, secret, {
      expiresIn: '30d',
    });
  }

  /**
   * Register a new user
   */
  public static async signup(userData: Partial<IUser>): Promise<{ user: IUser; token: string }> {
    const { username, email, password } = userData;

    // Check if user already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new AppError('Email address is already registered', 400);
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new AppError('Username is already taken', 400);
    }

    // Create user
    const newUser = await User.create({
      username,
      email,
      password,
    });

    // Remove password from returned object for safety
    newUser.password = undefined;

    const token = this.signToken(newUser._id.toString());

    return { user: newUser, token };
  }

  /**
   * Log in an existing user
   */
  public static async login(loginData: Record<string, string>): Promise<{ user: IUser; token: string }> {
    const { email, password } = loginData;

    // 1. Check if email and password exist
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // 2. Find user & select password explicitly
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // 3. Check password matching
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password', 401);
    }

    // Remove password from output object
    user.password = undefined;

    const token = this.signToken(user._id.toString());

    return { user, token };
  }
}
