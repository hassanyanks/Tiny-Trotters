import { cachedCitiesStr } from '../utils/cityService.js';
import { updateScheduledEvent, getScheduledEventData } from './eventService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { emailDocument } from '../bin/emails.js';
import path from 'path';
import 'dotenv/config';
import {PDFDocument, rgb} from 'pdf-lib';
import fs from 'fs';

const __dirname = import.meta.dirname

const STORAGE_DIR = path.join(__dirname, '../public/signable_waivers');
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

const FILE_PATH = path.join(__dirname, '../public/templates');

export const waiverPost = asyncHandler(async(req, res, next) => {
  try { 

      // COMMENTED-OUT CODE BELOW IS RESERVED FOR FUTURE USE--WHEN WE START USING ELECTRONIC SIGNING 

      //all these preceded by event are actually customer data--they are programmtically named for thus for efficiency
      const { customerName, customerPhone, customerAddress, venueName, venuePhone, venueAddress, customerChildData /*, signatureImage*/ } = req.body;

      console.log(`***********************req.body:  ${JSON.stringify(req.body)}`);

      if ( !customerName || !customerPhone || !customerAddress || !customerChildData  /* || !signatureImage */ ) {
          return res.status(400).json({ error: 'Missing required fields.' });
      }

      // ELECTRONIC SIGNATURE FEATURE CODE BELOW COMMENTED OUT IS RESERVED FOR FUTURE USE--WHEN WE START USING ELECTRONIC SIGNING 
      // 1. Process the incoming Base64 image
      //const base64Data = signatureImage.replace(/^data:image\/png;base64,/, "");
      //const imageBuffer = Buffer.from(base64Data, 'base64');

      // 2. Read and load your existing waiver template file
      const templateBuffer = fs.readFileSync(`${FILE_PATH}/${process.env.WAIVER_FORM}`);
      const sourcePdfDoc = await PDFDocument.load(templateBuffer);

      // Create a new PDF and copy  pages to new doc that will contain the signature
      const pdfDoc = await PDFDocument.create();
      const sourcePages = sourcePdfDoc.getPages();
      const lastSourcePage = sourcePages[sourcePages.length - 1];
      //const { width, height } = lastSourcePage.getSize();
      //const pageIndices = sourcePdfDoc.getPageIndices();
      //const copiedPages = await pdfDoc.copyPages(sourcePdfDoc, [0]);
      const [firstPage] = await pdfDoc.copyPages(sourcePdfDoc, [0]);
      pdfDoc.addPage(firstPage);

      // THIS AND OTHER SIMILAR COMMENTED OUT CODE IS FOR FUTURE USE WHEN WE START USING ELECTRONIC SIGNING
      //const embeddedSignature = await pdfDoc.embedPng(imageBuffer);

      firstPage.drawText( "HOST SIGNATURE:  ", { x: 50, y: 500, size: 12 });
      firstPage.drawText( "______________________________________________________", { x: 175, y: 500, size: 12 });
      //firstPage.drawImage(embeddedSignature, {
      //    x: 150,
      //    y: 700,
      //    width: 300,
      //    height: 100,
      //});

      firstPage.drawText( `Printed Name:  ${customerName}`, { x: 50, y: 475, size: 12 } );                                                   
      firstPage.drawText( 'Date:  _______________', { x: 400, y: 475, size: 12 });
      firstPage.drawText(`Address:  ${customerAddress}`, { x: 50, y: 460, size: 12 });
      firstPage.drawText(`Phone Number:  ${customerPhone}`, { x: 50, y: 445, size: 12 });

      let eventLocation = req.body.eventLocation;

      if( eventLocation === 'Another Venue' ) {

        firstPage.drawText( "VENUE SIGNATURE:  ", { x: 50, y: 400, size: 12 });
        firstPage.drawText( "______________________________________________________", { x: 175, y: 400, size: 12 });
        //firstPage.drawImage(embeddedSignature, {
        //    x: 250,
        //    y: 500,
        //    width: 300,
        //    height: 100,
        //}); 
        
        firstPage.drawText(`Printed Name: ${venueName}`, { x: 50, y: 375, size: 12 });
        firstPage.drawText( 'Date:  _______________', { x: 400, y: 375, size: 12 });
        firstPage.drawText(`Address:  ${venueAddress}`, { x: 50, y: 360, size: 12 });
        firstPage.drawText(`Phone Number:  ${venuePhone}`, { x: 50, y: 345, size: 12 });

      }

      let venueSectionYstart = 400;
      let venueSectionyYend = 345;
      let childrensSectionYstart = eventLocation === 'Another Venue' ? venueSectionyYend-50 : venueSectionYstart; 
      firstPage.drawText('Names and ages of children in vicinity of ponies:', { x: 50, y: childrensSectionYstart, size: 12 });
      firstPage.drawText(customerChildData, { x: 70, y: childrensSectionYstart-20, size: 12 });

      // 6. Save document and stream bytes to client
      const pdfBytes = await pdfDoc.save();
      const pdfBuffer = Buffer.from(pdfBytes);
      if( !pdfBytes || !pdfBuffer ) { throw new Error( "Something went wrong creating signal version of waiver!" ) };

      // 7. Save the file to the backend server
      const safeName = customerName.replace(/[^a-z0-9]/gi, '_').toLowerCase(); // Sanitize input
      const filename = `${safeName}_${Date.now()}.pdf`;                 // Unique filename
      const filePath = path.join(STORAGE_DIR, filename);      
      fs.writeFileSync(filePath, pdfBuffer); // Write to local disk

      let setBody = { waiverForm: pdfBuffer };
      let result = await updateScheduledEvent( req.body.eventMongoDbId, setBody );
      emailDocument( Buffer.from(pdfBytes), req.body.customerEmail, process.env.STAFF_EMAIL );

      res.redirect( 303, '/index' );

  } catch (error) {
      console.error('Error processing waiver:', error);
      return res.status(500).json({ error: 'Failed to process waiver.' });
  }

});

