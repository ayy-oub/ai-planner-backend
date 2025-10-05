// ============================================
// src/utils/logger.ts - Winston Logger
// ============================================
import fs from 'fs';
import path from 'path';
import winston from 'winston';

// Ensure logs directory exists
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Common log format for files
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Console format (human-readable)
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return stack
            ? `[${timestamp}] ${level}: ${message}\n${stack}`
            : `[${timestamp}] ${level}: ${message}`;
    })
);

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    transports: [
        // Console output
        new winston.transports.Console({
            format: consoleFormat,
        }),
        // Error file
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            format: fileFormat,
        }),
        // All logs file
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            format: fileFormat,
        }),
    ],
    exitOnError: false, // Prevent logger from crashing the app
});
