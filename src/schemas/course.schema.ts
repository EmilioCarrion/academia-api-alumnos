import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(2000).optional(),
  price: z.number().positive(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  published: z.boolean().optional(),
  maxSeats: z.number().int().positive().optional(),
  categoryId: z.number().int().positive().optional(),
  // ⚠ Provisional: hasta la sesión 4 no sabemos quién hace la petición.
  // En la sesión 4 sale del body y se toma de req.user (y en la 5 vemos por qué).
  instructorId: z.number().int().positive(),
});

// Práctica: updateCourseSchema (todos opcionales y sin instructorId — pista: .omit() y .partial())

export const listCoursesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
  categoryId: z.coerce.number().int().positive().optional(),
});

export const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type ListCoursesQuery = z.infer<typeof listCoursesQuerySchema>;
