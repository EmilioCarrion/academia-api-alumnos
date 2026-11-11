import { Router } from 'express';
import { coursesController } from '../controllers/courses.controller.js';
import { enrollmentsController } from '../controllers/enrollments.controller.js';
import { validateBody } from '../middlewares/validate.js';
import { createCourseSchema, updateCourseSchema } from '../schemas/course.schema.js';
import { createEnrollmentSchema } from '../schemas/enrollment.schema.js';

export const coursesRouter = Router();

coursesRouter.get('/', coursesController.list);
coursesRouter.get('/:id', coursesController.get);
coursesRouter.post('/', validateBody(createCourseSchema), coursesController.create);
coursesRouter.patch('/:id', validateBody(updateCourseSchema), coursesController.update);
coursesRouter.delete('/:id', coursesController.remove);

coursesRouter.post('/:id/enrollments', validateBody(createEnrollmentSchema), enrollmentsController.create);
