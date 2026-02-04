import { createWriteStream, existsSync, mkdirSync, readFileSync } from 'fs';
import { readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { createGzip } from 'zlib';
import archiver from 'archiver';

const distPath = './dist';
const outputPath = './builds';
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const version = packageJson.version;
const outputFile = `kommentify-linkedin-v${version}.zip`;

// Create builds directory if it doesn't exist
if (!existsSync(outputPath)) {
  mkdirSync(outputPath, { recursive: true });
}

// Check if dist folder exists
if (!existsSync(distPath)) {
  console.error('❌ Error: dist folder not found. Please run "npm run build" first.');
  process.exit(1);
}

// Create a file to stream archive data to
const output = createWriteStream(join(outputPath, outputFile));
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log('✓ Extension packaged successfully!');
  console.log(`✓ File: ${outputFile}`);
  console.log(`✓ Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  console.log(`✓ Location: ${join(outputPath, outputFile)}`);
});

// Handle warnings
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    throw err;
  }
});

// Handle errors
archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Append files from the dist directory
archive.directory(distPath, false);

// Finalize the archive
archive.finalize();

console.log(`🚀 Creating production build: ${outputFile}...`);
