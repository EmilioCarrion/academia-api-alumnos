import { Router } from 'express';
import { enrollmentsController } from '../controllers/enrollments.controller.js';

export const usersRouter = Router();

usersRouter.get('/:id/enrollments', enrollmentsController.listForUser);
