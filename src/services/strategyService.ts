import { Strategy, IStrategy } from '../models/strategy';
import { AppError } from '../utils/appError';

export class StrategyService {
  /**
   * Create a new Strategy
   */
  public static async createStrategy(
    userId: string,
    strategyData: Partial<IStrategy>
  ): Promise<IStrategy> {
    const strategy = await Strategy.create({
      ...strategyData,
      user: userId,
    });
    return strategy;
  }

  /**
   * Get all Strategies for a user
   */
  public static async getStrategies(userId: string): Promise<IStrategy[]> {
    const strategies = await Strategy.find({ user: userId }).sort({ createdAt: -1 });
    return strategies;
  }

  /**
   * Update a Strategy
   */
  public static async updateStrategy(
    userId: string,
    strategyId: string,
    updateData: Partial<IStrategy>
  ): Promise<IStrategy> {
    const strategy = await Strategy.findOneAndUpdate(
      { _id: strategyId, user: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!strategy) {
      throw new AppError('Strategy not found or unauthorized', 404);
    }

    return strategy;
  }

  /**
   * Delete a Strategy
   */
  public static async deleteStrategy(userId: string, strategyId: string): Promise<void> {
    const strategy = await Strategy.findOneAndDelete({ _id: strategyId, user: userId });

    if (!strategy) {
      throw new AppError('Strategy not found or unauthorized', 404);
    }
  }
}
