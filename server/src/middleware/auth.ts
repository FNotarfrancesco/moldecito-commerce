import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService.js';
import { User } from '../models/User.js';
import { type IUser } from '../models/index.js';
import { env } from '../config/env.js';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.[env.JWT_COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Token inválido o expirado' });
    return;
  }

  req.user = { id: payload.sub, email: payload.email, role: payload.role };
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Sin permisos suficientes' });
      return;
    }
    next();
  };
}

export async function attachUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.[env.JWT_COOKIE_NAME];
  if (!token) return next();

  const payload = verifyToken(token);
  if (!payload) return next();

  const user = await User.findById(payload.sub).select('email name role active').lean<IUser>();
  if (!user || !user.active) return next();

  req.user = { id: user._id.toString(), email: user.email, role: user.role };
  next();
}