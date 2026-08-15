import express from 'express';
import { eventScheduleGet, eventSchedulePost, scheduleEventCanceledPost} from '../controllers/scheduleEventControllers.js';

//routes
var router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json()); 

router.get('/', eventScheduleGet );
router.get('/schedule-event', eventScheduleGet);
router.post('/', eventSchedulePost);
router.post('/index', eventSchedulePost);
router.get('/scheduled-event', eventSchedulePost)

export default router;
