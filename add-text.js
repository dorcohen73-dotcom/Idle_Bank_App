const sharp = require('sharp');
const fs = require('fs');

async function addTextToImage() {
  const inputImagePath = 'C:\\Users\\dorco\\.gemini\\antigravity-ide\\brain\\5dd3d253-ef74-496f-9fa5-b5c4be78787d\\bank_app_icon_classic_1783161647823.png';
  const outputImagePath = 'C:\\Users\\dorco\\.gemini\\antigravity-ide\\brain\\5dd3d253-ef74-496f-9fa5-b5c4be78787d\\final_icon_with_text.png';

  // We create an SVG overlay with the text. The image generated is usually 1024x1024.
  const width = 1024;
  const height = 1024;
  
  const svgText = `
    <svg width="${width}" height="${height}">
      <style>
        .title { 
          fill: #ffffff; 
          font-size: 85px; 
          font-family: 'Arial', sans-serif; 
          font-weight: bold;
          text-anchor: middle;
          letter-spacing: 2px;
        }
        .shadow {
          fill: #000000;
          font-size: 85px; 
          font-family: 'Arial', sans-serif; 
          font-weight: bold;
          text-anchor: middle;
          letter-spacing: 2px;
        }
      </style>
      <text x="50%" y="12%" class="shadow">BANK EMPIRE</text>
      <text x="50%" y="11.5%" class="title">BANK EMPIRE</text>
    </svg>
  `;

  try {
    await sharp(inputImagePath)
      .composite([{
        input: Buffer.from(svgText),
        top: 0,
        left: 0
      }])
      .toFile(outputImagePath);
      
    console.log('Successfully added perfectly clean text to the image!');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

addTextToImage();
