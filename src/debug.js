const sharp = require('sharp');
const fs = require('fs');

async function debugHeicFile() {
  try {
    const inputFile = 'TEST/IMG_8672.HEIC';
    
    console.log('=== HEIC File Debug ===');
    
    // Check if file exists and get stats
    if (fs.existsSync(inputFile)) {
      const stats = fs.statSync(inputFile);
      console.log(`File size: ${Math.round(stats.size / 1024)} KB`);
      
      // Read first few bytes to check file signature
      const buffer = fs.readFileSync(inputFile);
      const header = buffer.slice(0, 20);
      console.log('File header (hex):', header.toString('hex'));
      console.log('File header (ascii):', header.toString('ascii').replace(/[^\x20-\x7E]/g, '.'));
    } else {
      console.log('❌ File does not exist');
      return;
    }
    
    // Try to get basic metadata without processing
    try {
      const metadata = await sharp(inputFile).metadata();
      console.log('Sharp metadata:', metadata);
    } catch (metaError) {
      console.log('Sharp metadata error:', metaError.message);
    }
    
    // Check sharp's HEIC capabilities
    console.log('\n=== Sharp HEIC Capabilities ===');
    console.log('HEIC format object:', sharp.format.heif);
    
    // Try different approaches
    console.log('\n=== Testing Different Processing Options ===');
    
    // Try with specific options
    try {
      const result = await sharp(inputFile, { 
        failOn: 'none',
        limitInputPixels: false 
      })
      .metadata();
      console.log('✅ Metadata with failOn=none:', result);
    } catch (err) {
      console.log('❌ With failOn=none:', err.message);
    }
    
    // Try creating a minimal processing pipeline
    try {
      await sharp(inputFile)
        .resize(100, 100)
        .jpeg()
        .toBuffer();
      console.log('✅ Small resize test passed');
    } catch (err) {
      console.log('❌ Small resize test failed:', err.message);
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugHeicFile(); 