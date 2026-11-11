import type { Request, Response } from 'express';
import { prisma } from '../db.js';
import { idParamSchema } from '../schemas/course.schema.js';
import { enrollStudent } from '../services/enrollments.service.js';

export const enrollmentsController = {
  // POST /api/v1/courses/:id/enrollments
  create: async (req: Request, res: Response) => {
    const { id: courseId } = idParamSchema.parse(req.params);
    res.status(201).json(await enrollStudent(req.body.userId, courseId));
  },

  // GET /api/v1/users/:id/enrollments
  listForUser: async (req: Request, res: Response) => {
    const { id: userId } = idParamSchema.parse(req.params);
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: { course: { select: { id: true, title: true } } },
      orderBy: { enrolledAt: 'desc' },
    });
    res.status(200).json(enrollments);
  },
};
