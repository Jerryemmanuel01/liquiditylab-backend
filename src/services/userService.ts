import { User, IUser, IUserSettings } from '../models/user';
import { AppError } from '../utils/appError';

export class UserService {
  /**
   * Update User Settings
   */
  public static async updateSettings(
    userId: string,
    baselineCapital?: number,
    tradingPairs?: string[]
  ): Promise<IUserSettings> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Ensure settings object exists if old user
    if (!user.settings) {
      user.settings = { baselineCapital: 10000, tradingPairs: ['EUR/USD', 'GBP/USD', 'XAU/USD', 'BTC/USDT'] };
    }

    if (baselineCapital !== undefined) {
      user.settings.baselineCapital = baselineCapital;
    }

    if (tradingPairs !== undefined && Array.isArray(tradingPairs)) {
      user.settings.tradingPairs = tradingPairs;
    }

    await user.save({ validateBeforeSave: false });

    return user.settings;
  }

  /**
   * Get User Settings
   */
  public static async getSettings(userId: string): Promise<IUserSettings> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Gracefully handle old users without settings
    return user.settings || { baselineCapital: 10000, tradingPairs: ['EUR/USD', 'GBP/USD', 'XAU/USD', 'BTC/USDT'] };
  }
}
