// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import plannersRoutes from './planners.routes';
import sectionsRoutes from './sections.routes';
import sharingRoutes from './sharing.routes';
import activityRoutes from './activity.routes';
import aiRoutes from './ai.routes';
import exportRoutes from './export.routes';
import handwritingRoutes from './handwriting.routes';

const router = Router();

// API version prefix
const API_VERSION = '/api/v1';

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'AI Planner API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Mount routes
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/planners`, plannersRoutes);
router.use(`${API_VERSION}/sections`, sectionsRoutes);
router.use(`${API_VERSION}/sharing`, sharingRoutes);
router.use(`${API_VERSION}/activity`, activityRoutes);
router.use(`${API_VERSION}/ai`, aiRoutes);
router.use(`${API_VERSION}/export`, exportRoutes);
router.use(`${API_VERSION}/handwriting`, handwritingRoutes);

// 404 handler
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

export default router;