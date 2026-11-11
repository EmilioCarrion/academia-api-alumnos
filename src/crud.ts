// Sesión 1 · CRUD básico con Prisma Client.
// Ejecutar: npx tsx src/crud.ts
import { prisma } from './db.js';

async function main() {
  // Create
  const user = await prisma.user.create({
    data: {
      email: `ana+${Date.now()}@academia.dev`, // único en cada ejecución
      name: 'Ana',
      password: 'hashed-password-placeholder', // sesión 4: Argon2id
      role: 'INSTRUCTOR',
    },
  });
  console.log('create →', user);

  // Read: uno por clave única, muchos con filtro
  const found = await prisma.user.findUnique({ where: { email: user.email } });
  const instructors = await prisma.user.findMany({ where: { role: 'INSTRUCTOR' } });
  console.log('findUnique →', found?.name, '| instructores:', instructors.length);

  // Si no existe → null (no excepción)
  const maybeUser = await prisma.user.findUnique({ where: { id: 999_999 } });
  console.log('id inexistente →', maybeUser);

  // Update
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name: 'Ana García' },
  });
  console.log('update →', updated.name);

  // Count
  console.log('total usuarios →', await prisma.user.count());

  // Delete
  await prisma.user.delete({ where: { id: user.id } });
  console.log('delete → ok');
}

main().finally(() => prisma.$disconnect());
