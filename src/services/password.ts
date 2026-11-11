import argon2 from 'argon2';

// Argon2id es la recomendación actual de OWASP (bcrypt queda para sistemas legados).
// argon2.hash usa argon2id por defecto y genera la sal automáticamente.
export const hashPassword = (plain: string) => argon2.hash(plain, { type: argon2.argon2id });

export const verifyPassword = (plain: string, hash: string) => argon2.verify(hash, plain);
