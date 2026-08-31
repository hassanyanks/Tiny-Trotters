import express from 'express';
import path from 'path';
import 'dotenv/config';
import bodyParser from 'body-parser';
//import {PDFDocument, rgb} from 'pdf-lib';
import fs from 'fs';
import { waiverGet, waiverPost } from '../controllers/waiverControllers.js';

/*
const STORAGE_DIR = './stored_waivers';
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

const __dirname = import.meta.dirname
const FILE_PATH = path.join(__dirname, '../public/templates');
*/

var router = express.Router();
//router.use(express.static(FILE_PATH));
//console.log(`***************** file path:  ${FILE_PATH}`)
router.use(express.urlencoded({ extended: true }));
router.use(express.json({limit: '10mb'}));
router.use(express.static('public'));
router.use(bodyParser.json({limit: '10mb'}));


router.get('/', waiverGet );
router.get('/waiver', waiverGet);

router.post('/waiver-done', waiverPost );


export default router;
