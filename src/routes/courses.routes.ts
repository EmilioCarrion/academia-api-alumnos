import { Router } from 'express';
import { coursesController } from '../controllers/courses.controller.js';
import { enrollmentsController } from '../controllers/enrollments.controller.js';
import { validateBody } from '../middlewares/validate.js';
import { createEnrollmentSchema } from '../schemas/enrollment.schema.js';

export const coursesRouter = Router();

coursesRouter.get('/', coursesController.list);
// Práctica: GET /:id, POST /, PATCH /:id, DELETE /:id

coursesRouter.post('/:id/enrollments', validateBody(createEnrollmentSchema), enrollmentsController.create);
