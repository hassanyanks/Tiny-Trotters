import fs from 'fs';
import path from 'path';

const __dirname = import.meta.dirname
const INPUT_SVG = path.join(__dirname, '../public/images/qr.svg');
const OUTPUT_SVG = path.join(__dirname, '../public/images/recolored_qr.svg');

// Define your new colors here
//const NEW_QR_COLOR = '#4A90E2';       // Light Blue for the QR code squares
const NEW_BG_COLOR = '#c98ea4';       // Off-white for the background (if present)

function recolorSvg() {
    try {
        let svgString = fs.readFileSync(INPUT_SVG, 'utf8');

        // 1. Change the main QR module colors (Handles both fills and inline styles)
        // This looks for common default colors like black (#000000, #000, or black)
        //svgString = svgString.replace(/fill="#000000"/gi, `fill="${NEW_QR_COLOR}"`);
        //svgString = svgString.replace(/fill="#000"/gi, `fill="${NEW_QR_COLOR}"`);
        //svgString = svgString.replace(/fill="black"/gi, `fill="${NEW_QR_COLOR}"`);

        // 2. Optional: Change the background fill color if your SVG has a background rect
        svgString = svgString.replace(/fill="#ffffff"/gi, `fill="${NEW_BG_COLOR}"`);
        svgString = svgString.replace(/fill="#fff"/gi, `fill="${NEW_BG_COLOR}"`);
        svgString = svgString.replace(/fill="white"/gi, `fill="${NEW_BG_COLOR}"`);

        fs.writeFileSync(OUTPUT_SVG, svgString);
        console.log(`Success! Saved recolored QR code to ${OUTPUT_SVG}`);
    } catch (error) {
        console.error("Error updating SVG colors:", error.message);
    }
}

recolorSvg();
