const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function scaleHeicImage() {
  try {
    const inputFile = 'TEST/IMG_8672.HEIC';
    const inputPath = path.resolve(inputFile);
    
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error(`Error: Input file ${inputFile} does not exist`);
      process.exit(1);
    }
    
    // Generate output filename
    const dir = path.dirname(inputPath);
    const name = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(dir, `${name}_scaled_w300.jpg`);
    
    console.log(`Processing: ${inputFile}`);
    console.log(`Output: ${outputPath}`);
    
          // Get original image info
      const metadata = await sharp(inputPath).metadata();
      console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);
      console.log(`Original format: ${metadata.format}`);
      
      // Scale image to width 300, maintaining aspect ratio
      await sharp(inputPath)
        .resize(300, null, {
          withoutEnlargement: true // Don't enlarge if original is smaller
        })
        .jpeg({ quality: 90 })
        .toFile(outputPath);
    
    // Get new image info
    const newMetadata = await sharp(outputPath).metadata();
    console.log(`Scaled dimensions: ${newMetadata.width}x${newMetadata.height}`);
    console.log(`✅ Successfully scaled ${inputFile} to ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error processing image:', error.message);
    
    // Check if it's a HEIC support issue
    if (error.message.includes('Input file contains unsupported image format')) {
      console.error('HEIC format might not be supported. Checking sharp capabilities...');
      try {
        console.log('Sharp formats:', sharp.format);
        console.log('HEIC input support:', sharp.format.heif?.input?.buffer || 'Not available');
      } catch (e) {
        console.error('Could not check sharp capabilities:', e.message);
      }
    }
    process.exit(1);
  }
}

// Check sharp capabilities on startup
console.log('Sharp version info:', sharp.versions);
console.log('Available formats:', Object.keys(sharp.format));
console.log('HEIC support check:', sharp.format.heif ? '✅ Available' : '❌ Not available');

// Run the scaling function
scaleHeicImage();
