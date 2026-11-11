import 'dotenv/config';
import { z } from 'zod';

// Si falta una variable o es insegura, la app no arranca (mejor que un 500 a medianoche).
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export const config = envSchema.parse(process.env);
