import express from 'express';
import { events } from '../controllers/dataController.js';
 
var router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json()); 

router.get('/request_form', events );

export default router;
