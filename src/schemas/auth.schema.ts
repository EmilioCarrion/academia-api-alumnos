import { z } from 'zod';

const email = z.string().trim().toLowerCase().pipe(z.email()); // "Ana@X.com " y "ana@x.com" son el mismo usuario

export const registerSchema = z.object({
  email,
  password: z.string().min(8).max(128), // tope para no hashear megas de texto
  name: z.string().min(2).max(80),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
