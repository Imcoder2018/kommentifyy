#!/usr/bin/env node

/**
 * Automated Release Script for Kommentify Extension
 * 
 * Usage: node scripts/auto-release.cjs <version> [options]
 * 
 * Example: node scripts/auto-release.cjs 1.3.9 --features "Import scheduler" --bugfixes "Fixed login" --notes "Minor update"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

// Configuration
const API_URL = 'https://kommentify.com/api/admin/extension-versions/upload';
const MANIFEST_PATH = path.join(__dirname, '..', 'src', 'manifest.json');
const PACKAGE_PATH = path.join(__dirname, '..', 'package.json');
const DIST_PATH = path.join(__dirname, '..', 'dist');
const BUILDS_PATH = path.join(__dirname, '..', 'builds');

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const result = {
        version: args[0],
        features: [],
        bugFixes: [],
        releaseNotes: ''
    };

    for (let i = 1; i < args.length; i++) {
        if (args[i] === '--features' && args[i + 1]) {
            result.features = args[++i].split(',').map(s => s.trim());
        } else if (args[i] === '--bugfixes' && args[i + 1]) {
            result.bugFixes = args[++i].split(',').map(s => s.trim());
        } else if (args[i] === '--notes' && args[i + 1]) {
            result.releaseNotes = args[++i];
        }
    }

    return result;
}

// Update version in manifest.json
function updateManifest(version) {
    console.log(`📝 Updating manifest.json to version ${version}...`);
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    manifest.version = version;
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log('✅ src/manifest.json updated');
}

// Update version in package.json
function updatePackage(version) {
    console.log(`📝 Updating package.json to version ${version}...`);
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
    pkg.version = version;
    fs.writeFileSync(PACKAGE_PATH, JSON.stringify(pkg, null, 2));
    console.log('✅ package.json updated');
}

// Build the extension
function buildExtension() {
    console.log('\n🔨 Building extension...');
    try {
        execSync('npm run build', { 
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit' 
        });
        console.log('✅ Build completed');
        return true;
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        return false;
    }
}

// Create zip file
function createZip(version) {
    console.log('\n📦 Creating zip file...');
    
    if (!fs.existsSync(BUILDS_PATH)) {
        fs.mkdirSync(BUILDS_PATH, { recursive: true });
    }
    
    const zipFilename = `kommentify-v${version}.zip`;
    const zipPath = path.join(BUILDS_PATH, zipFilename);
    
    if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
    }
    
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        output.on('close', () => {
            const size = (archive.pointer() / 1024 / 1024).toFixed(2);
            console.log(`✅ Created: ${zipFilename} (${size} MB)`);
            resolve(zipPath);
        });
        
        archive.on('error', (err) => reject(err));
        archive.pipe(output);
        archive.directory(DIST_PATH, false);
        archive.finalize();
    });
}

// Upload to backend API using multipart form-data
async function uploadToBackend(zipPath, version, features, bugFixes, releaseNotes) {
    console.log('\n☁️ Uploading to backend API...');
    
    const zipBuffer = fs.readFileSync(zipPath);
    const filename = path.basename(zipPath);
    
    // Create multipart form-data boundary
    const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
    
    // Build multipart body
    let body = '';
    
    // Add file
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`;
    body += `Content-Type: application/zip\r\n\r\n`;
    
    // Add other fields
    const fields = {
        version,
        features: JSON.stringify(features),
        bugFixes: JSON.stringify(bugFixes),
        releaseNotes
    };
    
    // Combine binary and text parts
    const preBinary = Buffer.from(body, 'utf8');
    const postBinary = Buffer.from('\r\n', 'utf8');
    
    let fieldsBuffer = Buffer.alloc(0);
    for (const [name, value] of Object.entries(fields)) {
        const fieldData = `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;
        fieldsBuffer = Buffer.concat([fieldsBuffer, Buffer.from(fieldData, 'utf8')]);
    }
    
    const endBoundary = Buffer.from(`--${boundary}--\r\n`, 'utf8');
    
    const fullBody = Buffer.concat([preBinary, zipBuffer, postBinary, fieldsBuffer, endBoundary]);
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer admin-upload-token',
                'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: fullBody
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Upload successful!');
            console.log(`   Download URL: ${result.downloadUrl}`);
            return result;
        } else {
            console.error('❌ Upload failed:', result.error || 'Unknown error');
            return null;
        }
    } catch (error) {
        console.error('❌ Upload error:', error.message);
        return null;
    }
}

// Main function
async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🚀 KOMMENTIFY EXTENSION AUTO-RELEASE');
    console.log('═══════════════════════════════════════════════════════════');
    
    const { version, features, bugFixes, releaseNotes } = parseArgs();
    
    if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
        console.error('\n❌ Usage: node scripts/auto-release.cjs <version> [options]');
        console.error('   Example: node scripts/auto-release.cjs 1.3.9 --features "Feature1,Feature2" --bugfixes "Fix1" --notes "Release notes"');
        process.exit(1);
    }
    
    console.log(`\n📌 Version: ${version}`);
    console.log(`✨ Features: ${features.length > 0 ? features.join(', ') : 'None'}`);
    console.log(`🐛 Bug Fixes: ${bugFixes.length > 0 ? bugFixes.join(', ') : 'None'}`);
    console.log(`📋 Notes: ${releaseNotes || 'None'}`);
    
    try {
        // Step 1: Update versions
        updateManifest(version);
        updatePackage(version);
        
        // Step 2: Build
        const buildSuccess = buildExtension();
        if (!buildSuccess) {
            process.exit(1);
        }
        
        // Step 3: Create zip
        const zipPath = await createZip(version);
        
        // Step 4: Upload
        const uploadResult = await uploadToBackend(zipPath, version, features, bugFixes, releaseNotes);
        
        console.log('\n═══════════════════════════════════════════════════════════');
        if (uploadResult) {
            console.log('  ✅ RELEASE COMPLETE!');
            console.log(`  Version ${version} uploaded successfully.`);
            console.log(`  Download: ${uploadResult.downloadUrl}`);
        } else {
            console.log('  ⚠️ PARTIAL RELEASE');
            console.log(`  Version ${version} built and zipped.`);
            console.log(`  Upload may have failed - check Vercel Blob token.`);
            console.log(`  Zip file: ${zipPath}`);
        }
        console.log('═══════════════════════════════════════════════════════════\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
