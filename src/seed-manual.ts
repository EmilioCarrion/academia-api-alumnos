// Seed de AcademIA. Idempotente: se puede ejecutar varias veces seguidas.
// Ejecutar: npx tsx src/seed-manual.ts
import { prisma } from './db.js';
import { hashPassword } from './services/password.js';

// Sesión 4: contraseñas hasheadas de verdad. Todos los usuarios de prueba
// usan la misma para poder hacer login en clase.
export const SEED_PASSWORD = 'Passw0rd!';
const passwordHash = await hashPassword(SEED_PASSWORD);

async function upsertUser(email: string, name: string, role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') {
  return prisma.user.upsert({
    where: { email },
    update: { password: passwordHash, role }, // re-ejecutar el seed actualiza los hashes antiguos
    create: { email, name, password: passwordHash, role },
  });
}

async function main() {
  const marta = await upsertUser('marta@academia.dev', 'Marta', 'INSTRUCTOR');
  await upsertUser('pablo@academia.dev', 'Pablo', 'INSTRUCTOR'); // segundo instructor: para probar ownership
  await upsertUser('admin@academia.dev', 'Admin', 'ADMIN');
  const students = await Promise.all([
    upsertUser('luis@academia.dev', 'Luis', 'STUDENT'),
    upsertUser('sara@academia.dev', 'Sara', 'STUDENT'),
    upsertUser('omar@academia.dev', 'Omar', 'STUDENT'),
  ]);

  const [backend, databases] = await Promise.all(
    ['Backend', 'Bases de datos'].map((name) =>
      prisma.category.upsert({ where: { name }, update: {}, create: { name } }),
    ),
  );

  // Course no tiene campo único aparte del id: reseteamos los cursos de Marta
  await prisma.enrollment.deleteMany({ where: { course: { instructorId: marta.id } } });
  await prisma.course.deleteMany({ where: { instructorId: marta.id } });

  const ts = await prisma.course.create({
    data: { title: 'TypeScript desde cero', price: 49.99, published: true, level: 'BEGINNER', instructorId: marta.id, categoryId: backend.id },
  });
  const prismaAdv = await prisma.course.create({
    data: { title: 'Prisma avanzado', price: 79.99, published: true, level: 'ADVANCED', instructorId: marta.id, categoryId: databases.id },
  });
  await prisma.course.create({
    data: { title: 'SQL para backend', price: 39.99, published: false, level: 'INTERMEDIATE', instructorId: marta.id, categoryId: databases.id },
  });

  // Inscripciones cubriendo los 3 estados (cada par usuario-curso es único)
  await prisma.enrollment.createMany({
    data: [
      { userId: students[0].id, courseId: ts.id, status: 'ACTIVE' },
      { userId: students[1].id, courseId: ts.id, status: 'COMPLETED', grade: 9 },
      { userId: students[2].id, courseId: prismaAdv.id, status: 'CANCELLED' },
    ],
  });

  console.log('Seed OK:', await prisma.course.count(), 'cursos,', await prisma.enrollment.count(), 'inscripciones');
}

main().finally(() => prisma.$disconnect());
