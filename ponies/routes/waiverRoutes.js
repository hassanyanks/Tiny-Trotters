import express from 'express';
import path from 'path';
import 'dotenv/config';
import { signWaiverGet } from '../controllers/waiverControllers.js';
import bodyParser from 'body-parser';
import {PDFDocument, rgb} from 'pdf-lib';
import fs from 'fs';

const STORAGE_DIR = './stored_waivers';
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

var router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json({limit: '10mb'}));
router.use(express.static('public'));
router.use(bodyParser.json({limit: '10mb'}));

router.get('/sign-waiver', signWaiverGet );

router.post('/sign-waiver', async (req, res) => {
    try {
        const { name, signatureImage } = req.body;

        if (!name || !signatureImage) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // 1. Process the incoming Base64 image
        const base64Data = signatureImage.replace(/^data:image\/png;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // 2. Read and load your existing waiver template file
        const templateBuffer = fs.readFileSync(process.env.WAIVER_FORM);
        const pdfDoc = await PDFDocument.load(templateBuffer);

        // 3. Append a new blank page to the end of the document
        // By default, this matches the size of standard letters/A4 pages
        const newPage = pdfDoc.addPage();

        // 4. Embed the PNG signature
        const embeddedSignature = await pdfDoc.embedPng(imageBuffer);

        // 5. Draw text and signature on the newly appended page
        newPage.drawText('Acknowledgment and Signature', { x: 50, y: 750, size: 20 });
        newPage.drawText(`I, ${name}, agree to the terms above.`, { x: 50, y: 700, size: 12 });
        newPage.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 50, y: 670, size: 12 });
        
        // Draw the signature line and image
        newPage.drawText('Signature:', { x: 50, y: 600, size: 12 });
        newPage.drawImage(embeddedSignature, {
            x: 50,
            y: 480,
            width: 200,
            height: 100,
        });

        // 6. Save document and stream bytes to client
        const pdfBytes = await pdfDoc.save();
        const pdfBuffer = Buffer.from(pdfBytes);

        // 7. Save the file to the backend server
        const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase(); // Sanitize input
        const filename = `${safeName}_${Date.now()}.pdf`;                 // Unique filename
        const filePath = path.join(STORAGE_DIR, filename);
        
        fs.writeFileSync(filePath, pdfBuffer); // Write to local disk
        console.log(`Document saved successfully at: ${filePath}`);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=signed_waiver.pdf');
        return res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Error appending signature:', error);
        return res.status(500).json({ error: 'Failed to process document.' });
    }
});

export default router;
