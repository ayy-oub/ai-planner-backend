// src/controllers/sharing.controller.ts
import { Response, NextFunction } from 'express';
import { SharingService } from '../services/sharing.service';
import { PlannerService } from '../services/planner.service';
import { FirebaseService } from '../services/firebase.service';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { AuthRequest } from '@/middleware/auth';

const sharingService = new SharingService();
const plannerService = new PlannerService();
const firebaseService = new FirebaseService();

export const sharePlanner = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { plannerId } = req.params;
        const { email, permission } = req.body; // permission: 'view' | 'edit'

        // Verify ownership
        const planner = await plannerService.getPlanner(plannerId, userId);
        if (!planner || planner.userId !== userId) {
        throw new AppError('Planner not found or access denied', 404);
        }

        // Get user by email
        const sharedWithUser = await firebaseService.getUserByEmail(email);
        if (!sharedWithUser) {
        throw new AppError('User not found', 404);
        }

        // Check if already shared
        const existingShare = await sharingService.getShareByPlannerAndUser(
        plannerId,
        sharedWithUser.uid
        );
        if (existingShare) {
        throw new AppError('Planner already shared with this user', 400);
        }

        // Create share
        const share = await sharingService.createShare({
        plannerId,
        ownerId: userId,
        sharedWithUserId: sharedWithUser.uid,
        sharedWithEmail: email,
        permission,
        isAccepted: false,
        createdAt: new Date()
        });

        // Log activity
        await firebaseService.logActivity({
        plannerId,
        userId,
        activityType: 'planner_shared',
        description: `Shared planner with ${email} (${permission})`,
        timestamp: new Date()
        });

        // Send notification (via n8n)
        await sharingService.sendShareNotification(share.id, planner.title);

        logger.info(`Planner ${plannerId} shared with ${email}`);

        res.status(201).json({
        success: true,
        data: { share }
        });
    } catch (error) {
        next(error);
    }
};

export const getPlannerShares = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { plannerId } = req.params;

        // Verify ownership
        const planner = await plannerService.getPlanner(plannerId, userId);
        if (!planner || planner.userId !== userId) {
        throw new AppError('Planner not found or access denied', 404);
        }

        const shares = await sharingService.getPlannerShares(plannerId);

        res.json({
        success: true,
        data: { shares }
        });
    } catch (error) {
        next(error);
    }
};

export const updateSharePermission = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { shareId } = req.params;
        const { permission } = req.body; // 'view' | 'edit'

        const share = await sharingService.getShare(shareId);
        if (!share) {
        throw new AppError('Share not found', 404);
        }

        // Verify ownership
        if (share.ownerId !== userId) {
        throw new AppError('Only the owner can update permissions', 403);
        }

        const updatedShare = await sharingService.updateShare(shareId, {
        permission,
        updatedAt: new Date()
        });

        // Log activity
        await firebaseService.logActivity({
        plannerId: share.plannerId,
        userId,
        activityType: 'permission_updated',
        description: `Updated permission to ${permission}`,
        timestamp: new Date()
        });

        res.json({
        success: true,
        data: { share: updatedShare }
        });
    } catch (error) {
        next(error);
    }
};

export const removeShare = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { shareId } = req.params;

        const share = await sharingService.getShare(shareId);
        if (!share) {
        throw new AppError('Share not found', 404);
        }

        // Verify ownership
        if (share.ownerId !== userId) {
        throw new AppError('Only the owner can remove shares', 403);
        }

        await sharingService.deleteShare(shareId);

        // Log activity
        await firebaseService.logActivity({
        plannerId: share.plannerId,
        userId,
        activityType: 'share_removed',
        description: `Removed share with ${share.sharedWithEmail}`,
        timestamp: new Date()
        });

        logger.info(`Share ${shareId} removed by owner`);

        res.json({
        success: true,
        message: 'Share removed successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const acceptInvitation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { shareId } = req.params;

        const share = await sharingService.getShare(shareId);
        if (!share) {
        throw new AppError('Invitation not found', 404);
        }

        // Verify user is the recipient
        if (share.sharedWithUserId !== userId) {
        throw new AppError('Access denied', 403);
        }

        const updatedShare = await sharingService.updateShare(shareId, {
        isAccepted: true,
        acceptedAt: new Date()
        });

        // Log activity
        await firebaseService.logActivity({
        plannerId: share.plannerId,
        userId,
        activityType: 'invitation_accepted',
        description: 'Accepted planner invitation',
        timestamp: new Date()
        });

        logger.info(`User ${userId} accepted invitation ${shareId}`);

        res.json({
        success: true,
        data: { share: updatedShare }
        });
    } catch (error) {
        next(error);
    }
};

export const rejectInvitation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { shareId } = req.params;

        const share = await sharingService.getShare(shareId);
        if (!share) {
        throw new AppError('Invitation not found', 404);
        }

        // Verify user is the recipient
        if (share.sharedWithUserId !== userId) {
        throw new AppError('Access denied', 403);
        }

        await sharingService.deleteShare(shareId);

        logger.info(`User ${userId} rejected invitation ${shareId}`);

        res.json({
        success: true,
        message: 'Invitation rejected'
        });
    } catch (error) {
        next(error);
    }
};

export const getPendingInvitations = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;

        const invitations = await sharingService.getPendingInvitations(userId);

        res.json({
        success: true,
        data: { invitations }
        });
    } catch (error) {
        next(error);
    }
};

export const getSharedWithMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;

        const sharedPlanners = await sharingService.getSharedWithMe(userId);

        res.json({
        success: true,
        data: { planners: sharedPlanners }
        });
    } catch (error) {
        next(error);
    }
};

export const leaveSharedPlanner = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { plannerId } = req.params;

        const share = await sharingService.getShareByPlannerAndUser(plannerId, userId);
        if (!share) {
        throw new AppError('You are not a member of this planner', 404);
        }

        await sharingService.deleteShare(share.id);

        // Log activity
        await firebaseService.logActivity({
        plannerId,
        userId,
        activityType: 'left_planner',
        description: 'Left shared planner',
        timestamp: new Date()
        });

        logger.info(`User ${userId} left planner ${plannerId}`);

        res.json({
        success: true,
        message: 'Left planner successfully'
        });
    } catch (error) {
        next(error);
    }
};