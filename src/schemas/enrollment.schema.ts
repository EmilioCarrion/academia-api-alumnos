import { z } from 'zod';

// ⚠ Provisional hasta la sesión 4: el alumno se tomará de req.user
export const createEnrollmentSchema = z.object({ userId: z.number().int().positive() });
