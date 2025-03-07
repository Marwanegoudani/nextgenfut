/**
 * This script can be used to generate favicon files from the logo.svg file.
 * You'll need to install the following packages:
 * npm install -g svg2png-cli
 * 
 * Usage:
 * node scripts/generate-favicons.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');
const svgPath = path.join(publicDir, 'logo.svg');

// Sizes for different favicon formats
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

console.log('Generating favicon files from SVG...');

// Check if svg2png-cli is installed
try {
  execSync('svg2png --version', { stdio: 'ignore' });
} catch (error) {
  console.error('Error: svg2png-cli is not installed. Please install it with: npm install -g svg2png-cli');
  process.exit(1);
}

// Check if the SVG file exists
if (!fs.existsSync(svgPath)) {
  console.error(`Error: SVG file not found at ${svgPath}`);
  process.exit(1);
}

// Generate PNG files for each size
sizes.forEach(({ name, size }) => {
  const outputPath = path.join(publicDir, name);
  try {
    execSync(`svg2png ${svgPath} -w ${size} -h ${size} -o ${outputPath}`);
    console.log(`Generated ${name} (${size}x${size})`);
  } catch (error) {
    console.error(`Error generating ${name}: ${error.message}`);
  }
});

// Generate favicon.ico (requires ImageMagick)
try {
  const faviconPath = path.join(publicDir, 'favicon.ico');
  execSync(`convert ${path.join(publicDir, 'favicon-16x16.png')} ${path.join(publicDir, 'favicon-32x32.png')} ${faviconPath}`);
  console.log('Generated favicon.ico');
} catch (error) {
  console.error(`Error generating favicon.ico: ${error.message}`);
  console.log('Note: favicon.ico generation requires ImageMagick to be installed.');
}

console.log('Favicon generation complete!');
console.log('Note: If you don\'t have ImageMagick installed for favicon.ico generation,');
console.log('you can use an online converter like https://favicon.io/favicon-converter/'); 