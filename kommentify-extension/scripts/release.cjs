#!/usr/bin/env node

/**
 * Release Script for Kommentify Extension
 * 
 * This script:
 * 1. Prompts for version number, features, bug fixes, and release notes
 * 2. Updates version in manifest.json and package.json
 * 3. Builds the extension
 * 4. Creates a zip file
 * 5. Uploads to backend API with all metadata
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');
const archiver = require('archiver');

// Get admin token from environment variable
const ADMIN_UPLOAD_TOKEN = process.env.ADMIN_UPLOAD_TOKEN;

if (!ADMIN_UPLOAD_TOKEN) {
    console.error('❌ Error: ADMIN_UPLOAD_TOKEN environment variable is not set');
    console.log('   Run: export ADMIN_UPLOAD_TOKEN=your_token_here');
    process.exit(1);
}

// Configuration
const API_URL = 'https://kommentify.com/api/admin/extension-versions/upload';

const MANIFEST_PATH = path.join(__dirname, '..', 'src', 'manifest.json');
const DIST_MANIFEST_PATH = path.join(__dirname, '..', 'dist', 'manifest.json');
const PACKAGE_PATH = path.join(__dirname, '..', 'package.json');
const DIST_PATH = path.join(__dirname, '..', 'dist');
const BUILDS_PATH = path.join(__dirname, '..', 'builds');

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper to prompt user
function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

// Helper to prompt for multiline input
async function promptMultiline(question) {
    console.log(question);
    console.log('  (Enter each item on a new line. Type "done" when finished)');
    
    const lines = [];
    while (true) {
        const line = await prompt('  > ');
        if (line.toLowerCase() === 'done' || line === '') break;
        if (line.trim()) lines.push(line.trim());
    }
    return lines;
}

// Update version in manifest.json
function updateManifest(version) {
    console.log(`\n📝 Updating manifest.json to version ${version}...`);
    
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
async function createZip(version) {
    console.log('\n📦 Creating zip file...');
    
    // Ensure builds directory exists
    if (!fs.existsSync(BUILDS_PATH)) {
        fs.mkdirSync(BUILDS_PATH, { recursive: true });
    }
    
    const zipFilename = `kommentify-v${version}.zip`;
    const zipPath = path.join(BUILDS_PATH, zipFilename);
    
    // Remove existing zip if it exists
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
        
        archive.on('error', (err) => {
            reject(err);
        });
        
        archive.pipe(output);
        archive.directory(DIST_PATH, false);
        archive.finalize();
    });
}

// Upload to backend API
async function uploadToBackend(zipPath, version, features, bugFixes, releaseNotes) {
    console.log('\n☁️ Uploading to backend API...');
    
    // Read the zip file
    const zipBuffer = fs.readFileSync(zipPath);
    const zipBlob = new Blob([zipBuffer], { type: 'application/zip' });
    
    // Create form data
    const formData = new FormData();
    formData.append('file', zipBlob, path.basename(zipPath));
    formData.append('version', version);
    formData.append('features', JSON.stringify(features));
    formData.append('bugFixes', JSON.stringify(bugFixes));
    formData.append('releaseNotes', releaseNotes);
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ADMIN_UPLOAD_TOKEN}`
            },
            body: formData
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
    console.log('  🚀 KOMMENTIFY EXTENSION RELEASE TOOL');
    console.log('═══════════════════════════════════════════════════════════');
    
    try {
        // Read current version
        const currentManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
        console.log(`\nCurrent version: ${currentManifest.version}`);
        
        // Prompt for new version
        const version = await prompt('\n📌 Enter new version number: ');
        if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
            console.error('❌ Invalid version format. Use semver (e.g., 1.3.9)');
            rl.close();
            return;
        }
        
        // Prompt for features
        console.log('');
        const features = await promptMultiline('✨ Enter new features (one per line):');
        
        // Prompt for bug fixes
        console.log('');
        const bugFixes = await promptMultiline('🐛 Enter bug fixes (one per line):');
        
        // Prompt for release notes
        console.log('');
        const releaseNotes = await prompt('📋 Enter release notes (single line): ');
        
        // Confirm
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('  RELEASE SUMMARY');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`  Version: ${version}`);
        console.log(`  Features: ${features.length > 0 ? features.join(', ') : 'None'}`);
        console.log(`  Bug Fixes: ${bugFixes.length > 0 ? bugFixes.join(', ') : 'None'}`);
        console.log(`  Release Notes: ${releaseNotes || 'None'}`);
        console.log('═══════════════════════════════════════════════════════════');
        
        const confirm = await prompt('\n🤔 Proceed with release? (y/n): ');
        if (confirm.toLowerCase() !== 'y') {
            console.log('❌ Release cancelled.');
            rl.close();
            return;
        }
        
        // Step 1: Update versions
        updateManifest(version);
        updatePackage(version);
        
        // Step 2: Build
        const buildSuccess = buildExtension();
        if (!buildSuccess) {
            rl.close();
            return;
        }
        
        // Step 3: Create zip
        const zipPath = await createZip(version);
        
        // Step 4: Upload
        const uploadResult = await uploadToBackend(zipPath, version, features, bugFixes, releaseNotes);
        
        console.log('\n═══════════════════════════════════════════════════════════');
        if (uploadResult) {
            console.log('  ✅ RELEASE COMPLETE!');
            console.log(`  Version ${version} has been uploaded successfully.`);
            console.log(`  Download: ${uploadResult.downloadUrl}`);
        } else {
            console.log('  ⚠️ PARTIAL RELEASE');
            console.log(`  Version ${version} built and zipped locally.`);
            console.log(`  Upload failed - please upload manually.`);
            console.log(`  Zip file: ${zipPath}`);
        }
        console.log('═══════════════════════════════════════════════════════════\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        rl.close();
    }
}

// Run
main();
