// ============================================
// src/server.ts - Entry Point
// ============================================
import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import { logger } from './utils/logger';

const PORT = Number(process.env.PORT) || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    if (process.env.FIREBASE_PROJECT_ID) {
        logger.info(`🔥 Firebase Project: ${process.env.FIREBASE_PROJECT_ID}`);
    }
});

// Graceful shutdown
const shutdown = (signal: string) => {
    logger.info(`${signal} received: closing HTTP server`);
    server.close((err) => {
        if (err) {
            logger.error('Error during server shutdown', err);
            process.exit(1);
        }
        logger.info('Server closed gracefully');
        process.exit(0);
    });
};

// Handle termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unexpected errors
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    process.exit(1);
});
