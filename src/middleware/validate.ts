// ============================================
// src/middleware/validate.ts - Request Validation
// ============================================
// src/middleware/validateRequest.ts
import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { AppError } from '../utils/errors';

export const validate = (schema: ObjectSchema) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
        const extractedErrors = error.details.map(detail => ({
            field: detail.context?.key,
            message: detail.message
        }));

        throw new AppError('Validation failed', 400, extractedErrors);
        }

        next();
    };
};

