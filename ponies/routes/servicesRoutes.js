import express from 'express';
import { services } from '../controllers/servicesControllers.js';

const router = express.Router();
router.get('/', services);
router.get('/services', services);
export default router;

