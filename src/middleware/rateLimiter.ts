// ============================================
// src/middleware/rateLimiter.ts - Rate Limiting
// ============================================
import rateLimit from 'express-rate-limit';
import { CONSTANTS } from '../config/constants';

// --------------------
// General API limiter
// --------------------
export const apiLimiter = rateLimit({
    windowMs: CONSTANTS.RATE_LIMIT.WINDOW_MS,
    max: CONSTANTS.RATE_LIMIT.MAX_REQUESTS,
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,  // Disable `X-RateLimit-*` headers
});

// --------------------
// Authentication-specific limiter
// --------------------
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        status: 'error',
        message: 'Too many authentication attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
