import { cachedCitiesStr } from '../utils/cityService.js'; 
import 'dotenv/config'; 

import fs from 'fs';
import ImageTracer from 'imagetracerjs';
import { createCanvas, loadImage } from 'canvas';

async function pngToSvg(pngPath, svgOutputPath) {
  // 1. Load the PNG into a virtual canvas canvas
  const image = await loadImage(pngPath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  // 2. Extract raw pixel data
  const imgData = ctx.getImageData(0, 0, image.width, image.height);

  // 3. Trace pixel boundaries into mathematical options
  const svgString = ImageTracer.imagedataToSVG(imgData, { 
    ltres: 1, 
    qtres: 1, 
    scale: 1,
    numberofcolors: 16 // Higher numbers capture more detail but make huge files
  });

  fs.writeFileSync(svgOutputPath, svgString);
}

// Usage

export const index = async (req, res, next) => {
  try {
    pngToSvg('./public/images/tiny_trotters_qr_code.png', './public/images/qr.svg');
    res.locals.citiesServed = cachedCitiesStr; 
    return res.render("index", { qrCodeFile: '/images/qr.svg' }); 

  } catch (error) { 
    return next(error); 
  } 
};
