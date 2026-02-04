# Kommentify - LinkedIn Auto Comment & Growth

AI-powered LinkedIn automation Chrome extension for auto-commenting, smart networking, connection requests, post scheduling, and analytics. Grow your LinkedIn presence effortlessly.

## ✨ Features

- 🤖 **AI Auto-Commenting** - Generate intelligent, context-aware comments
- 🔗 **Smart Networking** - Automated connection requests with personalized messages
- 📝 **Post Scheduler** - Schedule LinkedIn posts in advance
- 📊 **Analytics Dashboard** - Track engagement and growth metrics
- ⚙️ **Customizable Settings** - Set daily limits, working hours, and more

## 📁 Project Structure

```
tryyy/
├── src/                    # Source code (bundled by Rollup)
│   ├── manifest.json       # Extension manifest
│   ├── assets/             # Icons and images
│   ├── background/         # Background scripts
│   ├── content/            # Content scripts
│   ├── components/         # UI components
│   ├── shared/             # Shared utilities
│   ├── popup.html/js       # Extension popup
│   ├── login.html/js       # Login page
│   └── register.html/js    # Registration page
├── dist/                   # Build output (generated)
├── builds/                 # Production zip files (generated)
└── rollup.config.js        # Rollup configuration
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

This will install:
- Rollup and required plugins
- Chrome extension plugin (reads manifest.json automatically)
- Terser (for minification/obfuscation)
- Copy plugin (for HTML/CSS/assets)
- All dependencies (~224 packages)

### 2. Development Mode

```bash
npm run dev
```

**What this does:**
- Creates a `dist/` folder with your bundled extension
- **Does NOT minify** code (easier for debugging)
- **Watches for changes** - automatically rebuilds when you edit files
- Includes auto-reload functionality for the extension

**To test:**
1. Open Chrome → Extensions → Enable "Developer mode"
2. Click "Load Unpacked"
3. Select the `dist/` folder
4. Extension will auto-reload when you save changes

### 3. Production Build

```bash
npm run build
```

**What this does:**
- Creates an optimized `dist/` folder
- **Minifies and obfuscates** all JavaScript
- Removes `console.log` and `debugger` statements
- Removes comments
- Mangles variable names
- Ready for Chrome Web Store submission

### 4. Create Release Package

```bash
npm run zip
```

**What this does:**
- Packages the `dist/` folder into a `.zip` file
- Saves to `builds/` directory
- Automatically names file with version number from `package.json`
- Example: `auto-engagement-linkedin-v1.3.4.zip`

**Note:** Run `npm run build` before creating the zip file.

## 📝 Workflow

### During Development
```bash
npm run dev
# Edit your code in src/
# Changes automatically rebuild
# Extension auto-reloads in Chrome
```

### Before Publishing
```bash
npm run build    # Create production build
npm run zip      # Package for Chrome Web Store
```

Then upload the `.zip` file from the `builds/` folder to the Chrome Web Store.

## 🔧 Configuration

### Adding New Files

The Rollup plugin automatically detects files referenced in `manifest.json`:
- Add new content scripts, background scripts, or web-accessible resources to `manifest.json`
- No need to modify `rollup.config.js`
- Rollup will automatically bundle them

### Customizing Build

Edit `rollup.config.js` to:
- Change compression settings
- Add/remove Terser options
- Modify output format
- Add custom plugins

## 📦 What Gets Bundled

The `rollup-plugin-chrome-extension` automatically processes:
- ✅ All JavaScript files referenced in `manifest.json`
- ✅ HTML files (popup, options, etc.)
- ✅ Assets (icons, images, CSS)
- ✅ Web-accessible resources
- ✅ Content scripts
- ✅ Background service worker

## ⚙️ Key Features

- **Zero config for new files** - Just add to `manifest.json`
- **Automatic asset copying** - Icons and resources are copied automatically
- **Safe minification** - Chrome Web Store compliant
- **Source maps** - Available in development mode
- **Fast rebuilds** - Watch mode for rapid development

## 🐛 Troubleshooting

**Extension doesn't load:**
- Check Chrome console for errors
- Ensure `npm run dev` or `npm run build` completed successfully
- Verify `dist/manifest.json` exists

**Changes not appearing:**
- In dev mode, files auto-reload
- Manually reload extension: Chrome → Extensions → Click reload icon
- Hard refresh: Remove and re-add the unpacked extension

**Build errors:**
- Check syntax errors in your source files
- Ensure all imports are valid
- Verify `manifest.json` is valid JSON

## 📄 License

Version: 1.3.6  
Author: Kommentify  
Website: https://kommentify.com  
Support: support@kommentify.com
