import { prisma } from '../db.js';
import type { CreateCourseInput, UpdateCourseInput } from '../schemas/course.schema.js';

export const coursesRepository = {
  findMany: (params: { skip: number; take: number; categoryId?: number }) =>
    prisma.course.findMany({
      where: { categoryId: params.categoryId, published: true },
      skip: params.skip,
      take: params.take,
      orderBy: { id: 'asc' }, // sin orden explícito, la paginación no es determinista
      include: { category: true },
    }),

  findById: (id: number) => prisma.course.findUnique({ where: { id } }),

  create: (data: CreateCourseInput) => prisma.course.create({ data }),

  update: (id: number, data: UpdateCourseInput) => prisma.course.update({ where: { id }, data }),

  delete: (id: number) => prisma.course.delete({ where: { id } }),
};
