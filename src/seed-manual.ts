// Sesión 1 · Práctica guiada. Ejecutar: npx tsx src/seed-manual.ts
// Se puede ejecutar varias veces seguidas: upsert no duplica.
import { prisma } from './db.js';

async function main() {
  const instructor = await prisma.user.upsert({
    where: { email: 'marta@academia.dev' },
    update: {},
    create: {
      email: 'marta@academia.dev',
      name: 'Marta',
      password: 'hashed-password-placeholder',
      role: 'INSTRUCTOR',
    },
  });

  // Course no tiene ningún campo único aparte del id: limpiamos los de este instructor
  await prisma.course.deleteMany({ where: { instructorId: instructor.id } });
  await prisma.course.createMany({
    data: [
      { title: 'TypeScript desde cero', price: 49.99, published: true, level: 'BEGINNER', instructorId: instructor.id },
      { title: 'Prisma avanzado', price: 79.99, published: false, level: 'ADVANCED', instructorId: instructor.id },
    ],
  });

  for (const name of ['Backend', 'Bases de datos']) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }

  const published = await prisma.course.findMany({ where: { published: true } });
  console.log(published);
}

main().finally(() => prisma.$disconnect());
