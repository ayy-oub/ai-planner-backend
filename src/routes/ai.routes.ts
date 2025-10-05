// src/routes/ai.routes.ts
import { Router } from 'express';
import {
    sendChatMessage,
    getChatHistory,
    clearChatHistory,
    suggestMeals,
    generateSchedule,
    analyzeHabits,
    suggestTasks,
    generateGoals,
    provideFeedback
} from '../controllers/ai.controller';
import { authenticate as authMiddleware } from '../middleware/auth';
import { validate as validateRequest } from '../middleware/validate';
import { chatMessageSchema } from '../models/validators';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Chat
router.post('/chat', validateRequest(chatMessageSchema), sendChatMessage);
router.get('/chat/history/:plannerId', getChatHistory);
router.delete('/chat/history/:plannerId', clearChatHistory);

// AI Actions
router.post('/suggest-meals', suggestMeals);
router.post('/generate-schedule', generateSchedule);
router.post('/analyze-habits', analyzeHabits);
router.post('/suggest-tasks', suggestTasks);
router.post('/generate-goals', generateGoals);
router.post('/provide-feedback', provideFeedback);

export default router;