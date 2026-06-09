import { Asset, IAsset } from '../models/asset';
import { Types } from 'mongoose';

export class AssetService {
  /**
   * Create a new asset
   */
  static async createAsset(userId: string, data: Partial<IAsset>): Promise<IAsset> {
    
    // Automatically determine multiplier based on asset class
    let multiplier = 1;
    switch (data.assetClass) {
      case 'FOREX': multiplier = 100000; break;
      case 'METALS': multiplier = 100; break;
      case 'CRYPTO': multiplier = 1; break;
      case 'INDICES': multiplier = 1; break;
    }

    const asset = new Asset({
      ...data,
      multiplier,
      user: new Types.ObjectId(userId)
    });
    return await asset.save();
  }

  /**
   * Get all assets for a specific user
   */
  static async getAssets(userId: string): Promise<IAsset[]> {
    return await Asset.find({ user: new Types.ObjectId(userId) }).sort({ symbol: 1 });
  }

  /**
   * Update a specific asset
   */
  static async updateAsset(userId: string, assetId: string, data: Partial<IAsset>): Promise<IAsset | null> {
    const asset = await Asset.findOne({
      _id: new Types.ObjectId(assetId),
      user: new Types.ObjectId(userId)
    });

    if (!asset) return null;

    Object.assign(asset, data);
    return await asset.save();
  }

  /**
   * Delete a specific asset
   */
  static async deleteAsset(userId: string, assetId: string): Promise<boolean> {
    const result = await Asset.deleteOne({
      _id: new Types.ObjectId(assetId),
      user: new Types.ObjectId(userId)
    });

    return result.deletedCount === 1;
  }
}
