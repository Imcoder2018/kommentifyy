# 🛠️ Development Mode Guide

## ✅ Syntax Error FIXED!

**Issue:** `Uncaught SyntaxError: Unexpected token '/'` at line 2  
**Cause:** `simpleReloader()` plugin was corrupting imports  
**Fix:** Disabled simpleReloader in rollup.config.js  

---

## 🚀 How to Use Dev Mode

### Option 1: Development Mode (Recommended for Testing)

```bash
npm run dev
```

**What This Does:**
- ✅ Builds extension in **watch mode**
- ✅ **Non-minified** code (easier to debug)
- ✅ **Keeps console.log** statements
- ✅ Auto-rebuilds when you change source files
- ❌ Does NOT auto-reload extension (you must manually reload)

**Steps:**
1. Run `npm run dev` in terminal
2. Leave it running
3. Make changes to your code
4. Wait for rebuild (you'll see "created dist in X seconds")
5. Go to `chrome://extensions/`
6. Click reload button (🔄) on your extension
7. Test your changes

---

### Option 2: Production Build

```bash
npm run build
```

**What This Does:**
- ✅ One-time build
- ✅ **Minified** code (smaller file size)
- ✅ **Removes console.log** statements
- ✅ Optimized for production

---

## 📊 Checking Logs

### 1. Service Worker Console (Main Background Logs)

**How to Open:**
1. Go to: `chrome://extensions/`
2. Find your extension
3. Click: **"service worker"** link (in blue)
4. This opens a DevTools window

**What You'll See:**
```
BACKGROUND: Starting clean service worker...
BACKGROUND: Extension initialized
PEOPLE SEARCH: Search tab opened
✅ QUALIFIED PROFILE: John Doe
🔗 Opening direct invite URL
🔗 SCRIPT: Found send button
✅ Connection request sent successfully
```

**Tips:**
- This is where ALL background script logs appear
- Leave this window open while testing
- Logs will show automation progress in real-time
- Errors will appear in red

---

### 2. Content Script Console (LinkedIn Page Logs)

**How to Open:**
1. Go to LinkedIn page
2. Press **F12** (or right-click → Inspect)
3. Click **Console** tab

**What You'll See:**
```
🤖 AUTO-ENGAGEMENT: People search automation activated
   Looking for selector: [data-view-name="people-search-result"]
   Found 10 profile cards on this page
```

**Tips:**
- This shows scripts running ON the LinkedIn page
- Different from service worker console
- Shows DOM manipulation logs

---

### 3. Popup Console (Extension Popup Logs)

**How to Open:**
1. Click extension icon to open popup
2. Right-click on the popup window
3. Click "Inspect"
4. This opens DevTools for the popup

**What You'll See:**
```
UI: Initializing...
UI: Networking tab loaded
UI: Event listeners attached
```

---

## 🔍 Development Workflow

### Recommended Workflow:

```
1. Run Dev Mode:
   npm run dev
   (Leave this running in terminal)

2. Open Service Worker Console:
   chrome://extensions/ → "service worker"
   (Leave this window open)

3. Make Code Changes:
   Edit files in src/
   
4. Wait for Auto-Rebuild:
   Terminal shows: "created dist in X seconds"
   
5. Reload Extension:
   chrome://extensions/ → Click reload (🔄)
   
6. Test & Check Logs:
   Service worker console shows all activity
   
7. Repeat steps 3-6
```

---

## ⚡ Quick Testing Checklist

**Before Testing:**
- [ ] `npm run dev` is running
- [ ] Service worker console is open
- [ ] Extension is loaded in Chrome

**When Testing Networking:**
- [ ] Service worker console open
- [ ] Small test (2-3 connections only)
- [ ] Watch console for errors
- [ ] Check LinkedIn for sent connections

**If Something Breaks:**
- [ ] Check service worker console for errors
- [ ] Check LinkedIn page console (F12)
- [ ] Rebuild: Stop dev mode, run `npm run build`
- [ ] Reload extension

---

## 🐛 Common Issues & Solutions

### Issue 1: "Service worker unavailable"
**Solution:**
```
1. chrome://extensions/
2. Click "Remove" on your extension
3. Click "Load unpacked"
4. Select the dist/ folder
```

### Issue 2: "Changes not showing up"
**Solution:**
```
1. Make sure npm run dev rebuilt (check terminal)
2. Click reload button on extension
3. Close and reopen popup
4. Refresh LinkedIn page if testing content scripts
```

### Issue 3: "Console logs not showing"
**In Development Mode:**
- console.log WILL show (not removed)

**In Production Mode:**
- console.log REMOVED (for performance)
- Use `npm run dev` to keep logs

### Issue 4: "Extension crashes"
**Solution:**
```
1. Check service worker console for error
2. Copy error message
3. Run: npm run build
4. Reload extension
5. If still crashes, share error message
```

---

## 📝 Build Modes Comparison

| Feature | Dev Mode (`npm run dev`) | Production (`npm run build`) |
|---------|-------------------------|------------------------------|
| **Minified** | ❌ No (readable code) | ✅ Yes (compressed) |
| **console.log** | ✅ Kept | ❌ Removed |
| **Watch Mode** | ✅ Auto-rebuilds | ❌ One-time build |
| **Auto-reload** | ❌ Manual reload needed | ❌ Manual reload needed |
| **File Size** | Larger | Smaller |
| **Use For** | Development/Testing | Production deployment |

---

## 🎯 Your Current Setup

**Status:**
- ✅ Syntax error fixed
- ✅ Build working correctly
- ✅ Extension matches original
- ✅ Dev mode ready

**Build Configuration:**
```javascript
// rollup.config.js
- simpleReloader: DISABLED (was causing syntax errors)
- terser: Enabled ONLY in production
- console.log: Kept in dev mode, removed in production
```

---

## 💡 Pro Tips

**Tip 1: Use Dev Mode for Testing**
```bash
npm run dev
# Better for debugging - keeps all logs
```

**Tip 2: Keep Service Worker Console Open**
```
chrome://extensions/ → "service worker"
# Shows real-time logs during automation
```

**Tip 3: Test Small First**
```
Start with 2-3 connections
Verify it works before scaling up
```

**Tip 4: Watch Terminal**
```
Terminal shows when rebuild completes:
"created dist in 2.3s"
Then you can reload extension
```

**Tip 5: Check Both Consoles**
```
Service Worker Console = Background logic
LinkedIn Page Console = DOM/scraping
Both are important for debugging
```

---

## 🚀 Start Testing Now

**Quick Start:**

```bash
# 1. Start dev mode
npm run dev

# 2. In another terminal or just leave it running
# Then reload extension in Chrome

# 3. Open service worker console
# chrome://extensions/ → "service worker"

# 4. Test with small number
# Extension → Networking → 2 connections

# 5. Watch logs in real-time!
```

---

## 📋 Troubleshooting Checklist

**If logs aren't showing:**
- [ ] Using `npm run dev` (not `npm run build`)
- [ ] Service worker console is open
- [ ] Extension was reloaded after rebuild
- [ ] Looking at correct console (service worker, not page)

**If extension doesn't work:**
- [ ] Build completed successfully (check terminal)
- [ ] Extension reloaded (🔄 button clicked)
- [ ] No errors in service worker console
- [ ] Chrome version is up to date

**If automation fails:**
- [ ] LinkedIn is logged in
- [ ] Network connection is stable
- [ ] Service worker console shows detailed errors
- [ ] Try rebuilding: `npm run build`

---

## 🎊 Summary

**What Was Fixed:**
- ✅ Syntax error in built file
- ✅ simpleReloader causing import corruption
- ✅ Disabled problematic plugin

**What You Can Do Now:**
- ✅ Run `npm run dev` for development
- ✅ Run `npm run build` for production
- ✅ See all console.log statements in dev mode
- ✅ Check logs in service worker console
- ✅ Test and debug your extension

**How to Check Logs:**
1. `chrome://extensions/` → "service worker" = Main logs
2. F12 on LinkedIn page = Content script logs
3. Inspect popup = Popup UI logs

---

**Your extension is ready for development! Start with `npm run dev` and test away!** 🚀
