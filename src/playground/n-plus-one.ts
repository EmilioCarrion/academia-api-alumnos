// Demo S2: contar las queries que dispara una función.
// Ejecutar: npx tsx src/playground/n-plus-one.ts
// Las versiones con include y _count son la práctica: están en s2-end.
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
}

main().finally(() => prisma.$disconnect());
