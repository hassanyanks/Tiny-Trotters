import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';

export async function createTestSignablePDF(outputPath) {
  // 1. Initialize Letter size doc (612 x 792 pt) with 72pt margins
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  
  const margin = 72;
  const { width, height } = page.getSize();
  
  // Embed standard fonts
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontCourier = await pdfDoc.embedFont(StandardFonts.Courier);

  // Helper colors
  const colNavy = rgb(0.101, 0.212, 0.365);   // #1A365D
  const colSlate = rgb(0.176, 0.216, 0.282);  // #2D3748
  const colGray = rgb(0.290, 0.333, 0.408);   // #4A5568
  const colBorder = rgb(0.627, 0.678, 0.753); // #A0AEC0

  // pdf-lib uses bottom-left origin (0,0 at bottom-left).
  // Y coordinate tracker starting from top margin:
  let currentY = height - margin;

  // Title
  currentY -= 20; // font size offset
  page.drawText('E-Signing Test Validation Document', {
    x: margin,
    y: currentY,
    size: 20,
    font: fontBold,
    color: colNavy,
  });
  currentY -= (10 + 0.5 * 16); // moveDown equivalent

  // Subtitle / Intro text (manual wrap using maxWidth)
  const introText = 'This clean, text-only document serves as a target layout matrix for programmatic electronic signature verification pipelines.';
  page.drawText(introText, {
    x: margin,
    y: currentY,
    size: 10,
    font: fontRegular,
    color: colSlate,
    maxWidth: width - (margin * 2),
    lineHeight: 14, // fontSize 10 + lineGap 4
  });
  currentY -= 35; // moveDown(1.5) approx

  // Section 1 Heading
  page.drawText('1. Text-Anchor Automation Targets', {
    x: margin,
    y: currentY,
    size: 12,
    font: fontBold,
    color: colSlate,
  });
  currentY -= 18;

  page.drawText('The tags embedded below can be captured by programmatic regex lookups or API auto-place matchers:', {
    x: margin,
    y: currentY,
    size: 10,
    font: fontRegular,
    color: colSlate,
    maxWidth: width - (margin * 2),
  });
  currentY -= 20;

  // Courier Tag lines
  const tags = [
    '  • DocuSign Anchor String Tag: /sn1/',
    '  • Adobe Sign Text Field Tag:  {{Sig_es_:signer1:signature}}',
    '  • Regex Plaintext Target:    [SIGN_HERE_NOW]'
  ];
  for (const tag of tags) {
    page.drawText(tag, {
      x: margin,
      y: currentY,
      size: 9,
      font: fontCourier,
      color: colGray,
    });
    currentY -= 14;
  }
  currentY -= 15; // extra spacing

  // Section 2 Heading
  page.drawText('2. Cryptographic / Coordinate Signature Placeholder Block', {
    x: margin,
    y: currentY,
    size: 12,
    font: fontBold,
    color: colSlate,
  });
  currentY -= 18;

  page.drawText('The zone below marks the absolute target geometry boundary for backend byte-range signature fields.', {
    x: margin,
    y: currentY,
    size: 10,
    font: fontRegular,
    color: colSlate,
    maxWidth: width - (margin * 2),
  });

    currentY -= 20; // Extra spacing before box

  // Define geometric parameters for the visual bounding box
  const boxX = 72;
  const boxWidth = 250;
  const boxHeight = 60;
  
  // Calculate top of box using your current cursor position tracker
  const boxY = currentY - boxHeight; 

  // Draw the dashed box perimeter 
  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    borderColor: colBorder,
    borderWidth: 1,
    borderDashArray: [4,4]
  });

  // Optional placeholder text inside the bounding box
  page.drawText('SIGN HERE COORD PLACEHOLDER', {
    x: boxX + 15,
    y: boxY + (boxHeight / 2) - 4,
    size: 9,
    font: fontCourier,
    color: colBorder,
  });

  // Serialize the PDF document to bytes (Uint8Array)
  const pdfBytes = await pdfDoc.save();

  // Write the file to disk
  await fs.writeFile(outputPath, pdfBytes);
}


