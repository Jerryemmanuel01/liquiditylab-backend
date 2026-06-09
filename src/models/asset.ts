import mongoose, { Document, Schema } from 'mongoose';

export enum AssetClass {
  FOREX = 'FOREX',
  CRYPTO = 'CRYPTO',
  INDICES = 'INDICES',
  METALS = 'METALS'
}

export interface IAsset extends Document {
  user: mongoose.Types.ObjectId;
  symbol: string;
  assetClass: AssetClass;
  multiplier: number;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<IAsset>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symbol: {
    type: String,
    required: [true, 'Please add an asset symbol (e.g. BTCUSDT)'],
    trim: true,
    uppercase: true
  },
  assetClass: {
    type: String,
    enum: Object.values(AssetClass),
    required: [true, 'Please specify the asset class']
  },
  multiplier: {
    type: Number,
    required: [true, 'Please provide the multiplier for PnL calculation']
  }
}, {
  timestamps: true
});

// Ensure a user cannot create duplicate symbols
assetSchema.index({ user: 1, symbol: 1 }, { unique: true });

export const Asset = mongoose.model<IAsset>('Asset', assetSchema);
