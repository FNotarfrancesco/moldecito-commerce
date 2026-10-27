import { Router, Response } from 'express';
import { loginUser, generateToken, setAuthCookie, clearAuthCookie, verifyToken } from '../services/authService.js';
import { validateBody } from '../middleware/validation.js';
import { loginSchema } from '../schemas/validation.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// POST /api/auth/login
router.post('/login', authLimiter, validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await loginUser({ email, password });
  const token = generateToken({ _id: user._id, email: user.email, role: user.role });
  setAuthCookie(res, token);
  res.json({ user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});

// POST /api/auth/logout
router.post('/logout', (req: AuthRequest, res: Response) => {
  clearAuthCookie(res);
  res.json({ message: 'Sesión cerrada' });
});

// GET /api/auth/me
router.get('/me', async (req: AuthRequest, res) => {
  const token = req.cookies?.moldecito_auth;
  if (!token) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Token inválido' });
    return;
  }
  res.json({ user: { id: payload.sub, email: payload.email, role: payload.role } });
});

export default router;