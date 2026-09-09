import express from 'express';
import { getScheduledEvents } from '../controllers/calendarControllers.js';
import { cachedCitiesStr } from '../utils/cityService.js';

const router = express.Router();

router.get('/calendar', (req, res) => {
    res.locals.citiesServed = cachedCitiesStr; 
    res.render('scheduled_events_calendar');
});

router.get('/api/calendar', getScheduledEvents );

router.get('/api/available-slots', (req, res) => {
  // FullCalendar automatically sends req.query.start and req.query.end
  const openSlots = [
    { id: '1', title: 'Open Slot', start: '2026-09-07T09:00:00', end: '2026-09-07T10:00:00' },
    { id: '2', title: 'Open Slot', start: '2026-09-07T10:00:00', end: '2026-09-07T11:00:00' }
  ];
  res.json(openSlots);
});

export default router;

