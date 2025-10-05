// src/controllers/ai.controller.ts
import { Response, NextFunction } from 'express';
import { N8nService } from '../services/n8n.service';
import { PlannerService } from '../services/planner.service';
import { FirebaseService } from '../services/firebase.service';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { AuthRequest } from '@/middleware/auth';

const n8nService = new N8nService();
const plannerService = new PlannerService();
const firebaseService = new FirebaseService();

export const sendChatMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { plannerId, message, context } = req.body;

        // Verify access to planner
        const hasPermission = await plannerService.checkPermission(plannerId, userId, 'view');
        if (!hasPermission) {
        throw new AppError('Access denied', 403);
        }

        // Get planner context
        const planner = await plannerService.getPlanner(plannerId, userId);
        const sections = await firebaseService.getSections(plannerId, context?.date || new Date().toISOString());

        // Send to AI via n8n
        const aiResponse = await n8nService.sendChatMessage({
        userId,
        plannerId,
        message,
        plannerContext: {
            title: planner?.title,
            sections: sections.map(s => ({ type: s.type, content: s.content }))
        }
        });

        // Save chat history
        await firebaseService.saveChatMessage({
        plannerId,
        userId,
        message,
        response: aiResponse.message,
        timestamp: new Date()
        });

        // Log activity
        await firebaseService.logActivity({
        plannerId,
        userId,
        activityType: 'ai_chat',
        description: 'Used AI assistant',
        timestamp: new Date()
        });

        logger.info(`AI chat message sent by user ${userId}`);

        res.json({
        success: true,
        data: {
            message: aiResponse.message,
            suggestions: aiResponse.suggestions
        }
        });
    } catch (error) {
        next(error);
    }
};

export const getChatHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { plannerId } = req.params;
        const { limit = 50 } = req.query;

        // Verify access
        const hasPermission = await plannerService.checkPermission(plannerId, userId, 'view');
        if (!hasPermission) {
        throw new AppError('Access denied', 403);
        }

        const history = await firebaseService.getChatHistory(plannerId, Number(limit));

        res.json({
        success: true,
        data: { history }
        });
    } catch (error) {
        next(error);
    }
};

export const clearChatHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { plannerId } = req.params;

        // Verify ownership
        const planner = await plannerService.getPlanner(plannerId, userId);
        if (!planner || planner.userId !== userId) {
        throw new AppError('Only the owner can clear chat history', 403);
        }

        await firebaseService.clearChatHistory(plannerId);

        res.json({
        success: true,
        message: 'Chat history cleared'
        });
    } catch (error) {
        next(error);
    }
};

export const suggestMeals = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { plannerId, preferences, date } = req.body;

        // Verify access
        const hasPermission = await plannerService.checkPermission(plannerId, userId, 'edit');
        if (!hasPermission) {
        throw new AppError('Insufficient permissions', 403);
        }

        // Call n8n workflow for meal suggestions
        const suggestions = await n8nService.generateMealPlan({
        userId,
        preferences,
        date
        });

        // Log activity
        await firebaseService.logActivity({
        plannerId,
        userId,
        activityType: 'ai_meal_suggestions',
        description: 'Generated meal suggestions',
        timestamp: new Date()
        });

        res.json({
        success: true,
        data: { meals: suggestions }
        });
    } catch (error) {
        next(error);
    }
};

export const generateSchedule = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { plannerId, tasks, date, preferences } = req.body;

        // Verify access
        const hasPermission = await plannerService.checkPermission(plannerId, userId, 'edit');
        if (!hasPermission) {
        throw new AppError('Insufficient permissions', 403);
        }

        // Call n8n workflow
        const schedule = await n8nService.generateSchedule({
        userId,
        tasks,
        date,
        preferences
        });

        // Log activity
        await firebaseService.logActivity({
        plannerId,
        userId,
        activityType: 'ai_schedule_generated',
        description: 'Generated daily schedule',
        timestamp: new Date()
        });

        res.json({
        success: true,
        data: { schedule }
        });
    } catch (error) {
        next(error);
    }
};

export const analyzeHabits = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { plannerId, dateRange } = req.body;

        // Verify access
        const hasPermission = await plannerService.checkPermission(plannerId, userId, 'view');
        if (!hasPermission) {
        throw new AppError('Access denied', 403);
        }

        // Get habit tracker data
        const habitData = await firebaseService.getHabitDataInRange(plannerId, dateRange);

        // Call n8n workflow for analysis
        const analysis = await n8nService.analyzeHabits({
        userId,
        habitData
        });

        res.json({
        success: true,
        data: { analysis }
        });
    } catch (error) {
        next(error);
    }
};

export const suggestTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { plannerId, context } = req.body;

        // Verify access
        const hasPermission = await plannerService.checkPermission(plannerId, userId, 'view');
        if (!hasPermission) {
        throw new AppError('Access denied', 403);
        }

        // Get planner context
        const sections = await firebaseService.getSections(plannerId, context?.date);

        // Call n8n workflow
        const suggestions = await n8nService.suggestTasks({
        userId,
        context: sections
        });

        res.json({
        success: true,
        data: { tasks: suggestions }
        });
    } catch (error) {
        next(error);
    }
};

export const generateGoals = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { plannerId, timeframe, category } = req.body;

        // Verify access
        const hasPermission = await plannerService.checkPermission(plannerId, userId, 'edit');
        if (!hasPermission) {
        throw new AppError('Insufficient permissions', 403);
        }

        // Call n8n workflow
        const goals = await n8nService.generateGoals({
        userId,
        timeframe,
        category
        });

        // Log activity
        await firebaseService.logActivity({
        plannerId,
        userId,
        activityType: 'ai_goals_generated',
        description: `Generated ${timeframe} goals`,
        timestamp: new Date()
        });

        res.json({
        success: true,
        data: { goals }
        });
    } catch (error) {
        next(error);
    }
};

export const provideFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { plannerId, date } = req.body;

        // Verify access
        const hasPermission = await plannerService.checkPermission(plannerId, userId, 'view');
        if (!hasPermission) {
        throw new AppError('Access denied', 403);
        }

        // Get day's data
        const sections = await firebaseService.getSections(plannerId, date);

        // Call n8n workflow
        const feedback = await n8nService.provideFeedback({
        userId,
        sections
        });

        res.json({
        success: true,
        data: { feedback }
        });
    } catch (error) {
        next(error);
    }
};