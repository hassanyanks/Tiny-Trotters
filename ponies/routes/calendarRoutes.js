import express from 'express';
import { getScheduledEvents } from '../controllers/calendarControllers.js';

const router = express.Router();

router.get('/calendar', getScheduledEvents);
router.get('/api/events/');

export default router;

