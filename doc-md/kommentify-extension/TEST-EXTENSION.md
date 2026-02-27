# 🧪 Extension Testing Guide

## Quick Test Steps

### 1. Load the Extension

```bash
# Make sure you have the latest build
npm run build
```

Then in Chrome:
1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist/` folder from this project
5. ✅ Extension should load without errors

### 2. Verify No Errors

Open Chrome DevTools:
- Right-click anywhere → "Inspect"
- Go to "Console" tab
- Look for errors (should be NONE)

Check for these specific errors (should NOT appear):
- ❌ `Uncaught SyntaxError: Cannot use import statement outside a module`
- ❌ `Failed to load resource`
- ❌ `manifest.json: file not found`

### 3. Test the Login Flow

1. Click the extension icon in Chrome toolbar
2. Should see one of:
   - **Login page** (if not logged in)
   - **Main popup** (if already logged in)

**If you see login page:**
- Form should display correctly
- Email and password fields should work
- "Login" button should be clickable
- No console errors

### 4. Test Navigation

From login page:
- Click "Don't have an account? Register" link
- Should navigate to `register.html`
- Registration form should display
- No console errors

### 5. Test Main Popup

After logging in:
- Popup should display all tabs
- UI should load completely
- Check console - should see:
  ```
  === INITIALIZING POPUP ===
  Chrome storage available: true
  ```
- No error messages

### 6. Background Service Worker

Check background script:
1. Go to `chrome://extensions/`
2. Find your extension
3. Click "Service Worker" link (under "Inspect views")
4. Console should open
5. Should see initialization logs
6. No errors

## Common Issues & Solutions

### Issue: "Cannot use import statement outside a module"
**Status:** ✅ FIXED
- This was caused by dynamic script loading without module type
- Now resolved in the latest build

### Issue: "login.html not found"
**Status:** ✅ FIXED
- Login/register files are now copied to dist folder
- Rollup config updated with copy plugin

### Issue: Extension icon is grayed out
**Possible cause:** Extension not active on current page
**Solution:** 
- LinkedIn extension only works on linkedin.com pages
- Icon should be blue on LinkedIn, gray elsewhere

### Issue: Popup shows blank screen
**Check:**
1. Open DevTools on popup (right-click popup → Inspect)
2. Look for JavaScript errors
3. Check if `main.js` loaded successfully
4. Verify `popup.html` references correct script path

## Development Testing

### Watch Mode Testing
```bash
npm run dev
```
- Makes changes faster
- Auto-rebuilds on file save
- Extension auto-reloads (if using simpleReloader)

**To test:**
1. Start watch mode: `npm run dev`
2. Make a small change in `src/`
3. Save the file
4. Extension should rebuild automatically
5. Reload extension in Chrome if needed

### Production Testing
```bash
npm run build
```
- Tests minified version
- Closer to what users will get
- Verifies Terser doesn't break anything

## File Verification

Ensure these files exist in `dist/` after build:

**HTML Pages:**
- [ ] `popup.html`
- [ ] `login.html`
- [ ] `register.html`

**JavaScript Files:**
- [ ] `login.js`
- [ ] `register.js`
- [ ] `background/index.js`
- [ ] `components/js/main.js`
- [ ] `content/*.js`
- [ ] `shared/**/*.js`

**Assets:**
- [ ] `popup.css`
- [ ] `manifest.json`
- [ ] `assets/icons/*.png`

## Manual Testing Checklist

### Core Functionality
- [ ] Extension loads without errors
- [ ] Login page displays and works
- [ ] Register page displays and works
- [ ] Popup displays after login
- [ ] All tabs in popup work
- [ ] Background worker starts
- [ ] Content scripts inject on LinkedIn

### UI/UX
- [ ] Loading animation shows
- [ ] Forms are styled correctly
- [ ] Buttons are clickable
- [ ] Navigation works
- [ ] Icons display properly
- [ ] Colors and fonts correct

### Error Handling
- [ ] No console errors on load
- [ ] No manifest errors
- [ ] No import/module errors
- [ ] No network errors (except API calls)
- [ ] Error messages display when appropriate

## Quick Smoke Test

Run this after any changes:

```bash
# 1. Clean build
npm run build

# 2. Check for errors in output
# Should say "created dist in X.Xs" at the end

# 3. Verify files
ls dist/login.html dist/register.html dist/popup.html

# 4. Load in Chrome (manual step)
# 5. Click extension icon
# 6. Check console for errors
```

## Success Criteria

Extension is working correctly if:
1. ✅ Build completes without errors
2. ✅ All files present in `dist/`
3. ✅ Extension loads in Chrome without errors
4. ✅ Login page displays correctly
5. ✅ No "import statement" errors
6. ✅ Popup opens and works
7. ✅ Background worker initializes
8. ✅ Content scripts inject on LinkedIn

## Getting Help

If you encounter issues:
1. Check `FIXES-APPLIED.md` for known issues
2. Look at build output for errors
3. Check Chrome DevTools console
4. Verify all dependencies installed: `npm install`
5. Try clean rebuild: `rm -rf dist && npm run build`

## Notes

- Always test in **both** dev and production builds
- Test on actual LinkedIn pages, not just popup
- Clear Chrome's cache if seeing old versions
- Use Incognito mode for clean testing
- Check Service Worker logs separately from popup logs
