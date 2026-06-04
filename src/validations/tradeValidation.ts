import { z } from 'zod';

// 1. Schema for creating a trade position (POST /api/trades)
export const CreateTradeValidation = z.object({
  body: z.object({
    asset: z.string({ message: 'Asset pair is required' }).trim().toUpperCase(),
    direction: z.enum(['LONG', 'SHORT'] as const, { message: 'Direction must be LONG or SHORT' }),
    entryPrice: z.number({ message: 'Entry price must be a number' }).positive(),
    stopLoss: z.number({ message: 'Stop loss must be a number' }).positive(),
    takeProfit: z.number({ message: 'Take profit must be a number' }).positive(),
    lotSize: z.number({ message: 'Lot size is required' }).positive(),
    riskPercentage: z.number().min(0.1).max(10).default(1),
    setupType: z.string({ message: 'Setup type is required' }).trim(),
    timeframe: z.string({ message: 'Timeframe is required' }),
    tradingSession: z.enum(['ASIA', 'LONDON', 'NEW_YORK', 'CRYPTO_24_7'] as const, {
      message: 'A valid trading session is required',
    }),
    smcElements: z.array(z.string()).default([]),
    htfBias: z.enum(['BULLISH', 'BEARISH', 'NEUTRAL'] as const),
    preTradeMood: z.string({ message: 'Please log your pre-trade mental state' }),
    disciplineScore: z.number().int().min(1).max(5),
    confidenceLevel: z.enum(['LOW', 'MEDIUM', 'HIGH'] as const),
    adheredToPlan: z.boolean(),
    notes: z.string().optional(),
    screenshots: z.array(z.string().url()).default([]),
    tags: z.array(z.string()).default([]),
    executionTime: z
      .string()
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : new Date())),
  }),
});

// 2. Schema for closing out a trade position (PATCH /api/trades/:id/close)
export const CloseTradeValidation = z.object({
  body: z.object({
    exitPrice: z.number({ message: 'Exit price is required to close a trade' }).positive(),
    pnl: z.number().optional(), // Can manually pass broker P&L or let middleware calculate it
    exitReason: z.enum(['HIT_SL', 'HIT_TP', 'MANUAL_FEAR', 'MANUAL_TECHNICAL', 'BREAKEVEN'] as const, {
      message: 'An exit reason must be declared for behavioral tracking',
    }),
    inTradeEmotion: z.string().optional(),
    exitTime: z
      .string()
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : new Date())),
  }),
});
