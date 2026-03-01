# Kommentify Extension - Task Reference

## Overview

The kommentify-extension is a Chrome extension that acts as a sophisticated LinkedIn automation tool. It receives commands both directly from the website dashboard and via background polling of the backend API.

---

## Communication Protocols

### 1. Chrome Message Passing
- `chrome.runtime.sendMessage` / `chrome.runtime.onMessage.addListener` - Primary communication between popup/UI and background script

### 2. Content Script Bridge
- `src/content/bridge.js` - Uses DOM elements for cross-world communication between isolated content scripts and main world

### 3. Website Command Polling
- Polls the backend API (`/api/extension/command`) every 30 seconds via alarm-based poller

### 4. Auth Bridge
- `src/content/authBridge.js` - Handles authentication state and command polling from content scripts

---

## Task Types from Website (via pollWebsiteCommands)

The extension polls for commands from the website at `GET /api/extension/command`. Here are all the command types:

| Command | Description |
|---------|-------------|
| `post_to_linkedin` | Posts content to LinkedIn from the website dashboard |
| `scrape_profile` | Scrapes a LinkedIn profile for data |
| `scrape_feed_now` | Scrapes the current LinkedIn feed |
| `scrape_comments` | Scrapes comments from a profile |
| `post_via_voyager` | Posts content using Voyager API |
| `start_bulk_commenting` | Starts bulk commenting automation |
| `start_import_automation` | Starts import automation |
| `scan_my_linkedin_profile` | Scans the user's own LinkedIn profile |
| `AI_PROFILE_RECAPTURE` | AI profile recapture task |
| `post_scheduled_content` | Posts scheduled content |
| `linkedin_post_via_api` | Posts to LinkedIn via API |
| `linkedin_schedule_via_api` | Schedules a post via LinkedIn API |
| `linkedin_delete_post` | Deletes a LinkedIn post |
| `linkedin_get_feed_api` | Gets LinkedIn feed via API |
| `linkedin_search_posts_api` | Searches posts via LinkedIn API |
| `linkedin_get_trending_api` | Gets trending content via LinkedIn API |
| `linkedin_follow_profile` | Follows a LinkedIn profile |
| `linkedin_like_post` | Likes a LinkedIn post |
| `linkedin_comment_on_post` | Comments on a LinkedIn post |
| `linkedin_batch_engage` | Batch engagement on posts |
| `fetch_lead_posts` | Fetches posts from a lead |
| `fetch_lead_posts_bulk` | Bulk fetches lead posts |
| `engage_lead_post` | Engages with a lead's post |
| `process_pending_tasks` | Processes pending warm lead tasks |

---

## Direct Message Actions (from Popup/UI to Background)

### System & Health Checks

| Action | Description |
|--------|-------------|
| `ping` | Tests if service worker is active |
| `checkForUpdates` | Checks for extension updates |
| `getStoredUpdateInfo` | Gets stored update information |
| `openDownloadPage` | Opens the download page for updates |
| `clearUpdateInfo` | Clears stored update info after user updates |
| `syncAnalytics` | Forces analytics sync to backend |
| `getProcessingState` | Checks if any automation is currently running |
| `getConsoleLogs` | Gets console logs for diagnostics |

### Lead Warmer Tasks

| Action | Description |
|--------|-------------|
| `leadWarmer_fetchProfiles` | Fetches profiles for lead warming |
| `leadWarmer_executeTouch` | Executes a touch action (follow/like/comment/connect) on a lead |
| `leadWarmer_stop` | Stops the lead warmer automation |

### AI & Content Generation

| Action | Description |
|--------|-------------|
| `generateAIComment` | Generates an AI comment for a LinkedIn post |
| `generateCommentFromContent` | Generates a comment based on post content |
| `generateKeywords` | Generates keywords using AI |
| `generateWithOpenAI` | General AI generation with OpenAI |
| `generateTopicLines` | Generates topic lines for posts |
| `generatePost` | Generates a full post using AI |
| `generateTrendingPost` | Generates a trending post |
| `scrapeProfilePosts` | Scrapes posts from a LinkedIn profile for inspiration |
| `saveScrapedPosts` | Saves scraped posts to the database |

### LinkedIn Actions

| Action | Description |
|--------|-------------|
| `postToLinkedIn` | Posts content to LinkedIn |
| `GET_PROFILE_DATA` | Gets LinkedIn profile data |

