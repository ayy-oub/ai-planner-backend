// src/routes/export.routes.ts
import { Router } from 'express';
import {
    exportPlannerPDF,
    exportDateRangePDF,
    getExportStatus,
    downloadExport,
    exportToCalendar
} from '../controllers/export.controller';
import { authenticate as authMiddleware } from '../middleware/auth';
import {validate as validateRequest } from '../middleware/validate';
import { exportPDFSchema } from '../models/validators';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// PDF Export
router.post('/pdf/planner/:plannerId', validateRequest(exportPDFSchema), exportPlannerPDF);
router.post('/pdf/date-range', validateRequest(exportPDFSchema), exportDateRangePDF);
router.get('/status/:exportId', getExportStatus);
router.get('/download/:exportId', downloadExport);

// Calendar Export
router.post('/calendar/:plannerId', exportToCalendar);

export default router;