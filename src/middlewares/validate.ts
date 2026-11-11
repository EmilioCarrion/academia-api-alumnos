import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

// Valida y sustituye req.body. (En Express 5 req.query es de solo lectura:
// query y params se validan con schema.parse() dentro del controlador.)
export const validateBody = (schema: z.ZodType) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: 'Validation failed', details: z.flattenError(result.error) });
      return;
    }
    req.body = result.data;
    next();
  };
