import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error.js';
import type { AuthPayload } from './require-auth.js';

// Siempre DESPUÉS de requireAuth: no se puede comprobar un rol sin saber quién eres.
export const requireRole = (...roles: AuthPayload['role'][]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError(); // 401: no sabemos quién eres
    if (!roles.includes(req.user.role)) throw new ForbiddenError('Insufficient permissions'); // 403: sabemos quién eres y no puedes
    next();
  };
