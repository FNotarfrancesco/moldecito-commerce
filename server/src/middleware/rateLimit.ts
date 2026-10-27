import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { error: 'Demasiadas peticiones, intenta más tarde' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 login attempts per 15 min
  message: { error: 'Demasiados intentos de login, intenta en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const orderDraftLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 order drafts per minute per IP
  message: { error: 'Demasiados pedidos, espera un momento' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Demasiadas búsquedas' },
  standardHeaders: true,
  legacyHeaders: false,
});