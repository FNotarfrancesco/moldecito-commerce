import { Schema, model, models, type Model } from 'mongoose';
import type { IUser } from './interfaces.js';
import bcrypt from 'bcryptjs';

export interface IUserModel extends Model<IUser> {
  hashPassword(password: string): Promise<string>;
}

const userSchema = new Schema<IUser, IUserModel>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['owner', 'editor'], default: 'editor' },
    active: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.methods.comparePassword = async function (this: IUser, password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const User = models.User ?? model<IUser, IUserModel>('User', userSchema);