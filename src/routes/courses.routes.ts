import { Router } from 'express';
import { coursesController } from '../controllers/courses.controller.js';
import { enrollmentsController } from '../controllers/enrollments.controller.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { requireRole } from '../middlewares/require-role.js';
import { validateBody } from '../middlewares/validate.js';
import { createCourseSchema, updateCourseSchema } from '../schemas/course.schema.js';
import { createEnrollmentSchema } from '../schemas/enrollment.schema.js';

export const coursesRouter = Router();

// Lectura pública
coursesRouter.get('/', coursesController.list);
coursesRouter.get('/:id', coursesController.get);

// Escritura: autenticación → rol → validación → controlador (el ownership, en el servicio)
coursesRouter.post('/', requireAuth, requireRole('INSTRUCTOR', 'ADMIN'), validateBody(createCourseSchema), coursesController.create);
coursesRouter.patch('/:id', requireAuth, requireRole('INSTRUCTOR', 'ADMIN'), validateBody(updateCourseSchema), coursesController.update);
coursesRouter.delete('/:id', requireAuth, requireRole('INSTRUCTOR', 'ADMIN'), coursesController.remove);

coursesRouter.post('/:id/enrollments', requireAuth, requireRole('STUDENT'), validateBody(createEnrollmentSchema), enrollmentsController.create);
