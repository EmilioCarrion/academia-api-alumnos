import { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../db.js';
import { ConflictError, NotFoundError } from '../errors/app-error.js';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// `latencyMs` simula el tiempo entre leer el aforo y escribir la inscripción
// (red, lógica de negocio…). Solo se usa en la demo para que la carrera se vea.
type Options = { latencyMs?: number };

// ❌ Versión ingenua: con el aislamiento por defecto de PostgreSQL
// (READ COMMITTED), dos inscripciones simultáneas leen el mismo conteo,
// las dos pasan el control de aforo y el curso se sobrevende.
export async function enrollStudentNaive(userId: number, courseId: number, { latencyMs = 0 }: Options = {}) {
  return prisma.$transaction(async (tx) => {
    const course = await tx.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundError('Course');

    const taken = await tx.enrollment.count({ where: { courseId, status: 'ACTIVE' } });
    await sleep(latencyMs);
    if (taken >= course.maxSeats) throw new ConflictError('Curso completo');

    return tx.enrollment.create({ data: { userId, courseId, status: 'ACTIVE' } });
  });
}

// PostgreSQL aborta una de las transacciones serializables que se pisan
// (SQLSTATE 40001). Si aborta en una sentencia llega como P2034; si aborta en
// el COMMIT, como DriverAdapterError con cause.kind === 'TransactionWriteConflict'.
// Con adapter-pg salen los dos (1 de 4 frente a 3 de 4 en nuestras pruebas).
function isSerializationFailure(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientKnownRequestError) return err.code === 'P2034';
  const cause = (err as { cause?: { kind?: string } } | null)?.cause;
  return cause?.kind === 'TransactionWriteConflict';
}

// ✅ Serializable + reintento: la transacción abortada se repite y, al
// repetirse, ya ve la plaza ocupada → "Curso completo".
export async function enrollStudent(userId: number, courseId: number, { latencyMs = 0 }: Options = {}) {
  const maxAttempts = 3;
  for (let attempt = 1; ; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const course = await tx.course.findUnique({ where: { id: courseId } });
          if (!course) throw new NotFoundError('Course');

          // Solo cuentan las activas: una inscripción CANCELLED libera plaza
          const taken = await tx.enrollment.count({ where: { courseId, status: 'ACTIVE' } });
          await sleep(latencyMs);
          if (taken >= course.maxSeats) throw new ConflictError('Curso completo');

          return tx.enrollment.create({ data: { userId, courseId, status: 'ACTIVE' } });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (err) {
      if (isSerializationFailure(err) && attempt < maxAttempts) continue;
      throw err;
    }
  }
}
