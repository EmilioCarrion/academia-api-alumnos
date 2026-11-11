// Solución de la práctica S2: medir y arreglar el N+1 de listStudents.
// Ejecutar: npx tsx src/playground/list-students.ts   → 4 → 2 → 1 queries
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  log: [{ emit: 'event', level: 'query' }],
});

let queries = 0;
prisma.$on('query', () => { queries++; });

async function measure(label: string, fn: () => Promise<unknown>) {
  queries = 0;
  const result = await fn();
  console.log(`${label}: ${queries} queries`, JSON.stringify(result));
}

// ❌ La de la IA: 1 query + 1 por alumno
async function listStudents() {
  const students = await prisma.user.findMany({ where: { role: 'STUDENT' }, orderBy: { id: 'asc' } });
  const result = [];
  for (const s of students) {
    const enrollments = await prisma.enrollment.findMany({ where: { userId: s.id } });
    result.push({ name: s.name, enrollments: enrollments.length });
  }
  return result;
}

// ✓ include: 2 queries fijas, da igual cuántos alumnos haya
async function listStudentsInclude() {
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: { id: 'asc' }, // sin orden, cada versión puede devolverlos en un orden distinto
    include: { enrollments: true },
  });
  return students.map((s) => ({ name: s.name, enrollments: s.enrollments.length }));
}

// ✓ _count: 1 query, el número lo calcula la base de datos
async function listStudentsCount() {
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: { id: 'asc' }, // sin orden, cada versión puede devolverlos en un orden distinto
    select: { name: true, _count: { select: { enrollments: true } } },
  });
  return students.map((s) => ({ name: s.name, enrollments: s._count.enrollments }));
}

async function main() {
  await measure('IA (bucle)', listStudents);
  await measure('include', listStudentsInclude);
  await measure('_count', listStudentsCount);
}

main().finally(() => prisma.$disconnect());
