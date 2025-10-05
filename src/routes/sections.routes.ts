// src/routes/sections.routes.ts
import { Router } from 'express';
import {
    getSections,
    getSection,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    toggleCollapse,
    bulkUpdateSections,
    duplicateSection,
    getSectionsByType
} from '../controllers/sections.controller';
import {authenticate as authMiddleware } from '../middleware/auth';
import {validate as validateRequest } from '../middleware/validate';
import { createSectionSchema, updateSectionSchema } from '../models/validators';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Section CRUD
router.get('/planner/:plannerId/date/:date', getSections);
router.get('/:id', getSection);
router.post('/planner/:plannerId', validateRequest(createSectionSchema), createSection);
router.put('/:id', validateRequest(updateSectionSchema), updateSection);
router.delete('/:id', deleteSection);

// Section operations
router.put('/reorder', reorderSections);
router.put('/:id/collapse', toggleCollapse);
router.put('/bulk-update', bulkUpdateSections);
router.post('/:id/duplicate', duplicateSection);
router.get('/planner/:plannerId/type/:type', getSectionsByType);

export default router;