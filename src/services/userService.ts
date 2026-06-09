import { User, IUser } from '../models/user';
import { AppError } from '../utils/appError';

export class UserService {
  /**
   * Update User Baseline Capital
   */
  public static async updateBaselineCapital(
    userId: string,
    baselineCapital: number
  ): Promise<number> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.baselineCapital = baselineCapital;

    await user.save({ validateBeforeSave: false });

    return user.baselineCapital;
  }

  /**
   * Get User Baseline Capital
   */
  public static async getBaselineCapital(userId: string): Promise<number> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user.baselineCapital || 10000;
  }
}
