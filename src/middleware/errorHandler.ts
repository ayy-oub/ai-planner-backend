// ============================================
// src/middleware/errorHandler.ts - Error Handling
// ============================================
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

interface ErrorResponse {
    status: 'error';
    message: string;
    details?: any[];
}

export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response<ErrorResponse>,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = 'Internal server error';
    let details: any[] | undefined = undefined;

    // Handle custom AppError
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        // Convert ReadonlyArray to mutable array for JSON response
        details = err.details ? [...err.details] : undefined;
    } else if (err instanceof Error) {
        message = err.message;
    }

    // Log error
    logger.error('Unhandled Error', {
        message: (err as Error).message,
        stack: (err as Error).stack,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
    });

    // Send structured JSON error response
    res.status(statusCode).json({
        status: 'error',
        message,
        ...(details ? { details } : {}),
    });

  // Optional: call next(err) if using chained error middlewares
  // next(err);
};
