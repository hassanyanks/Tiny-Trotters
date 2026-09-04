import express from 'express';
import { getScheduledEvents } from '../controllers/calendarControllers.js';
import { cachedCitiesStr } from '../utils/cityService.js';

const router = express.Router();

router.get('/');

router.get('/calendar', (req, res) => {
    res.locals.citiesServed = cachedCitiesStr; 
    res.render('calendar');
});

router.get('/api/calendar', getScheduledEvents );

export default router;

