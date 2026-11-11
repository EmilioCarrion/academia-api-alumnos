import type { Request, Response } from 'express';
import { coursesService } from '../services/courses.service.js';
import { idParamSchema, listCoursesQuerySchema } from '../schemas/course.schema.js';

// Express 5: si un handler async lanza (o su promesa se rechaza), el error
// llega solo al errorHandler. No hace falta try/catch ni asyncHandler.
export const coursesController = {
  list: async (req: Request, res: Response) => {
    const query = listCoursesQuerySchema.parse(req.query); // ZodError → 400
    res.status(200).json(await coursesService.listCourses(query));
  },

  get: async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    res.status(200).json(await coursesService.getCourse(id));
  },

  create: async (req: Request, res: Response) => {
    res.status(201).json(await coursesService.createCourse(req.body));
  },

  update: async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    res.status(200).json(await coursesService.updateCourse(id, req.body));
  },

  remove: async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await coursesService.deleteCourse(id);
    res.status(204).end();
  },
};
