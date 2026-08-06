import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { ponies } from '../controllers/poniesController.js';
 
var router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json()); 

router.get('/ponies', ponies);

export default router;
