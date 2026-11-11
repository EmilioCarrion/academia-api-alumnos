import type { Request, Response } from 'express';
import { coursesService } from '../services/courses.service.js';
import { listCoursesQuerySchema } from '../schemas/course.schema.js';

// Express 5: si un handler async lanza (o su promesa se rechaza), el error
// llega solo al errorHandler. No hace falta try/catch ni asyncHandler.
export const coursesController = {
  list: async (req: Request, res: Response) => {
    const query = listCoursesQuerySchema.parse(req.query); // ZodError → 400
    res.status(200).json(await coursesService.listCourses(query));
  },

  // Práctica: get, create, update, remove
};
