// ============================================
// src/app.ts - Express App Configuration
// ============================================
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import routes from './routes';

const app: Application = express();

// ====================
// Security & Middleware
// ====================

// Security headers
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev', {
        stream: {
        write: (message) => logger.info(message.trim()),
        },
    }));
}

// ====================
// Rate limiting
// ====================
app.use('/api/auth', authLimiter); // Apply stricter limit to auth routes
app.use('/api', apiLimiter);       // General API rate limit

// ====================
// Health check
// ====================
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// ====================
// Main API routes
// ====================
app.use('/api', routes);

// ====================
// 404 Not Found
// ====================
app.use((req: Request, res: Response) => {
    res.status(404).json({
        status: 'error',
        message: 'Resource not found',
        path: req.originalUrl,
    });
});

// ====================
// Global Error Handler
// ====================
app.use(errorHandler);

export default app;