### Scheduling & Automation Control

| Action | Description |
|--------|-------------|
| `startPeopleSearch` | Starts people search automation |
| `stopPeopleSearch` | Stops people search automation |
| `stopBulkProcessing` | Stops bulk processing automation |
| `stopAllTasks` | Stops all running tasks |
| `checkBulkProcessingState` | Checks if bulk processing is active |
| `checkPeopleSearchState` | Checks if people search is active |

### Scheduler Management

| Action | Description |
|--------|-------------|
| `addBulkSchedule` | Adds a bulk processing schedule |
| `removeBulkSchedule` | Removes a bulk processing schedule |
| `setBulkSchedulerEnabled` | Enables/disables bulk scheduler |
| `getBulkSchedulerStatus` | Gets bulk scheduler status |
| `getBulkSchedulerCountdown` | Gets countdown to next bulk schedule |
| `addPeopleSchedule` | Adds a people search schedule |
| `removePeopleSchedule` | Removes a people search schedule |
| `setPeopleSchedulerEnabled` | Enables/disables people scheduler |
| `getPeopleSchedulerStatus` | Gets people scheduler status |
| `getPeopleSchedulerCountdown` | Gets countdown to next people schedule |
| `getImportSchedulerStatus` | Gets import scheduler status |
| `reloadImportScheduler` | Reloads the import scheduler |
| `setImportSchedulerEnabled` | Enables/disables import scheduler |
| `setImportProfilesPerDay` | Sets profiles per day for import |
| `addImportSchedule` | Adds an import schedule |
| `removeImportSchedule` | Removes an import schedule |
| `updateDailySchedule` | Updates daily posting schedule |

### Import Automation

| Action | Description |
|--------|-------------|
| `startImportConnections` | Starts importing connections |
| `startImportEngagement` | Starts import for post engagement |
| `startImportCombined` | Starts combined import |
| `getImportStatus` | Gets import automation status |
| `stopImportAutomation` | Stops import automation |
| `postMissedPosts` | Posts missed scheduled posts |
| `rescheduleMissedPosts` | Reschedules missed posts |

### Post Management

| Action | Description |
|--------|-------------|
| `getScheduledPosts` | Gets scheduled posts |
| `saveDraft` | Saves a draft post |
| `getDrafts` | Gets saved drafts |
| `getFeedSchedule` | Gets feed schedule |

### Business Hours & Limits

| Action | Description |
|--------|-------------|
| `getBusinessHoursStatus` | Gets business hours status |
| `updateBusinessHours` | Updates business hours settings |
| `getDailyPostStatus` | Gets daily post status |
| `checkDailyLimit` | Checks daily action limits |
| `incrementDailyCount` | Increments daily action count |

### Settings & Configuration

| Action | Description |
|--------|-------------|
| `getCommentSettings` | Gets comment settings |
| `getProgressAnalytics` | Gets progress analytics data |

### Authentication

| Action | Description |
|--------|-------------|
| `authComplete` | Notifies extension that authentication is complete |
| `pollWebsiteCommands` | Polls for commands from the website |

### Voyager & Data Sync

| Action | Description |
|--------|-------------|
| `VOYAGER_SYNC` | Syncs Voyager data (LinkedIn profile data) |

### Progress & Logging

| Action | Description |
|--------|-------------|
| `automationProgress` | Gets automation progress updates |
| `getSchedulerLogs` | Gets scheduler logs |

---

## Content Script Actions (from LinkedIn Page to Background)

These actions are sent from content scripts running on LinkedIn pages:

| Action | Description |
|--------|-------------|
| `generateAIComment` | Generate AI comment from the "AI Comment" button on posts |
| `checkDailyLimit` | Check if daily limit is reached before commenting |
| `getCommentSettings` | Get comment settings from storage |
| `incrementDailyCount` | Increment the daily comment count |
| `generateCommentFromContent` | Generate a comment based on post content |

---

## Key Files for Message Handling

| File | Purpose |
|------|---------|
| `src/background/index.js` | Main service worker with all message handlers |
| `src/shared/utils/messageHandler.js` | Safe message sending utilities with timeout/retry |
| `src/content/bridge.js` | Content script bridge for DOM-based communication |
| `src/content/authBridge.js` | Authentication bridge and command polling from LinkedIn |
| `src/content/aiCommentButton.js` | AI comment button in LinkedIn posts |
