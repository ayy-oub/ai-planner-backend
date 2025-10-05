// src/controllers/planners.controller.ts
import { Response, NextFunction } from 'express';
import { PlannerService } from '../services/planner.service';
import { FirebaseService } from '../services/firebase.service';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { AuthRequest } from '@/middleware/auth';

const plannerService = new PlannerService();
const firebaseService = new FirebaseService();

export const getAllPlanners = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const { includeArchived } = req.query;

    const planners = await plannerService.getUserPlanners(
      userId,
      includeArchived === 'true'
    );

    res.json({
      success: true,
      data: { planners }
    });
  } catch (error) {
    next(error);
  }
};

export const getPlanner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const { id } = req.params;

    const planner = await plannerService.getPlanner(id, userId);

    if (!planner) {
      throw new AppError('Planner not found', 404);
    }

    res.json({
      success: true,
      data: { planner }
    });
  } catch (error) {
    next(error);
  }
};

export const createPlanner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const { title, color, icon, description, isDefault } = req.body;

    // If setting as default, unset other defaults
    if (isDefault) {
      await plannerService.unsetAllDefaults(userId);
    }

    const planner = await plannerService.createPlanner({
      userId,
      title,
      color: color || 'blue',
      icon: icon || 'calendar',
      description: description || '',
      isDefault: isDefault || false,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Log activity
    await firebaseService.logActivity({
      plannerId: planner.id,
      userId,
      activityType: 'planner_created',
      description: `Created planner: ${title}`,
      timestamp: new Date()
    });

    logger.info(`Planner created: ${planner.id} by user: ${userId}`);

    res.status(201).json({
      success: true,
      data: { planner }
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlanner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const { id } = req.params;
    const updates = req.body;

    // Verify ownership or edit permission
    const hasPermission = await plannerService.checkPermission(id, userId, 'edit');
    if (!hasPermission) {
      throw new AppError('Insufficient permissions', 403);
    }

    // If setting as default, unset other defaults
    if (updates.isDefault) {
      await plannerService.unsetAllDefaults(userId);
    }

    const updatedPlanner = await plannerService.updatePlanner(id, {
      ...updates,
      updatedAt: new Date()
    });

    // Log activity
    await firebaseService.logActivity({
      plannerId: id,
      userId,
      activityType: 'planner_updated',
      description: `Updated planner settings`,
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: { planner: updatedPlanner }
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlanner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const { id } = req.params;

    // Verify ownership
    const planner = await plannerService.getPlanner(id, userId);
    if (!planner || planner.userId !== userId) {
      throw new AppError('Planner not found or access denied', 404);
    }

    await plannerService.deletePlanner(id);

    // Log activity
    await firebaseService.logActivity({
      plannerId: id,
      userId,
      activityType: 'planner_deleted',
      description: `Deleted planner: ${planner.title}`,
      timestamp: new Date()
    });

    logger.info(`Planner deleted: ${id} by user: ${userId}`);

    res.json({
      success: true,
      message: 'Planner deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const duplicatePlanner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const { id } = req.params;
    const { title } = req.body;

    // Verify access
    const hasPermission = await plannerService.checkPermission(id, userId, 'view');
    if (!hasPermission) {
      throw new AppError('Planner not found or access denied', 404);
    }

    const duplicatedPlanner = await plannerService.duplicatePlanner(
      id,
      userId,
      title || undefined
    );

    // Log activity
    await firebaseService.logActivity({
      plannerId: duplicatedPlanner.id,
      userId,
      activityType: 'planner_duplicated',
      description: `Duplicated planner from: ${id}`,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: { planner: duplicatedPlanner }
    });
  } catch (error) {
    next(error);
  }
};

export const setDefaultPlanner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const { id } = req.params;

    // Verify ownership
    const planner = await plannerService.getPlanner(id, userId);
    if (!planner || planner.userId !== userId) {
      throw new AppError('Planner not found or access denied', 404);
    }

    // Unset all defaults
    await plannerService.unsetAllDefaults(userId);

    // Set this as default
    await plannerService.updatePlanner(id, { isDefault: true });

    res.json({
      success: true,
      message: 'Default planner updated'
    });
  } catch (error) {
    next(error);
  }
};

export const getPlannersByDate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const { date } = req.params;

    const planners = await plannerService.getPlannersByDate(userId, date);

    res.json({
      success: true,
      data: { planners }
    });
  } catch (error) {
    next(error);
  }
};

export const archivePlanner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const { id } = req.params;

    // Verify ownership
    const planner = await plannerService.getPlanner(id, userId);
    if (!planner || planner.userId !== userId) {
      throw new AppError('Planner not found or access denied', 404);
    }

    await plannerService.updatePlanner(id, {
      isArchived: true,
      archivedAt: new Date()
    });

    // Log activity
    await firebaseService.logActivity({
      plannerId: id,
      userId,
      activityType: 'planner_archived',
      description: `Archived planner: ${planner.title}`,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Planner archived successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const restorePlanner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const { id } = req.params;

    // Verify ownership
    const planner = await plannerService.getPlanner(id, userId);
    if (!planner || planner.userId !== userId) {
      throw new AppError('Planner not found or access denied', 404);
    }

    await plannerService.updatePlanner(id, {
      isArchived: false,
      archivedAt: undefined
    });

    // Log activity
    await firebaseService.logActivity({
      plannerId: id,
      userId,
      activityType: 'planner_restored',
      description: `Restored planner: ${planner.title}`,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Planner restored successfully'
    });
  } catch (error) {
    next(error);
  }
};