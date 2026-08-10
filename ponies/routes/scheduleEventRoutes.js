import express from 'express';
import { eventSchedule } from '../controllers/scheduleEventControllers.js';
 
var router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json()); 

router.get('/', eventSchedule );
router.get('/schedule_event', eventSchedule );

export default router;
