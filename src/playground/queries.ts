// Sesión 2 · Queries con relaciones y paginación.
// Ejecutar: npx tsx src/playground/queries.ts
import { prisma } from '../db.js';

async function main() {
  // 5.1 include: relaciones completas
  const withEnrollments = await prisma.course.findFirst({
    include: { enrollments: { include: { user: true } } },
  });
  console.log('include →', withEnrollments?.title, withEnrollments?.enrollments.map((e) => e.user.name));

  // 5.2 select: solo lo necesario
  const titles = await prisma.course.findMany({
    select: { title: true, instructor: { select: { name: true } } },
  });
  console.log('select →', titles);

  // 5.3 filtrar por campos de una relación
  const inBackend = await prisma.course.findMany({ where: { category: { name: 'Backend' } } });
  console.log('filtro por relación →', inBackend.map((c) => c.title));

  // 5.4 nested write con connect (el curso y el alumno ya existen)
  const omar = await prisma.user.findUniqueOrThrow({ where: { email: 'omar@academia.dev' } });
  const sql = await prisma.course.findFirstOrThrow({ where: { title: 'SQL para backend' } });
  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: omar.id, courseId: sql.id } },
    update: {},
    create: { user: { connect: { id: omar.id } }, course: { connect: { id: sql.id } } },
  });
  console.log('connect →', enrollment);

  // 5.5 _count: contar sin traer
  const counts = await prisma.course.findMany({
    select: { title: true, _count: { select: { enrollments: true } } },
  });
  console.log('_count →', counts);

  // 6.1 offset: orden con desempate por id (determinista aunque haya empates)
  const page = 1, pageSize = 2;
  const offsetPage = await prisma.course.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
  console.log('offset p1 →', offsetPage.map((c) => c.id));

  // 6.2 cursor: primera página sin cursor, siguientes desde el último id visto
  const first = await prisma.course.findMany({ take: 2, orderBy: { id: 'asc' } });
  const next = await prisma.course.findMany({
    take: 2,
    skip: 1, // saltar el propio cursor
    cursor: { id: first.at(-1)!.id },
    orderBy: { id: 'asc' },
  });
  console.log('cursor →', first.map((c) => c.id), '→', next.map((c) => c.id));
}

main().finally(() => prisma.$disconnect());
