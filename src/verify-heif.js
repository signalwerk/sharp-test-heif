const { execSync } = require('child_process');
const fs = require('fs');

console.log('=== System Verification ===');

try {
  // Check pkg-config for libheif
  const libheifVersion = execSync('pkg-config --modversion libheif', { encoding: 'utf8' }).trim();
  console.log('libheif version:', libheifVersion);
} catch (e) {
  console.log('❌ pkg-config libheif failed:', e.message);
}

try {
  // Check installed libraries
  const ldconfig = execSync('ldconfig -p | grep heif', { encoding: 'utf8' });
  console.log('libheif libraries found:');
  console.log(ldconfig);
} catch (e) {
  console.log('❌ No libheif libraries found in ldconfig');
}

try {
  // Check x265 library
  const x265 = execSync('ldconfig -p | grep x265', { encoding: 'utf8' });
  console.log('x265 libraries:');
  console.log(x265);
} catch (e) {
  console.log('❌ No x265 libraries found');
}

try {
  // Check de265 library
  const de265 = execSync('ldconfig -p | grep de265', { encoding: 'utf8' });
  console.log('de265 libraries:');
  console.log(de265);
} catch (e) {
  console.log('❌ No de265 libraries found');
}

console.log('\n=== Sharp Information ===');
const sharp = require('sharp');
console.log('Sharp heif version:', sharp.versions.heif);

// Check the HEIC file again with more details
console.log('\n=== File Analysis ===');
const inputFile = 'TEST/IMG_8672.HEIC';
if (fs.existsSync(inputFile)) {
  const buffer = fs.readFileSync(inputFile);
  console.log('File size:', buffer.length);
  
  // Check for HEVC box in the file
  const hevcBox = buffer.includes(Buffer.from('hvcC'));
  const hevcTrack = buffer.includes(Buffer.from('hev1')) || buffer.includes(Buffer.from('hvc1'));
  console.log('Contains HEVC config box:', hevcBox);
  console.log('Contains HEVC track:', hevcTrack);
}

console.log('\n=== Alternative Processing Test ===');
try {
  // Try using sharp with different options
  await sharp(inputFile, { 
    failOnError: false,
    unlimited: true 
  })
  .resize(100, 100)
  .jpeg()
  .toBuffer();
  console.log('✅ Alternative processing succeeded');
} catch (err) {
  console.log('❌ Alternative processing failed:', err.message);
} 