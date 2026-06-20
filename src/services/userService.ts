import { User, IUser } from '../models/user';
import { AppError } from '../utils/appError';

export interface IUserSettingsPayload {
  username?: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string;
  baselineCapital?: number;
  inactivityDuration?: number;
  defaultTimezone?: string;
  baseCurrency?: string;
  theme?: string;
  mt5Connected?: boolean;
  cTraderConnected?: boolean;
  tradeLockerConnected?: boolean;
}

export class UserService {
  /**
   * Update User Settings
   */
  public static async updateSettings(
    userId: string,
    payload: IUserSettingsPayload
  ): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Merge payload into user
    Object.assign(user, payload);

    await user.save({ validateBeforeSave: false });

    return user;
  }

  /**
   * Get User Settings
   */
  public static async getSettings(userId: string): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}
