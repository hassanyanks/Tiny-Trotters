import express from 'express';
import { index } from '../controllers/indexControllers.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// Define clean GET routes
router.get('/', asyncHandler(index));
router.get('/index', asyncHandler(index));

export default router;
