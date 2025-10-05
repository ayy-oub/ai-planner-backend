import { Router } from 'express';
import { validate } from '../middleware/validate';
import { calendarValidators } from '../models/validators';
import { authenticate } from '../middleware/auth';
import * as calendarController from '../controllers/calendar.controller';

const router = Router();

router.use(authenticate);

router.post('/sync', validate(calendarValidators.sync), calendarController.sync);
router.get('/events', calendarController.getEvents);
router.post('/import', validate(calendarValidators.import), calendarController.importEvents);
router.post('/export', calendarController.exportEvents);

export default router;