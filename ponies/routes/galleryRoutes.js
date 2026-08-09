import express from 'express';
import { pictures } from '../controllers/galleryController.js';

const router = express.Router();
router.get('/', pictures);
router.get('/gallery', pictures);
export default router;

