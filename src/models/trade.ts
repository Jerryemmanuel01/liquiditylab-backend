import { Schema, model, Document, Types } from 'mongoose';

export interface ITrade extends Document {
  user: Types.ObjectId | string;
  strategy: Types.ObjectId | string;
  asset: Types.ObjectId | string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  exitPrice?: number;
  lotSize: number; // Strictly contracts/lots for uniform calculation
  riskPercentage: number; // e.g., 1 for 1%
  pnl?: number; // Automated calculated monetary profit/loss
  actualPnl?: number; // Manual override for actual broker PnL
  realizedRR?: number; // Automated realized R-multiple
  plannedRR?: number; // Automated planned R-multiple
  status: 'OPEN' | 'CLOSED' | 'CANCELED';
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | string;
  tradingSession: 'ASIA' | 'LONDON' | 'NEW_YORK' | 'CRYPTO_24_7';
  smcElements: string[]; 
  htfBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  preTradeMood: 'Calm/Disciplined' | 'Anxious/FOMO' | 'Revenge Entry' | 'Boredom Trade' | string;
  inTradeEmotion?: string; 
  disciplineScore: number; // 1 to 5
  confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  adheredToPlan: boolean;
  exitReason?: 'HIT_SL' | 'HIT_TP' | 'MANUAL_FEAR' | 'MANUAL_TECHNICAL' | 'BREAKEVEN' | string;
  notes?: string;
  screenshots?: string[]; 
  tags?: string[];
  executionTime: Date;
  exitTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TradeSchema = new Schema<ITrade>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A trade must belong to a user'],
    },
    strategy: {
      type: Schema.Types.ObjectId,
      ref: 'Strategy',
      required: [true, 'A trade must be linked to a strategy'],
    },
    asset: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },
    direction: {
      type: String,
      enum: ['LONG', 'SHORT'],
      required: [true, 'Trade direction is required'],
    },
    entryPrice: { type: Number, required: true },
    stopLoss: { type: Number, required: true },
    takeProfit: { type: Number, required: true },
    exitPrice: { type: Number },
    lotSize: { 
      type: Number, 
      required: [true, 'Lot size/Volume is required for statistical uniformity'] 
    },
    riskPercentage: { 
      type: Number, 
      required: [true, 'Risk percentage is required for calculation validation'],
      default: 1 
    },
    pnl: {
      type: Number,
    },
    actualPnl: {
      type: Number,
    },
    realizedRR: { type: Number, default: 0 },
    plannedRR: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'CANCELED'],
      default: 'OPEN',
    },
    timeframe: { type: String, required: true },
    tradingSession: {
      type: String,
      enum: ['ASIA', 'LONDON', 'NEW_YORK', 'CRYPTO_24_7'],
      required: [true, 'Trading Session helps track your contextual edge'],
    },
    smcElements: { type: [String], default: [] },
    htfBias: { type: String, enum: ['BULLISH', 'BEARISH', 'NEUTRAL'], required: true },
    preTradeMood: { type: String, required: true, trim: true },
    inTradeEmotion: { type: String, trim: true },
    disciplineScore: { type: Number, required: true, min: 1, max: 5 },
    confidenceLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], required: true },
    adheredToPlan: { type: Boolean, required: true },
    exitReason: { type: String, trim: true },
    notes: { type: String, trim: true },
    screenshots: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    executionTime: { type: Date, required: true, default: Date.now },
    exitTime: { type: Date },
  },
  { timestamps: true }
);

// Unified mathematical middleware hook using correct descriptive typing context
TradeSchema.pre<ITrade>('save', function (this: ITrade, next) {
  // 1. Calculate planned Risk-to-Reward on initial entry creation
  if (this.isModified('entryPrice') || this.isModified('stopLoss') || this.isModified('takeProfit')) {
    const risk = Math.abs(this.entryPrice - this.stopLoss);
    const reward = Math.abs(this.takeProfit - this.entryPrice);
    if (risk > 0) {
      this.plannedRR = parseFloat((reward / risk).toFixed(2));
    }
  }

  // 2. Trigger calculations strictly when a trade status transitions to CLOSED
  if (this.isModified('status') && this.status === 'CLOSED' && this.exitPrice) {
    const riskAmountPoints = Math.abs(this.entryPrice - this.stopLoss);
    
    if (riskAmountPoints > 0) {
      const pointDifference = this.direction === 'LONG' 
        ? this.exitPrice - this.entryPrice 
        : this.entryPrice - this.exitPrice;
      
      // Calculate Realized R-Multiple
      this.realizedRR = parseFloat((pointDifference / riskAmountPoints).toFixed(2));
      
      // Approximate financial impact based on your fixed risk targets 
      // (Optional calculation helper: maps your realized R-Multiple straight to raw dollar metrics)
      if (this.pnl === 0 || !this.pnl) {
         // Assuming you risk a set dollar balance baseline, or calculate dynamically via execution controller
         // If you populate PnL directly from your broker history API later, this serves as a solid structural fallback
         const baselineRiskUsd = 100; // Place your model strategy baseline here
         this.pnl = parseFloat((this.realizedRR * baselineRiskUsd).toFixed(2));
      }
    }
  }

  next();
});

export const Trade = model<ITrade>('Trade', TradeSchema);