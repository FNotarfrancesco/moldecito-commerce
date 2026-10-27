import jwt from 'jsonwebtoken';
import { User, type IUserModel } from '../models/index.js';
import { env } from '../config/env.js';
import type { CreateUserInput, LoginInput } from '../schemas/validation.js';
import type { SignOptions } from 'jsonwebtoken';

const UserModel = User as IUserModel;

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function registerUser(input: CreateUserInput) {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw new Error('Email ya registrado');

  const passwordHash = await UserModel.hashPassword(input.password);
  const user = await User.create({
    email: input.email,
    passwordHash,
    name: input.name,
    role: input.role ?? 'editor',
  });

  return user;
}

export async function loginUser(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  if (!user || !user.active) throw new Error('Credenciales inválidas');

  const valid = await user.comparePassword(input.password);
  if (!valid) throw new Error('Credenciales inválidas');

  user.lastLoginAt = new Date();
  await user.save();

  return user;
}

export function generateToken(user: { _id: string; email: string; role: string }): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    env.JWT_SECRET,
    options
  );
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(res: any, token: string): void {
  res.cookie(env.JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export function clearAuthCookie(res: any): void {
  res.clearCookie(env.JWT_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}