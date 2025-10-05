// src/routes/activity.routes.ts
import { Router } from 'express';
import {
    getPlannerActivity,
    getUserActivity,
    getActivityDetails,
    clearActivityLog
} from '../controllers/activity.controller';
import { authenticate as authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Activity logs
router.get('/planner/:plannerId', getPlannerActivity);
router.get('/user', getUserActivity);
router.get('/:activityId', getActivityDetails);
router.delete('/planner/:plannerId', clearActivityLog);

export default router;