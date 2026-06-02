import { Schema, model, Document } from 'mongoose';

export interface ITrade extends Document {
  asset: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  exitPrice?: number;
  positionSize?: number; // e.g., lot size or dollar value
  riskPercentage?: number; // e.g., 1% of account
  pnl?: number; // monetary profit/loss
  realizedRR?: number; // realized risk-to-reward
  plannedRR?: number; // planned risk-to-reward
  setupType: string; // e.g., 'Silver Bullet', 'MSS + FVG', 'Turtle Soup'
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | string;
  smcElements: string[]; // e.g., ['FVG', 'Liquidity Sweep', 'Order Block']
  htfBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  preTradeMood: string; // e.g., 'Calm', 'FOMO', 'Anxious', 'Impatient'
  inTradeEmotion?: string; // e.g., 'Greed', 'Fear', 'Detached'
  disciplineScore: number; // 1 to 5
  confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  adheredToPlan: boolean;
  exitReason?: 'HIT_SL' | 'HIT_TP' | 'MANUAL_FEAR' | 'MANUAL_TECHNICAL' | 'BREAKEVEN' | string;
  notes?: string;
  screenshots?: string[]; // array of URLs
  tags?: string[];
  executionTime: Date;
  exitTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TradeSchema = new Schema<ITrade>(
  {
    asset: {
      type: String,
      required: [true, 'Asset pair (e.g. EURUSD) is required'],
      trim: true,
      uppercase: true,
    },
    direction: {
      type: String,
      enum: ['LONG', 'SHORT'],
      required: [true, 'Trade direction (LONG or SHORT) is required'],
    },
    entryPrice: {
      type: Number,
      required: [true, 'Entry price is required'],
    },
    stopLoss: {
      type: Number,
      required: [true, 'Stop loss is required'],
    },
    takeProfit: {
      type: Number,
      required: [true, 'Take profit is required'],
    },
    exitPrice: {
      type: Number,
    },
    positionSize: {
      type: Number,
    },
    riskPercentage: {
      type: Number,
    },
    pnl: {
      type: Number,
    },
    realizedRR: {
      type: Number,
    },
    plannedRR: {
      type: Number,
    },
    setupType: {
      type: String,
      required: [true, 'Setup type is required'],
      trim: true,
    },
    timeframe: {
      type: String,
      required: [true, 'Timeframe is required'],
    },
    smcElements: {
      type: [String],
      default: [],
    },
    htfBias: {
      type: String,
      enum: ['BULLISH', 'BEARISH', 'NEUTRAL'],
      required: [true, 'HTF Bias is required'],
    },
    preTradeMood: {
      type: String,
      required: [true, 'Pre-trade mood is required'],
      trim: true,
    },
    inTradeEmotion: {
      type: String,
      trim: true,
    },
    disciplineScore: {
      type: Number,
      required: [true, 'Discipline score (1-5) is required'],
      min: 1,
      max: 5,
    },
    confidenceLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      required: [true, 'Confidence level is required'],
    },
    adheredToPlan: {
      type: Boolean,
      required: [true, 'Adherence to plan is required'],
    },
    exitReason: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    screenshots: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    executionTime: {
      type: Date,
      required: [true, 'Execution time is required'],
      default: Date.now,
    },
    exitTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate planned Risk-to-Reward before saving
TradeSchema.pre<ITrade>('save', function (next) {
  if (this.entryPrice && this.stopLoss && this.takeProfit) {
    const risk = Math.abs(this.entryPrice - this.stopLoss);
    const reward = Math.abs(this.takeProfit - this.entryPrice);
    if (risk > 0) {
      this.plannedRR = parseFloat((reward / risk).toFixed(2));
    }
  }

  // Calculate realized Risk-to-Reward if exited
  if (this.entryPrice && this.stopLoss && this.exitPrice) {
    const risk = Math.abs(this.entryPrice - this.stopLoss);
    const profit = this.direction === 'LONG' 
      ? this.exitPrice - this.entryPrice 
      : this.entryPrice - this.exitPrice;
    if (risk > 0) {
      this.realizedRR = parseFloat((profit / risk).toFixed(2));
    }
  }

  next();
});

export const Trade = model<ITrade>('Trade', TradeSchema);
