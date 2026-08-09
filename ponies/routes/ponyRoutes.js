import express from 'express';
import { ponies } from '../controllers/poniesController.js';

const router = express.Router();
router.get('/', ponies);
router.get('/ponies', ponies);
export default router;

