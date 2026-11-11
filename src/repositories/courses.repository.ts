import { prisma } from '../db.js';

export const coursesRepository = {
  findMany: (params: { skip: number; take: number; categoryId?: number }) =>
    prisma.course.findMany({
      where: { categoryId: params.categoryId, published: true },
      skip: params.skip,
      take: params.take,
      orderBy: { id: 'asc' }, // sin orden explícito, la paginación no es determinista
      include: { category: true },
    }),

  // Práctica: findById, create, update, delete
};
