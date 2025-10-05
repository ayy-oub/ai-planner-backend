/* // src/controllers/calendar.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { N8nService as n8nService } from '../services/n8n.service';
import { successResponse } from '../utils/helpers';
import { logger } from '../utils/logger';

export const sync = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { action, events } = req.body;

        const syncResult = await n8nService.callAIWebhook('calendar-sync', {
        userId: req.user!.uid,
        action,
        events
        });

        res.json(successResponse('Calendar sync completed', syncResult));
    } catch (error) {
        logger.error('Calendar sync failed', { error, userId: req.user?.uid, action: req.body.action });
        next(error);
    }
};

export const getEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
        return res.status(400).json({
            status: 'error',
            message: 'startDate and endDate query parameters are required'
        });
        }

        const events = await n8nService.callAIWebhook('get-calendar-events', {
        userId: req.user!.uid,
        startDate,
        endDate
        });

        res.json(successResponse('Calendar events retrieved', events));
    } catch (error) {
        logger.error('Get calendar events failed', { error, userId: req.user?.uid });
        next(error);
    }
};

export const importEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.body;

        const importResult = await n8nService.callAIWebhook('import-calendar-events', {
        userId: req.user!.uid,
        startDate,
        endDate
        });

        res.json(successResponse('Events imported successfully', importResult));
    } catch (error) {
        logger.error('Import events failed', { error, userId: req.user?.uid });
        next(error);
    }
};

export const exportEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { events, calendarId } = req.body;

        const exportResult = await n8nService.callAIWebhook('export-calendar-events', {
        userId: req.user!.uid,
        events,
        calendarId
        });

        res.json(successResponse('Events exported successfully', exportResult));
    } catch (error) {
        logger.error('Export events failed', { error, userId: req.user?.uid });
        next(error);
    }
}; */