const sharp = require('sharp');
const path = require('path');

const inputFile = path.join(__dirname, '../public/logo.png');
const sizes = [192, 512];

async function generateIcons() {
  try {
    // Generar los diferentes tamaños de PNG
    for (const size of sizes) {
      await sharp(inputFile)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .toFile(path.join(__dirname, `../public/logo${size}.png`));
      console.log(`Generated logo${size}.png`);
    }

    // Generar el favicon
    await sharp(inputFile)
      .resize(64, 64, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(path.join(__dirname, '../public/favicon.ico'));
    console.log('Generated favicon.ico');

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
