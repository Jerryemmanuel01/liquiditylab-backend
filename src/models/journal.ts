import { Schema, model, Document, Types } from 'mongoose';

export interface IJournal extends Document {
  user: Types.ObjectId | string;
  title: string;
  content: string;
  category: 'Lessons Learned' | 'Core Rules' | 'Market Observations' | 'Psychology';
  tags: string[];
  linkedTrades: (Types.ObjectId | string)[];
  createdAt: Date;
  updatedAt: Date;
}

const JournalSchema = new Schema<IJournal>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A journal entry must belong to a user'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    category: {
      type: String,
      enum: ['Lessons Learned', 'Core Rules', 'Market Observations', 'Psychology'],
      required: [true, 'Category is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    linkedTrades: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Trade',
      }
    ],
  },
  { timestamps: true }
);

export const Journal = model<IJournal>('Journal', JournalSchema);
