import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, IUser } from '../models/user';
import { AppError } from '../utils/appError';
import { sendEmail } from '../utils/email';

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

  /**
   * Generate password reset token and send email
   */
  public static async forgotPassword(email: string): Promise<string> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('There is no user with that email address', 404);
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Assuming the frontend URL runs on port 3000 locally
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `Forgot your password? Click here to reset it:\n${resetUrl}\nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
      });

      return 'Token sent to email!';
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Email error:', err);
      throw new AppError('There was an error sending the email. Try again later!', 500);
    }
  }

  /**
   * Reset password using token
   */
  public static async resetPassword(token: string, newPassword: string): Promise<{ user: IUser; token: string }> {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    // Save new password (will trigger pre-save hook for hashing)
    await user.save();

    user.password = undefined;

    // 3) Log the user in, send JWT
    const jwtToken = this.signToken(user._id.toString());
    
    return { user, token: jwtToken };
  }
}
