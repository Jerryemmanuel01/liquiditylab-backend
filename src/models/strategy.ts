import mongoose, { Document, Schema } from 'mongoose';

export interface IStrategy extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  tags: string[];
  rules: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const strategySchema = new Schema<IStrategy>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'A strategy must have a name'],
      trim: true,
      maxlength: [50, 'A strategy name must be less or equal to 50 characters'],
    },
    tags: {
      type: [String],
      default: [],
    },
    rules: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent users from creating multiple strategies with the exact same name
strategySchema.index({ user: 1, name: 1 }, { unique: true });

export const Strategy = mongoose.model<IStrategy>('Strategy', strategySchema);
