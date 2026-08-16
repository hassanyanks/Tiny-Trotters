import express from 'express';
import path from 'path';
import 'dotenv/config';
import bodyParser from 'body-parser';
import {PDFDocument, rgb} from 'pdf-lib';
import fs from 'fs';
import { signWaiverGet } from '../controllers/waiverController.js';

const STORAGE_DIR = './stored_waivers';
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

const __dirname = import.meta.dirname
const FILE_PATH = path.join(__dirname, '../public/templates');

var router = express.Router();
router.use(express.static(FILE_PATH));
console.log(`***************** file path:  ${FILE_PATH}`)
router.use(express.urlencoded({ extended: true }));
router.use(express.json({limit: '10mb'}));
router.use(express.static('public'));
router.use(bodyParser.json({limit: '10mb'}));


router.get('/', signWaiverGet );
router.get('/sign-waiver', signWaiverGet);

router.post('/sign-waiver', async (req, res) => {
    try {

        //all these preceded by event are actually customer data--they are programmtically named for thus for efficiency
        const { customerName, customerAddress, customerPhone, signatureImage, customerChildData } = req.body;

        console.log(`***********************req.body:  ${JSON.stringify(req.body)}`);

        if (!customerName || !customerAddress || !customerPhone || !signatureImage || !customerChildData) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // 1. Process the incoming Base64 image
        const base64Data = signatureImage.replace(/^data:image\/png;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // 2. Read and load your existing waiver template file
        const templateBuffer = fs.readFileSync(`${FILE_PATH}/${process.env.WAIVER_FORM}`);
        const sourcePdfDoc = await PDFDocument.load(templateBuffer);

        // Create a new PDF and copy  pages to new doc that will contain the signature
        const pdfDoc = await PDFDocument.create();
        const sourcePages = sourcePdfDoc.getPages();
        const lastSourcePage = sourcePages[sourcePages.length - 1];
        const { width, height } = lastSourcePage.getSize();
        const pageIndices = sourcePdfDoc.getPageIndices();
        const copiedPages = await pdfDoc.copyPages(sourcePdfDoc, [0]);

        for (const page of copiedPages) {
            pdfDoc.addPage(page);
        }

        // 3. Append a new blank page to the end of the document
        // By default, this matches the size of standard letters/A4 pages
        const newPage = pdfDoc.addPage([width, height]);

        // 4. Embed the PNG signature
        const embeddedSignature = await pdfDoc.embedPng(imageBuffer);

        // 5. Draw text on the newly appended page
        newPage.drawText("HOST SIGNATURE:", { x: 50, y: 750, size: 12 });
        //newPage.drawImage(embeddedSignature, {
        //    x: 150,
        //    y: 700,
        //    width: 300,
        //    height: 100,
        //});       
        newPage.drawText(`Printed Name:  Sydney Radford Date:  ${new Date().toLocaleDateString()}`, { x: 50, y: 675, size: 12 });
        newPage.drawText('Address:  420 E Florinda St, Hanford, CA 93230', { x: 50, y: 660, size: 12 });
        newPage.drawText('Phone Number:  385-309-9979', { x: 50, y: 645, size: 12 });

        newPage.drawText("VENUE SIGNATURE:", { x: 50, y: 550, size: 12 });
        newPage.drawImage(embeddedSignature, {
            x: 250,
            y: 500,
            width: 300,
            height: 100,
        });       
        newPage.drawText(`Printed Name:  ${customerName} Date:  ${new Date().toLocaleDateString()}`, { x: 50, y: 475, size: 12 });
        newPage.drawText(`Address:  ${customerAddress}`, { x: 50, y: 450, size: 12 });
        newPage.drawText(`Phone Number:  ${customerPhone}`, { x: 50, y: 435, size: 12 });
        newPage.drawText('Names and ages of children in vicinity of ponies:', { x: 50, y: 420, size: 12 });
        newPage.drawText(customerChildData, { x: 60, y: 405, size: 12 });

        // 6. Save document and stream bytes to client
        const pdfBytes = await pdfDoc.save();
        const pdfBuffer = Buffer.from(pdfBytes);

        // 7. Save the file to the backend server
        const safeName = customerName.replace(/[^a-z0-9]/gi, '_').toLowerCase(); // Sanitize input
        const filename = `${safeName}_${Date.now()}.pdf`;                 // Unique filename
        const filePath = path.join(STORAGE_DIR, filename);
        
        fs.writeFileSync(filePath, pdfBuffer); // Write to local disk
        console.log(`Document saved successfully at: ${filePath}`);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=signed_waiver.pdf');
        res.setHeader('Access-Control-Expose-Headers', 'X-Redirect-To');
        res.set('X-Redirect-To', '/index');
        return res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Error appending signature:', error);
        return res.status(500).json({ error: 'Failed to process document.' });
    }
});

export default router;
