// src/routes/planners.routes.ts
import { Router } from 'express';
import {
    getAllPlanners,
    getPlanner,
    createPlanner,
    updatePlanner,
    deletePlanner,
    duplicatePlanner,
    setDefaultPlanner,
    getPlannersByDate,
    archivePlanner,
    restorePlanner
} from '../controllers/planners.controller';
import {authenticate as authMiddleware } from '../middleware/auth';
import {validate as validateRequest } from '../middleware/validate';
import { createPlannerSchema, updatePlannerSchema } from '../models/validators';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Planner CRUD
router.get('/', getAllPlanners);
router.post('/', validateRequest(createPlannerSchema), createPlanner);
router.get('/:id', getPlanner);
router.put('/:id', validateRequest(updatePlannerSchema), updatePlanner);
router.delete('/:id', deletePlanner);

// Planner operations
router.post('/:id/duplicate', duplicatePlanner);
router.put('/:id/default', setDefaultPlanner);
router.get('/date/:date', getPlannersByDate);
router.put('/:id/archive', archivePlanner);
router.put('/:id/restore', restorePlanner);

export default router;