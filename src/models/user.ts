import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  baselineCapital: number;
  currentBalance: number;
  phoneNumber?: string;
  avatar?: string;
  inactivityDuration: number;
  maxDailyDrawdown: number;
  maxConsecutiveLosses: number;
  lockedUntil?: Date;
  defaultTimezone: string;
  baseCurrency: string;
  theme: string;
  mt5Connected: boolean;
  cTraderConnected: boolean;
  tradeLockerConnected: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Don't return password in query results by default
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    
    // Account Profile
    phoneNumber: { type: String, trim: true },
    avatar: { type: String },

    // Risk Parameters
    baselineCapital: { type: Number, default: 10000 },
    currentBalance: { type: Number, default: 10000 },
    inactivityDuration: { type: Number, default: 24 },
    maxDailyDrawdown: { type: Number, default: 1.0 },
    maxConsecutiveLosses: { type: Number, default: 3 },
    lockedUntil: { type: Date, default: null },

    // Workspace Preferences
    defaultTimezone: { type: String, default: 'WAT' },
    baseCurrency: { type: String, default: 'USD' },
    theme: { type: String, default: 'Light', enum: ['Light', 'Dark', 'Auto'] },

    // Integrations
    mt5Connected: { type: Boolean, default: false },
    cTraderConnected: { type: Boolean, default: false },
    tradeLockerConnected: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving it to the database
UserSchema.pre<IUser>('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password') || !this.password) return next();

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare input password with password in DB
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to create reset token
UserSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiration to 10 minutes from now
  this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

export const User = model<IUser>('User', UserSchema);
