import express from 'express';
import { events } from '../controllers/dataController.js';
 
var router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json()); 

router.get('/schedule_event', events );

export default router;
