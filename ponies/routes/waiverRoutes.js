import express from 'express';
import path from 'path';
import 'dotenv/config';
import bodyParser from 'body-parser';
//import {PDFDocument, rgb} from 'pdf-lib';
import fs from 'fs';
import { waiverGet, waiverPost } from '../controllers/waiverControllers.js';

var router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json({limit: '10mb'}));
router.use(express.static('public'));
router.use(bodyParser.json({limit: '10mb'}));


router.get('/', waiverGet );
router.get('/waiver', waiverGet);
router.post('/waiver', waiverPost);

export default router;
