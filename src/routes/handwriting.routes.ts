// src/routes/handwriting.routes.ts
import { Router } from 'express';
import {
  convertHandwritingToText,
  saveHandwritingDrawing,
  getHandwritingData,
  deleteHandwriting
} from '../controllers/handwriting.controller';
import {authenticate as authMiddleware } from '../middleware/auth';
import {validate as validateRequest } from '../middleware/validate';
import { handwritingSchema } from '../models/validators';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Handwriting operations
router.post('/convert', validateRequest(handwritingSchema), convertHandwritingToText);
router.post('/save', validateRequest(handwritingSchema), saveHandwritingDrawing);
router.get('/:id', getHandwritingData);
router.delete('/:id', deleteHandwriting);

export default router;