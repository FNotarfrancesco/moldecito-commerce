import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { routes } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { generalLimiter, searchLimiter } from './middleware/rateLimit.js';
import { attachUser } from './middleware/auth.js';

const app = express();

// Trust proxy (necesario para rate-limit y cookies seguras detrás de proxy)
app.set('trust proxy', 1);

// Middlewares globales
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(generalLimiter);
app.use(attachUser); // Adjunta user a req si hay cookie válida

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas públicas (con search limiter en búsquedas)
app.use('/api', searchLimiter, routes.public);

// Rutas auth
app.use('/api/auth', routes.auth);

// Rutas upload
app.use('/api/upload', routes.upload);

// Rutas admin (protegidas)
app.use('/api/admin', routes.admin);

// 404
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Startup
async function start() {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
      console.log(`📍 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down...');
  await import('./config/db.js').then(({ disconnectDB }) => disconnectDB());
  process.exit(0);
});

start();