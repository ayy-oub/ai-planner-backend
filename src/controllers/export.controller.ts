// src/controllers/export.controller.ts
import { Response, NextFunction } from 'express';
import { PdfService } from '../services/pdf.service';
import { PlannerService } from '../services/planner.service';
import { FirebaseService } from '../services/firebase.service';
import { N8nService } from '../services/n8n.service';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { AuthRequest } from '@/middleware/auth';

const pdfService = new PdfService();
const plannerService = new PlannerService();
const firebaseService = new FirebaseService();
const n8nService = new N8nService();

export const exportPlannerPDF = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { plannerId } = req.params;
        const { date, viewType, includeSections } = req.body;

        // Verify access
        const hasPermission = await plannerService.checkPermission(plannerId, userId, 'view');
        if (!hasPermission) {
        throw new AppError('Access denied', 403);
        }

        // Get planner and sections
        const planner = await plannerService.getPlanner(plannerId, userId);
        const sections = await firebaseService.getSections(plannerId, date);

        // Filter sections if specified
        const filteredSections = includeSections 
        ? sections.filter(s => includeSections.includes(s.type))
        : sections;

        // Generate PDF via n8n workflow
        const exportJob = await n8nService.generatePDF({
        userId,
        planner,
        sections: filteredSections,
        date,
        viewType
        });

        // Log activity
        await firebaseService.logActivity({
        plannerId,
        userId,
        activityType: 'pdf_exported',
        description: `Exported ${viewType} view as PDF`,
        timestamp: new Date()
        });

        logger.info(`PDF export started: ${exportJob.id} for planner: ${plannerId}`);

        res.json({
        success: true,
        data: {
            exportId: exportJob.id,
            status: 'processing'
        }
        });
    } catch (error) {
        next(error);
    }
};

export const exportDateRangePDF = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { plannerId, startDate, endDate, viewType } = req.body;

        // Verify access
        const hasPermission = await plannerService.checkPermission(plannerId, userId, 'view');
        if (!hasPermission) {
        throw new AppError('Access denied', 403);
        }

        // Get planner
        const planner = await plannerService.getPlanner(plannerId, userId);

        // Get all sections in date range
        const allSections = await firebaseService.getSectionsInRange(
        plannerId,
        startDate,
        endDate
        );

        // Generate PDF
        const exportJob = await n8nService.generatePDF({
        userId,
        planner,
        sections: allSections,
        startDate,
        endDate,
        viewType
        });

        // Log activity
        await firebaseService.logActivity({
        plannerId,
        userId,
        activityType: 'pdf_exported',
        description: `Exported date range as PDF`,
        timestamp: new Date()
        });

        res.json({
        success: true,
        data: {
            exportId: exportJob.id,
            status: 'processing'
        }
        });
    } catch (error) {
        next(error);
    }
};

export const getExportStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { exportId } = req.params;

        const status = await firebaseService.getExportStatus(exportId, userId);

        if (!status) {
        throw new AppError('Export not found', 404);
        }

        res.json({
        success: true,
        data: { status }
        });
    } catch (error) {
        next(error);
    }
};

export const downloadExport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { exportId } = req.params;

        const exportData = await firebaseService.getExportData(exportId, userId);

        if (!exportData) {
        throw new AppError('Export not found', 404);
        }

        if (exportData.status !== 'completed') {
        throw new AppError('Export not ready yet', 400);
        }

        // Get download URL from Firebase Storage
        const downloadUrl = await firebaseService.getExportDownloadUrl(exportData.filePath);

        res.json({
        success: true,
        data: {
            downloadUrl,
            filename: exportData.filename
        }
        });
    } catch (error) {
        next(error);
    }
};

export const exportToCalendar = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { plannerId } = req.params;
        const { startDate, endDate, calendarType } = req.body; // 'google' | 'apple' | 'ics'

        // Verify access
        const hasPermission = await plannerService.checkPermission(plannerId, userId, 'view');
        if (!hasPermission) {
        throw new AppError('Access denied', 403);
        }

        // Get schedule sections in range
        const sections = await firebaseService.getSectionsInRange(
        plannerId,
        startDate,
        endDate
        );

        const schedules = sections.filter(s => s.type === 'daily_schedule');

        // Convert to calendar format
        const events = pdfService.convertToCalendarEvents(schedules);

        // Generate ICS file or sync with Google Calendar
        let result;
        if (calendarType === 'google') {
        result = await n8nService.syncToGoogleCalendar(userId, events);
        } else {
        result = await pdfService.generateICSFile(events);
        }

        // Log activity
        await firebaseService.logActivity({
        plannerId,
        userId,
        activityType: 'calendar_exported',
        description: `Exported to ${calendarType} calendar`,
        timestamp: new Date()
        });

        res.json({
        success: true,
        data: result
        });
    } catch (error) {
        next(error);
    }
};