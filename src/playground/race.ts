// Demo S2: dos alumnos se inscriben A LA VEZ en un curso con 1 plaza.
// Ejecutar: npx tsx src/playground/race.ts
import { prisma } from '../db.js';
import { enrollStudent, enrollStudentNaive } from '../services/enrollments.service.js';

async function setup() {
  const instructor = await prisma.user.findUniqueOrThrow({ where: { email: 'marta@academia.dev' } });
  const [a, b] = await Promise.all(
    ['sara@academia.dev', 'omar@academia.dev'].map((email) => prisma.user.findUniqueOrThrow({ where: { email } })),
  );
  const course = await prisma.course.create({
    data: { title: 'Taller 1 plaza', price: 10, maxSeats: 1, instructorId: instructor.id },
  });
  return { a, b, course };
}

async function run(label: string, enroll: (u: number, c: number, o: { latencyMs: number }) => Promise<unknown>) {
  const { a, b, course } = await setup();
  const results = await Promise.allSettled([enroll(a.id, course.id, { latencyMs: 100 }), enroll(b.id, course.id, { latencyMs: 100 })]);
  const seats = await prisma.enrollment.count({ where: { courseId: course.id, status: 'ACTIVE' } });
  console.log(`${label}: ${results.map((r) => r.status === 'fulfilled' ? 'inscrito' : `rechazado (${(r.reason as Error).message})`).join(' | ')} → ${seats} inscritos / 1 plaza`);
  await prisma.enrollment.deleteMany({ where: { courseId: course.id } });
  await prisma.course.delete({ where: { id: course.id } });
}

async function main() {
  await run('Ingenua     ', enrollStudentNaive);
  await run('Serializable', enrollStudent);
}

main().finally(() => prisma.$disconnect());
