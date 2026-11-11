import express from 'express';
import { errorHandler } from './middlewares/error-handler.js';
import { authRouter } from './routes/auth.routes.js';
import { coursesRouter } from './routes/courses.routes.js';
import { usersRouter } from './routes/users.routes.js';

// La app se exporta sin arrancar: server.ts hace listen() y los tests
// (sesión 6) la usan directamente con Supertest.
export const app = express();

app.use(express.json());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/courses', coursesRouter);
app.use('/api/v1/users', usersRouter);

app.use(errorHandler); // siempre el último
