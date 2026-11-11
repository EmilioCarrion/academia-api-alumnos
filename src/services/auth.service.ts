import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { prisma } from '../db.js';
import { ConflictError, UnauthorizedError } from '../errors/app-error.js';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema.js';
import { hashPassword, verifyPassword } from './password.js';

const ACCESS_TOKEN_TTL = '15m';

// Hash de una contraseña que nadie tiene. Si el email no existe verificamos
// contra él igualmente, para que login tarde lo mismo exista o no el usuario
// (si no, el tiempo de respuesta delata qué emails están registrados).
const DUMMY_HASH = await hashPassword('dummy-password-for-timing');

export const authService = {
  register: async (input: RegisterInput) => {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    // ⚠ Esto SÍ revela si un email está registrado. Es un trade-off de UX:
    // se mitiga con rate limiting (sesión 5) o verificando el email por correo.
    if (existing) throw new ConflictError('Email already registered');

    return prisma.user.create({
      data: { email: input.email, name: input.name, password: await hashPassword(input.password), role: 'STUDENT' },
      select: { id: true, email: true, name: true, role: true, createdAt: true }, // nunca el hash
    });
  },

  login: async (input: LoginInput) => {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    const valid = await verifyPassword(input.password, user?.password ?? DUMMY_HASH);
    if (!user || !valid) throw new UnauthorizedError('Invalid credentials');

    const token = jwt.sign(
      { sub: String(user.id), role: user.role }, // sub es string por estándar (RFC 7519)
      config.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: ACCESS_TOKEN_TTL },
    );
    return { token };
  },
};
