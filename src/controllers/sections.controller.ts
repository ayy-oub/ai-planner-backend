// src/controllers/sections.controller.ts
import { Response, NextFunction } from 'express';
import { PlannerService } from '../services/planner.service';
import { FirebaseService } from '../services/firebase.service';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { AuthRequest } from '@/middleware/auth';

const plannerService = new PlannerService();
const firebaseService = new FirebaseService();

export const getSections = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { plannerId, date } = req.params;

        // Verify access
        const hasPermission = await plannerService.checkPermission(plannerId, userId, 'view');
        if (!hasPermission) {
        throw new AppError('Access denied', 403);
        }

        const sections = await firebaseService.getSections(plannerId, date);

        res.json({
        success: true,
        data: { sections }
        });
    } catch (error) {
        next(error);
    }
};

export const getSection = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { id } = req.params;

        const section = await firebaseService.getSection(id);

        if (!section) {
        throw new AppError('Section not found', 404);
        }

        // Verify access to planner
        const hasPermission = await plannerService.checkPermission(
        section.plannerId,
        userId,
        'view'
        );
        if (!hasPermission) {
        throw new AppError('Access denied', 403);
        }

        res.json({
        success: true,
        data: { section }
        });
    } catch (error) {
        next(error);
    }
};

export const createSection = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { plannerId } = req.params;
        const { date, type, title, content, order, isCollapsed } = req.body;

        // Verify edit permission
        const hasPermission = await plannerService.checkPermission(plannerId, userId, 'edit');
        if (!hasPermission) {
        throw new AppError('Insufficient permissions', 403);
        }

        const section = await firebaseService.createSection({
        plannerId,
        date,
        type,
        title: title || type,
        content: content || {},
        order: order || 0,
        isCollapsed: isCollapsed || false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId
        });

        // Log activity
        await firebaseService.logActivity({
        plannerId,
        userId,
        activityType: 'section_created',
        description: `Created section: ${type}`,
        metadata: { sectionId: section.id, date },
        timestamp: new Date()
        });

        logger.info(`Section created: ${section.id} in planner: ${plannerId}`);

        res.status(201).json({
        success: true,
        data: { section }
        });
    } catch (error) {
        next(error);
    }
};

export const updateSection = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { id } = req.params;
        const updates = req.body;

        const section = await firebaseService.getSection(id);
        if (!section) {
        throw new AppError('Section not found', 404);
        }

        // Verify edit permission
        const hasPermission = await plannerService.checkPermission(
        section.plannerId,
        userId,
        'edit'
        );
        if (!hasPermission) {
        throw new AppError('Insufficient permissions', 403);
        }

        const updatedSection = await firebaseService.updateSection(id, {
        ...updates,
        updatedAt: new Date(),
        updatedBy: userId
        });

        // Log activity
        await firebaseService.logActivity({
        plannerId: section.plannerId,
        userId,
        activityType: 'section_updated',
        description: `Updated section: ${section.type}`,
        metadata: { sectionId: id },
        timestamp: new Date()
        });

        res.json({
        success: true,
        data: { section: updatedSection }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteSection = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { id } = req.params;

        const section = await firebaseService.getSection(id);
        if (!section) {
        throw new AppError('Section not found', 404);
        }

        // Verify edit permission
        const hasPermission = await plannerService.checkPermission(
        section.plannerId,
        userId,
        'edit'
        );
        if (!hasPermission) {
        throw new AppError('Insufficient permissions', 403);
        }

        await firebaseService.deleteSection(id);

        // Log activity
        await firebaseService.logActivity({
        plannerId: section.plannerId,
        userId,
        activityType: 'section_deleted',
        description: `Deleted section: ${section.type}`,
        timestamp: new Date()
        });

        res.json({
        success: true,
        message: 'Section deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const reorderSections = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { sectionOrders, plannerId } = req.body; // [{ id, order }]

        // Verify edit permission
        const hasPermission = await plannerService.checkPermission(plannerId, userId, 'edit');
        if (!hasPermission) {
        throw new AppError('Insufficient permissions', 403);
        }

        await firebaseService.reorderSections(sectionOrders);

        // Log activity
        await firebaseService.logActivity({
        plannerId,
        userId,
        activityType: 'sections_reordered',
        description: 'Reordered sections',
        timestamp: new Date()
        });

        res.json({
        success: true,
        message: 'Sections reordered successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const toggleCollapse = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { id } = req.params;

        const section = await firebaseService.getSection(id);
        if (!section) {
        throw new AppError('Section not found', 404);
        }

        // Verify edit permission
        const hasPermission = await plannerService.checkPermission(
        section.plannerId,
        userId,
        'edit'
        );
        if (!hasPermission) {
        throw new AppError('Insufficient permissions', 403);
        }

        const updatedSection = await firebaseService.updateSection(id, {
        isCollapsed: !section.isCollapsed,
        updatedAt: new Date()
        });

        res.json({
        success: true,
        data: { section: updatedSection }
        });
    } catch (error) {
        next(error);
    }
};

export const bulkUpdateSections = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { sections, plannerId } = req.body; // [{ id, updates }]

        // Verify edit permission
        const hasPermission = await plannerService.checkPermission(plannerId, userId, 'edit');
        if (!hasPermission) {
        throw new AppError('Insufficient permissions', 403);
        }

        await firebaseService.bulkUpdateSections(sections);

        // Log activity
        await firebaseService.logActivity({
        plannerId,
        userId,
        activityType: 'sections_bulk_updated',
        description: `Updated ${sections.length} sections`,
        timestamp: new Date()
        });

        res.json({
        success: true,
        message: 'Sections updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const duplicateSection = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { id } = req.params;
        const { targetDate } = req.body;

        const section = await firebaseService.getSection(id);
        if (!section) {
        throw new AppError('Section not found', 404);
        }

        // Verify edit permission
        const hasPermission = await plannerService.checkPermission(
        section.plannerId,
        userId,
        'edit'
        );
        if (!hasPermission) {
        throw new AppError('Insufficient permissions', 403);
        }

        const duplicatedSection = await firebaseService.createSection({
        ...section,
        id: undefined,
        date: targetDate || section.date,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId
        });

        // Log activity
        await firebaseService.logActivity({
        plannerId: section.plannerId,
        userId,
        activityType: 'section_duplicated',
        description: `Duplicated section: ${section.type}`,
        timestamp: new Date()
        });

        res.status(201).json({
        success: true,
        data: { section: duplicatedSection }
        });
    } catch (error) {
        next(error);
    }
};

export const getSectionsByType = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { plannerId, type } = req.params;

        // Verify access
        const hasPermission = await plannerService.checkPermission(plannerId, userId, 'view');
        if (!hasPermission) {
        throw new AppError('Access denied', 403);
        }

        const sections = await firebaseService.getSectionsByType(plannerId, type);

        res.json({
        success: true,
        data: { sections }
        });
    } catch (error) {
        next(error);
    }
};