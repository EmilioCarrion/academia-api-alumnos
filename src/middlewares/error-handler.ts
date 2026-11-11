import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { Prisma } from '../../generated/prisma/client.js';
import { AppError } from '../errors/app-error.js';

// Middleware de error: Express lo reconoce por tener 4 parámetros.
// Siempre el último app.use().
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: z.flattenError(err) });
  }

  // JSON mal formado en el body (lo lanza express.json())
  if ((err as { type?: string }).type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON' });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': return res.status(409).json({ error: 'Resource already exists' });
      case 'P2025': return res.status(404).json({ error: 'Resource not found' });
      // FK: borrar algo que otros registros referencian, o crear con un id relacionado que no existe
      case 'P2003': return res.status(409).json({ error: 'Foreign key constraint failed (related resource missing or still referenced)' });
    }
  }

  console.error(err); // en producción: un logger de verdad
  return res.status(500).json({ error: 'Internal server error' });
}
