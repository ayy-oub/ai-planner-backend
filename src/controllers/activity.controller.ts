// src/controllers/activity.controller.ts
import {  Response, NextFunction } from 'express';
import { FirebaseService } from '../services/firebase.service';
import { PlannerService } from '../services/planner.service';
import { AppError } from '../utils/errors';
import { AuthRequest } from '@/middleware/auth';

const firebaseService = new FirebaseService();
const plannerService = new PlannerService();

export const getPlannerActivity = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { plannerId } = req.params;
        const { limit = 50, startAfter } = req.query;

        // Verify access
        const hasPermission = await plannerService.checkPermission(plannerId, userId, 'view');
        if (!hasPermission) {
        throw new AppError('Access denied', 403);
        }

        const activities = await firebaseService.getActivityLogs(
        plannerId,
        Number(limit),
        startAfter as string
        );

        res.json({
        success: true,
        data: { activities }
        });
    } catch (error) {
        next(error);
    }
};

export const getUserActivity = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { limit = 50, startAfter } = req.query;

        const activities = await firebaseService.getUserActivityLogs(
        userId,
        Number(limit),
        startAfter as string
        );

        res.json({
        success: true,
        data: { activities }
        });
    } catch (error) {
        next(error);
    }
};

export const getActivityDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { activityId } = req.params;

        const activity = await firebaseService.getActivityLog(activityId);

        if (!activity) {
        throw new AppError('Activity not found', 404);
        }

        // Verify access to planner
        const hasPermission = await plannerService.checkPermission(
        activity.plannerId,
        userId,
        'view'
        );
        if (!hasPermission) {
        throw new AppError('Access denied', 403);
        }

        res.json({
        success: true,
        data: { activity }
        });
    } catch (error) {
        next(error);
    }
};

export const clearActivityLog = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { plannerId } = req.params;

        // Verify ownership
        const planner = await plannerService.getPlanner(plannerId, userId);
        if (!planner || planner.userId !== userId) {
        throw new AppError('Only the owner can clear activity logs', 403);
        }

        await firebaseService.clearActivityLogs(plannerId);

        res.json({
        success: true,
        message: 'Activity log cleared successfully'
        });
    } catch (error) {
        next(error);
    }
};