// src/routes/sharing.routes.ts
import { Router } from 'express';
import {
    sharePlanner,
    getPlannerShares,
    updateSharePermission,
    removeShare,
    acceptInvitation,
    rejectInvitation,
    getPendingInvitations,
    getSharedWithMe,
    leaveSharedPlanner
} from '../controllers/sharing.controller';
import {authenticate as authMiddleware } from '../middleware/auth';
import {validate as validateRequest } from '../middleware/validate';
import { sharePlannerSchema, updatePermissionSchema } from '../models/validators';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Share planner
router.post('/planner/:plannerId', validateRequest(sharePlannerSchema), sharePlanner);
router.get('/planner/:plannerId', getPlannerShares);

// Manage shares
router.put('/:shareId/permission', validateRequest(updatePermissionSchema), updateSharePermission);
router.delete('/:shareId', removeShare);

// Invitations
router.post('/:shareId/accept', acceptInvitation);
router.post('/:shareId/reject', rejectInvitation);
router.get('/invitations', getPendingInvitations);

// Shared with me
router.get('/shared-with-me', getSharedWithMe);
router.post('/planner/:plannerId/leave', leaveSharedPlanner);

export default router;