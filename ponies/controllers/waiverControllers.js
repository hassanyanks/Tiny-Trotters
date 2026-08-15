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

/*
// 2. Dev-only Automation Helper
//async function applyElectronicSignature(inputPdfPath), outputPdfPath) {

async function applyElectronicSignature(inputPdfPath) {
  const existingPdfBytes = fsSync.readFileSync(inputPdfPath); 
  const pdfDoc = await PDFDocument.load(existingPdfBytes); 
  
  const pages = pdfDoc.getPages();
  const firstPage = pages[0]; 

  const targetX = 72;
  const targetTopY = 792 - 224; 

  const cursiveFont = await pdfDoc.embedFont(StandardFonts.CourierBoldOblique);

  firstPage.drawText('Digitally Verified Document', {
    x: targetX + 12,
    y: targetTopY - 18,
    size: 7,
    font: cursiveFont,
    color: rgb(0.44, 0.50, 0.59),
  });

  firstPage.drawText('John Doe', {
    x: targetX + 12,
    y: targetTopY - 42,
    size: 22,
    font: cursiveFont,
    color: rgb(0.06, 0.32, 0.73),
  });

  const trackingId = `ID: TS-${Math.floor(100000 + Math.random() * 900000)}`;
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  firstPage.drawText(`${trackingId} | ${timestamp}`, {
    x: targetX + 12,
    y: targetTopY - 54,
    size: 6,
    color: rgb(0.18, 0.22, 0.29),
  });

  // Return the Uint8Array directly
  return await pdfDoc.save();
}
*/
/*
    // FIXED: Using fsSync to prevent undefined property runtime crashes
  const existingPdfBytes = fsSync.readFileSync(inputPdfPath); 
  const pdfDoc = await PDFDocument.load(existingPdfBytes); 
  
  const pages = pdfDoc.getPages();
  const firstPage = pages[0]; 

  const targetX = 72;
  const targetTopY = 792 - 224; 

  const cursiveFont = await pdfDoc.embedFont(StandardFonts.CourierBoldOblique);

  firstPage.drawText('Digitally Verified Document', {
    x: targetX + 12,
    y: targetTopY - 18,
    size: 7,
    font: cursiveFont,
    color: rgb(0.44, 0.50, 0.59),
  });

  firstPage.drawText('John Doe', {
    x: targetX + 12,
    y: targetTopY - 42,
    size: 22,
    font: cursiveFont,
    color: rgb(0.06, 0.32, 0.73),
  });

  const trackingId = `ID: TS-${Math.floor(100000 + Math.random() * 900000)}`;
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  firstPage.drawText(`${trackingId} | ${timestamp}`, {
    x: targetX + 12,
    y: targetTopY - 54,
    size: 6,
    color: rgb(0.18, 0.22, 0.29),
  });

  const pdfBytes = await pdfDoc.save();
  fsSync.writeFileSync(outputPdfPath, pdfBytes); // FIXED: Using fsSync
  console.log(`Success: Digitally stamped output saved securely at: ${outputPdfPath}`);
*/

/*
// 3. Core Document Sign Engine (Strictly handles data processing, no HTTP overhead)
async function productionElectronicSign(body) {
  const { name, signatureImage } = body;
  const __dirname = import.meta.dirname;

  const templatePath = path.join(__dirname, 'templates', 'waiver_template.pdf');
  const templateBuffer = await fs.readFile(templatePath); 
  
  const pdfDoc = await PDFDocument.load(templateBuffer);
  const pages = pdfDoc.getPages();
  const targetPage = pages[pages.length - 1]; 

  const base64Data = signatureImage.replace(/^data:image\/png;base64,/, "");
  const signatureImageBuffer = Buffer.from(base64Data, 'base64');
  const embeddedImage = await pdfDoc.embedPng(signatureImageBuffer);
  const dims = embeddedImage.scale(0.35); 

  targetPage.drawText(name, { x: 130, y: 155, size: 12 });
  targetPage.drawText(new Date().toLocaleDateString(), { x: 430, y: 155, size: 12 });
  targetPage.drawImage(embeddedImage, { x: 130, y: 95, width: dims.width, height: dims.height });

  // Optional security practice: flatten interactive signature capabilities
  pdfDoc.getForm().flatten();

  return await pdfDoc.save();
}

// 4. POST Router Handler
export const signWaiverPost = async (req, res, next) => {
  try {
    // FIXED: Handle input validation directly inside controller context
    if (!req.body.name || !req.body.signatureImage) {
      return res.status(400).json({ error: 'Missing form inputs.' });
    }
    
    let pdfBytes;

    // Process document and generate structural binary payload array
    if(process.env.NODE_ENV === 'dev') {
        createTestSignablePDF('./test_signable.pdf')
        pdfBytes = await applyElectronicSignature('./test_signable.pdf'); //, './test_signed.pdf');
    } else {
        pdfBytes =  await productionElectronicSign(req.body);
    }


    const pdfBuffer = Buffer.from(pdfBytes);

    // FIXED: Formulate stream headers completely before piping response chunks
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="test_signed.pdf"');
    return res.send(pdfBuffer);

   } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to generate signed PDF.' });
  }
};
*/
    //res.setHeader('Content-Disposition', 'attachment; filename=test_signed.pdf');
   //const stats = await fs.promises.stat('./test_signed.pdf');
    //res.setHeader('Content-Length', stats.size);
    //res.setHeader('Content-Length', pdfBuffer.length);

    // FIXED: Send final response array payload cleanly, ending the execution lifecycle
    //return res.send(pdfBuffer);
    //return res.download('./test_signed.pdf')

