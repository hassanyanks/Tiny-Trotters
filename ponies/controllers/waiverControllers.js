import { cachedCitiesStr } from '../utils/cityService.js';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
//import * as fs from 'node:fs/promises'; // Kept for production async tasks
import * as fsSync from 'node:fs';        // Added for local dev sync workflow
import 'dotenv/config';
import { createTestSignablePDF } from '../test/create_test_signable_pdf.js';
import bodyParser from 'body-parser'


// 1. GET Router Handler
export const signWaiverGet = async (req, res, next) => {
  try {
    res.locals.citiesServed = cachedCitiesStr;
    res.render("sign_waiver", { url: '/sign-waiver' });
  } catch (error) {
    next(error);
  }
};
