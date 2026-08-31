import express from 'express';
import { ponies } from '../controllers/poniesControllers.js';

const router = express.Router();
router.get('/', ponies);
router.get('/ponies', ponies);
export default router;

