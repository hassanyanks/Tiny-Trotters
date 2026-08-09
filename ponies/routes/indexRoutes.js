import express from 'express';
import { index } from '../controllers/indexController.js';

const router = express.Router();

// Define clean GET routes
router.get('/', index);
router.get('/index', index);

export default router;
