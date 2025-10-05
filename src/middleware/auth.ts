// ============================================
// src/middleware/auth.ts - JWT Authentication
// ============================================
import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
    user?: {
        uid: string;
        email: string;
        displayName?: string;
    };
}

const extractToken = (header?: string): string | null => {
    if (!header) return null;
    const parts = header.trim().split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') return parts[1];
    return null;
};

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = extractToken(req.headers.authorization);

        if (!token) {
        throw new AppError('No token provided', 401);
        }

        const decodedToken = await firebaseAuth.verifyIdToken(token);

        req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email ?? '',
        displayName: decodedToken.name,
        };

        next();
    } catch (error) {
        logger.warn('Authentication failed', { error });
        next(new AppError('Invalid or expired token', 401));

        res.status(401).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = extractToken(req.headers.authorization);
        if (token) {
        const decodedToken = await firebaseAuth.verifyIdToken(token);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email ?? '',
            displayName: decodedToken.name,
        };
        }
        next();
    } catch (error) {
        logger.debug('Optional auth failed, continuing without user', { error });
        next(); // Continue without user
    }
};
