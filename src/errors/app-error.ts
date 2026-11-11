// Errores de dominio con su código HTTP. El errorHandler los traduce a respuestas.
export class AppError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) { super(404, `${resource} not found`); }
}

export class ConflictError extends AppError {
  constructor(message: string) { super(409, message); }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') { super(401, message); }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') { super(403, message); }
}
