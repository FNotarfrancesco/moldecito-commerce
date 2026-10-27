import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error('❌ Error:', err);

  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validación fallida', details: err.flatten().fieldErrors });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ error: 'Error de validación', details: err.errors });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }

  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    res.status(409).json({ error: 'Recurso duplicado', field: (err as any).keyValue });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, details: err.details });
    return;
  }

  res.status(500).json({ error: 'Error interno del servidor' });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: 'Ruta no encontrada' });
}