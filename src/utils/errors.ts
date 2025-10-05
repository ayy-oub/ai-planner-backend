// ============================================
// src/utils/errors.ts - Custom Error Classes
// ============================================

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly details?: ReadonlyArray<any>;

    constructor(message: string, statusCode: number = 500, details?: any[]) {
        super(message);
        this.name = this.constructor.name; // Explicit name
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 404);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(message, 403);
    }
}

export class ValidationError extends AppError {
    constructor(message: string = 'Validation error', details?: any[]) {
        super(message, 400, details);
    }
}
