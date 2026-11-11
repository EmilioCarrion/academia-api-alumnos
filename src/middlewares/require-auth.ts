import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config.js';
import { UnauthorizedError } from '../errors/app-error.js';

// El payload se valida en runtime: un cast `as AuthPayload` no comprueba nada.
const authPayloadSchema = z.object({
  sub: z.string(),
  role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN']),
});

export type AuthPayload = z.infer<typeof authPayloadSchema>;

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new UnauthorizedError('Missing or malformed token');

  try {
    // algorithms fijado: no aceptamos tokens firmados con otro algoritmo
    const decoded = jwt.verify(header.slice('Bearer '.length), config.JWT_SECRET, { algorithms: ['HS256'] });
    req.user = authPayloadSchema.parse(decoded);
  } catch {
    throw new UnauthorizedError('Invalid or expired token'); // sin detalles: no ayudamos al atacante
  }
  next();
}

// El id del usuario autenticado como número (sub viaja como string en el JWT)
export const currentUserId = (req: Request) => Number(req.user!.sub);
