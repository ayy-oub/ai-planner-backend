// ============================================
// src/config/n8n.ts - n8n Configuration
// ============================================
import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

// --------------------
// Environment variables
// --------------------
const N8N_BASE_URL = process.env.N8N_BASE_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!N8N_BASE_URL) {
    throw new Error('N8N_BASE_URL is not defined in environment variables.');
}

// --------------------
// Axios instance
// --------------------
export const n8nClient: AxiosInstance = axios.create({
    baseURL: N8N_BASE_URL,
    timeout: 30_000,
    headers: {
        'Content-Type': 'application/json',
        ...(N8N_API_KEY ? { 'X-N8N-API-KEY': N8N_API_KEY } : {}),
    },
});

// --------------------
// Request interceptor
// --------------------
n8nClient.interceptors.request.use(
    (config) => {
        logger.debug(`[n8n] Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        logger.error('[n8n] Request Error:', error);
        return Promise.reject(error);
    }
);

// --------------------
// Response interceptor
// --------------------
n8nClient.interceptors.response.use(
    (response) => {
        logger.debug(`[n8n] Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        logger.error('[n8n] Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// --------------------
// Endpoints
// --------------------
export const n8nConfig = {
    baseUrl: process.env.N8N_BASE_URL || 'https://your-n8n-instance.com',
    webhooks: {
        aiChat: '/webhook/ai-chat',
        mealPlan: '/webhook/generate-meal-plan',
        schedule: '/webhook/generate-schedule',
        habitAnalysis: '/webhook/analyze-habits',
        taskSuggestions: '/webhook/suggest-tasks',
        goalGeneration: '/webhook/generate-goals',
        feedback: '/webhook/provide-feedback',
        pdfExport: '/webhook/export-pdf',
        handwritingOCR: '/webhook/handwriting-to-text',
        calendarSync: '/webhook/calendar-sync',
        shareNotification: '/webhook/share-notification'
    }
};