export const waiverGet = asyncHandler(async(req, res, next) => {
  try { 

    res.locals.customerName = req.query.customerName;
    res.locals.customerPhone = req.query.customerPhone;
    res.locals.customerEmail = req.query.customerEmail;
    res.locals.customerAddress = req.query.customerAddress;
    res.locals.eventLocation = req.query.eventLocation;
    
    console.log(`waiverGet customer email:  ${res.locals.customerEmail} `)

    if( res.locals.eventLocation === 'Another Venue' ) {
      res.locals.venueName = req.query.venueName;
      res.locals.venuePhone = req.query.venuePhone;
      res.locals.venueAddress = req.query.venueAddress;
    }

    res.locals.waiverForm = process.env.WAIVER_FORM;
    res.locals.citiesServed = cachedCitiesStr;
    res.locals.eventMongoDbId = req.query.eventMongoDbId;

    res.render("waiver", { url:  '/waiver'} );

  } catch (error) {
    next(error);
  }
});

/*
router.post('/waiver', async (req, res) => {
    try {

        // COMMENTED-OUT CODE BELOW IS RESERVED FOR FUTURE USE--WHEN WE START USING ELECTRONIC SIGNING 

        //all these preceded by event are actually customer data--they are programmtically named for thus for efficiency
        const { customerName, customerPhone, venueAddress, venuePhone, customerChildData , signatureImage } = req.body;

        console.log(`***********************req.body:  ${JSON.stringify(req.body)}`);

        if ( !customerName || !customerPhone || !venueAddress || !customerChildData || !signatureImage ) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // RESERVED FOR FUTURE USE--WHEN WE START USING ELECTRONIC SIGNING 
        // 1. Process the incoming Base64 image
        //const base64Data = signatureImage.replace(/^data:image\/png;base64,/, "");
        //const imageBuffer = Buffer.from(base64Data, 'base64');

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
        //const embeddedSignature = await pdfDoc.embedPng(imageBuffer);

        // 5. Draw text on the newly appended page
        newPage.drawText("HOST SIGNATURE:", { x: 50, y: 750, size: 12 });
        //newPage.drawImage(embeddedSignature, {
        //    x: 150,
        //    y: 700,
        //    width: 300,
        //    height: 100,
        //});       
        newPage.drawText(`Printed Name:  ${customerName} ${new Date().toLocaleDateString()}`, { x: 50, y: 675, size: 12 });
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
        newPage.drawText(`Address:  ${customerAddress}`, { x: 50, y: 460, size: 12 });
        newPage.drawText(`Phone Number:  ${customerPhone}`, { x: 50, y: 445, size: 12 });
        newPage.drawText('Names and ages of children in vicinity of ponies:', { x: 50, y: 430, size: 12 });
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
*/