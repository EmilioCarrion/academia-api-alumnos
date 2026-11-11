// Demo S2: contar las queries que dispara cada versión.
// Ejecutar: npx tsx src/playground/n-plus-one.ts
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  log: [{ emit: 'event', level: 'query' }],
});

let queries = 0;
prisma.$on('query', () => { queries++; });

async function measure(label: string, fn: () => Promise<void>) {
  queries = 0;
  await fn();
  console.log(`${label}: ${queries} queries`);
}

async function main() {
  await measure('❌ N+1 (query por alumno)', async () => {
    const users = await prisma.user.findMany({ where: { role: 'STUDENT' } });
    for (const u of users) {
      await prisma.enrollment.findMany({ where: { userId: u.id } });
    }
  });

  // include = 2 queries fijas (usuarios + inscripciones WHERE userId IN (...)), no un JOIN
  await measure('✓ include', async () => {
    await prisma.user.findMany({ where: { role: 'STUDENT' }, include: { enrollments: true } });
  });

  await measure('✓ _count (solo el número)', async () => {
    await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { name: true, _count: { select: { enrollments: true } } },
    });
  });
}

main().finally(() => prisma.$disconnect());
