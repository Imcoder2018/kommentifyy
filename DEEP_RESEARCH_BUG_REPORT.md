# 🔍 Kommentify — Deep Research Bug & Issues Report

> **Generated:** 2026-02-24 | **Files Analyzed:** 60+ source files across all folders

---

## Table of Contents

1. [🔴 CRITICAL — Security Vulnerabilities](#1--critical--security-vulnerabilities)
2. [🟠 HIGH — Logic Bugs & Broken Behavior](#2--high--logic-bugs--broken-behavior)
3. [🟡 MEDIUM — Architecture & Code Quality](#3--medium--architecture--code-quality)
4. [🔵 LOW — Maintenance, Cleanup & Improvements](#4--low--maintenance-cleanup--improvements)
5. [📂 Per-File Issue Index](#5--per-file-issue-index)

---

## 1. 🔴 CRITICAL — Security Vulnerabilities

### 1.1 Hardcoded JWT Fallback Secrets
- **File:** `lib/auth.ts` (lines 4-5)
- **Bug:** `JWT_SECRET` and `JWT_REFRESH_SECRET` fall back to `'fallback-secret'` / `'fallback-refresh-secret'` if env vars are missing. If `.env` is misconfigured in production, every token is signed with a publicly known key.
- **Fix:** Throw an error at startup if secrets are missing instead of using defaults.

### 1.2 Wildcard CORS — All Origins Allowed
- **File:** `next.config.js` (line 15)
- **Bug:** `Access-Control-Allow-Origin: *` allows ANY website/extension to call your API, including malicious third parties. The comment says "Replace this with your extension ID in production" but it was never done.
- **Fix:** Restrict to your extension's Chrome ID and your own domains.

### 1.3 SQL Injection via String Interpolation in Vector Query Filter
- **File:** `app/api/ai/generate-post/route.ts` (line 89)
- **Bug:** `filter = \`userId = '${payload.userId}'\`` uses string interpolation to build a query filter. If `payload.userId` is ever tampered with, this is injectable.
- **Fix:** Use parameterized/escaped query building or validate the userId format strictly.

### 1.4 Hardcoded LinkedIn Client ID Leaked
- **File:** `lib/linkedin-service.ts` (line 6) & `.env.example` (line 15)
- **Bug:** The real LinkedIn Client ID `77zsxsh3ub3j4g` is hardcoded in source code AND committed to `.env.example`. This should come from env vars only.

### 1.5 Admin Fallback Auth Bypass
- **File:** `lib/adminAuth.ts` (lines 60-67)
- **Bug:** If the normal admin auth check fails, the code checks for a hardcoded `fallback-admin-id` with `role: 'admin'`. Anyone who crafts a JWT signed with the fallback secret (see 1.1) containing `userId: 'fallback-admin-id'` can access ALL admin routes.
- **Fix:** Remove the fallback admin bypass entirely.

### 1.6 Cron Job Auth Bypass When `CRON_SECRET` Is Unset
- **File:** `app/api/cron/check-trial-expiry/route.ts` (line 11)
- **Bug:** `if (cronSecret && ...)` — if `CRON_SECRET` is not set, the entire auth check is skipped and anyone can trigger the cron job at will.
- **Fix:** Return 401 if `CRON_SECRET` is not configured.

### 1.7 OpenAI API Key Prefix Logged to Console
- **File:** `app/api/ai/generate-topics/route.ts` (line 232)
- **Bug:** `console.log('OpenAI API Key prefix:', process.env.OPENAI_API_KEY?.substring(0, 7));` leaks the API key prefix in Vercel logs.
- **Fix:** Remove this log statement entirely.

### 1.8 Sensitive DB Connection Info Logged
- **File:** `app/api/auth/register/route.ts` (lines 36-47)
- **Bug:** DATABASE_URL schema, host, and connection details are logged on every registration request. In production (Vercel), these appear in logs.
- **Fix:** Remove all `DEBUG:` logging of database URLs.

### 1.9 Google Verification Placeholder
- **File:** `app/layout.tsx` (line 64)
- **Bug:** `google: 'your-google-verification-code'` — a placeholder left in production code. Not a security risk but could signal to Google that the site is misconfigured.

---

## 2. 🟠 HIGH — Logic Bugs & Broken Behavior

### 2.1 Comment Retry Logic Doesn't Switch Model
- **File:** `app/api/ai/generate-comment/route.ts` (lines 310-371)
- **Bug:** When AI returns empty content, the code logs `'🔄 Retrying with fallback model: ...'` but never actually changes `selectedModel`. The second attempt uses the same failing model.
- **Fix:** Set `selectedModel = fallbackModel` before `continue`.

### 2.2 Token Usage Code Is Unreachable
- **File:** `app/api/ai/generate-comment/route.ts` (lines 341-353)
- **Bug:** The `tokenUsage` extraction block comes AFTER `break` on line 338. If the content is valid, execution breaks out of the loop and this code never runs.
- **Fix:** Move the `tokenUsage` extraction block before the `break` statement.

### 2.3 `generate-topics` Bypasses Unified AI Service
- **File:** `app/api/ai/generate-topics/route.ts`
- **Bug:** This route directly uses the OpenAI SDK (`new OpenAI(...)`) with hardcoded model `gpt-3.5-turbo` (lines 237-238), completely ignoring the unified `ai-service.ts` routing, user model selection, and usage tracking infrastructure.
- **Fix:** Refactor to use `generateContent()` from `ai-service.ts` with `getUserModel(userId, 'topic')`.

### 2.4 `autoLike: true` Hardcoded For All Plans
- **File:** `app/api/auth/validate/route.ts` (line 44)
- **Bug:** `autoLike: true` is always returned regardless of the user's actual plan features. This defeats the purpose of plan-based feature gating.
- **Fix:** Derive from the actual plan settings.

### 2.5 `User` Interface Mismatches Prisma Schema
- **File:** `lib/user-service.ts` (lines 14-25)
- **Bug:** The `User` interface has `dailyComments`, `dailyLikes`, `aiPostsPerDay`, etc., but the Prisma schema uses `monthlyComments`, `monthlyLikes`, `aiPostsPerMonth`. The interface is completely stale.
- **Fix:** Update the interface to match the current schema or just use Prisma's generated types directly.

### 2.6 Fallback Comments Violate "Banned Words" Rules
- **File:** `app/api/ai/generate-comment/route.ts` (lines 361-368)
- **Bug:** Fallback comments include banned phrases like "resonates", "Great insights!", "Appreciate you", which contradict the AI prompt's banned-words rules defined in `openai-config.ts`.
- **Fix:** Rewrite fallback comments to comply with the same banned-words list.

### 2.7 `openai-config.ts` Fallback Comments Also Violate Rules
- **File:** `lib/openai-config.ts` (lines 573-584)
- **Bug:** `getFallbackComment()` returns "Great insights! Thanks for sharing this." — a response explicitly listed as a banned generic opener in the prompt system.

### 2.8 `validateModelId` Always Returns `true`
- **File:** `lib/openrouter-service.ts` (line 112)
- **Bug:** `return true; // Always return true` — the validation function checks patterns, logs warnings, but ALWAYS returns true, making the entire validation dead code.

### 2.9 Error Details Leaked to Non-Dev Users
- **File:** `app/api/ai/generate-topics/route.ts` (line 348)
- **Bug:** `hasOpenAIKey: !!process.env.OPENAI_API_KEY` is included in error responses visible to all users, exposing infrastructure configuration status.

### 2.10 Checkout Session Missing Auth Verification
- **File:** `app/api/checkout/create-session/route.ts`
- **Bug:** No authentication check is performed. Anyone can create checkout sessions by providing arbitrary `planId` values and `userEmail` addresses without being logged in.

---

## 3. 🟡 MEDIUM — Architecture & Code Quality

### 3.1 Duplicate PrismaClient Instantiation
- **File:** `lib/ai-service.ts` (line 12)
- **Bug:** `const prisma = new PrismaClient();` creates a NEW client, bypassing the singleton in `lib/prisma.ts`. In development with hot-reloading, this can cause connection pool exhaustion.
- **Fix:** Import from `@/lib/prisma` instead.

### 3.2 Duplicate `extractToken` Function
- **Files:** `lib/auth.ts` (line 37) and `lib/adminAuth.ts` (line 7)
- **Bug:** Identical `extractToken()` function defined in two files. Code duplication that can drift.
- **Fix:** Remove from `adminAuth.ts` and import from `auth.ts`.

### 3.3 Deprecated `.substr()` Usage
- **File:** `lib/user-service.ts` (line 65)
- **Bug:** `Math.random().toString(36).substr(2, 9)` uses the deprecated `.substr()` method.
- **Fix:** Replace with `.substring(2, 11)`.

### 3.4 Excessive `as any` Type Casts (~30+ occurrences)
- **Files:** Throughout `lib/limit-service.ts`, `lib/user-service.ts`, `app/api/ai/generate-comment/route.ts`, `app/api/auth/validate/route.ts`, `app/api/ai/generate-post/route.ts`, etc.
- **Bug:** Pervasive use of `as any` to bypass TypeScript type checking, hiding potential runtime type errors. Many of these access Prisma model fields that may not exist.
- **Fix:** Use Prisma-generated types and proper interfaces.

### 3.5 Excessive Debug Logging in Production
- **Files:** Nearly all API routes
- **Bug:** Full AI prompts (potentially 5000+ chars) are logged to Vercel console on every request (e.g., `generate-comment/route.ts` lines 283-302, `generate-post/route.ts` lines 223-245). This incurs significant log volume and cost.
- **Fix:** Gate behind `NODE_ENV === 'development'` or use configurable log levels.

### 3.6 `new Stripe()` Instantiated Per Request
- **Files:** `app/api/webhooks/stripe/route.ts`, `app/api/checkout/create-session/route.ts`
- **Bug:** `getStripe()` creates a new Stripe instance on every API call. While functional, it's wasteful.
- **Fix:** Use a module-level singleton similar to the Prisma pattern.

### 3.7 `referralCode` in Register Has No Collision Guard
- **File:** `app/api/auth/register/route.ts` (line 16-23)
- **Bug:** `generateReferralCode()` creates a random code but never checks if it already exists in the database, risking unique constraint violations.
- **Fix:** Add a retry loop with uniqueness check.

### 3.8 Refresh Token Completely Ignored
- **File:** `app/api/auth/refresh/route.ts`
- **Bug:** The refresh endpoint accepts the ACCESS token (not the refresh token) in the Authorization header and re-signs it. The `generateRefreshToken()` / `verifyRefreshToken()` functions in `auth.ts` are never used anywhere else.
- **Fix:** Implement proper refresh token flow using the refresh token.

### 3.9 Inconsistent Error Messages ("Daily" vs "Monthly")  
- **Files:** `app/api/ai/generate-post/route.ts` (line 62), `app/api/ai/generate-topics/route.ts` (line 63)
- **Bug:** Error messages say "Daily AI post limit reached" and "Daily AI topic generation limit reached", but the actual limits are monthly (per the Prisma schema and `limit-service.ts`).
- **Fix:** Change to "Monthly limit reached".

### 3.10 Backup/Old Files in Production Build
- **Files:** `app/page.tsx.backup`, `app/page.tsx.old`
- **Bug:** These backup/old files are included in the project and may be pulled into the build or confuse developers.
- **Fix:** Delete or move to a separate archive.

---

## 4. 🔵 LOW — Maintenance, Cleanup & Improvements

### 4.1 Massive Landing Page File
- **File:** `app/page.tsx` — **156,061 bytes** (~4000+ lines)
- **Issue:** One of the largest single-file React components. Hard to maintain, test, or review.
- **Fix:** Split into smaller components.

### 4.2 Orphaned Test/Fix Scripts at Root Level
- **Files:** 20+ files like `check_users.js`, `create_admin.js`, `debug_ai_issue.js`, `fix-plans.js`, `test_admin_api.js`, `simulate_registration.js`, etc.
- **Issue:** Test/debug scripts with hardcoded credentials/URLs scattered in the project root. Should be in a `scripts/` or `tests/` directory and gitignored.

### 4.3 `.env` Files Not Properly Gitignored
- **Files:** `.env`, `.env.local`, `.env.production`, `.env.production.local`, `.env.vercel.check`
- **Issue:** Multiple env files exist in the project. Ensure they are all listed in `.gitignore` to prevent secrets from being committed.

### 4.4 Stale Documentation Files
- **Files:** 20+ markdown files at root level (`ALL_FIXES_COMPLETE.md`, `BUGS_AND_ANALYSIS.md`, `DEPLOYMENT_SUCCESS.md`, etc.)
- **Issue:** Many docs are stale/historical. They clutter the project root and may confuse new developers.
- **Fix:** Move to a `docs/archive/` directory.

### 4.5 `email-service.ts` Missing/Empty
- **File:** `lib/email-service.ts`
- **Issue:** This file exists (listed in directory) but may be empty or a stub. Check if it's needed.

### 4.6 Database Files in Prisma Folder
- **Files:** `prisma/dev.db`, `prisma/prod.db`
- **Issue:** SQLite database files committed to the project (even though PostgreSQL is used). These are likely leftover from development.
- **Fix:** Delete and add `*.db` to `.gitignore`.

### 4.7 `email-service.zip` in lib/
- **File:** `lib/email-service.zip`
- **Issue:** A zip file inside the lib directory. Should not be in source control.

### 4.8 `check.zip`, `tabs.zip` in Source Directories
- **Files:** Root `check.zip`, `app/components/tabs.zip`
- **Issue:** Zip archives in source directories should be removed.

### 4.9 Hardcoded Developer Emails
- **Files:** `app/api/ai/generate-comment/route.ts` (line 10), `app/api/ai/generate-post/route.ts` (line 11)
- **Issue:** `DEVELOPER_EMAILS` array with real email addresses hardcoded. Should be configurable via env vars or database.

### 4.10 `scripts-deploy/` Contains 70+ Batch Files
- **Directory:** `scripts-deploy/` (74 `.bat` files)
- **Issue:** A massive collection of Windows batch files for git operations. These are utility scripts unrelated to the main application and bloat the repo.

### 4.11 No Rate Limiting on Auth Endpoints
- **Files:** `app/api/auth/login/route.ts`, `app/api/auth/register/route.ts`, `app/api/admin/login/route.ts`
- **Issue:** No rate limiting on login/registration endpoints. Vulnerable to brute-force attacks.
- **Fix:** Implement rate limiting (e.g., via Vercel Edge Functions or middleware).

### 4.12 Access Token Expires in 90 Days (Too Long)
- **File:** `lib/auth.ts` (line 14)
- **Issue:** `expiresIn: '90d'` for access tokens is extremely long. And refresh tokens expire in `30d` — shorter than the access token, which makes no sense.
- **Fix:** Access tokens should be short-lived (1-24h), refresh tokens long-lived (30-90d).

### 4.13 Structured Data Claims "500 ratings" with "5.0" Average
- **File:** `app/layout.tsx` (lines 144-150)
- **Issue:** `ratingCount: '500'` with `ratingValue: '5.0'` looks fake and may violate Google's structured data guidelines, leading to penalties.

---

## 5. 📂 Per-File Issue Index

| File | Issues | Severity |
|------|--------|----------|
| `lib/auth.ts` | Hardcoded fallback secrets, token expiry mismatch | 🔴 Critical |
| `lib/adminAuth.ts` | Fallback admin bypass, duplicate `extractToken` | 🔴 Critical |
| `lib/ai-service.ts` | Duplicate PrismaClient (bypasses singleton) | 🟡 Medium |
| `lib/openai-service.ts` | No issues found | ✅ Clean |
| `lib/openrouter-service.ts` | `validateModelId` always returns true | 🟠 High |
| `lib/user-service.ts` | Stale `User` interface, deprecated `.substr()`, `as any` | 🟡 Medium |
| `lib/limit-service.ts` | Heavy `as any` usage | 🟡 Medium |
| `lib/linkedin-service.ts` | Hardcoded LinkedIn Client ID | 🔴 Critical |
| `lib/linkedin-formatter.ts` | No issues found | ✅ Clean |
| `lib/linkedin-url-cleaner.ts` | No issues found | ✅ Clean |
| `lib/openai-config.ts` | Fallback comments violate banned-words rules | 🟠 High |
| `lib/prisma.ts` | No issues found | ✅ Clean |
| `next.config.js` | Wildcard CORS (`*`) | 🔴 Critical |
| `middleware.ts` | No issues found | ✅ Clean |
| `app/layout.tsx` | Google verification placeholder, fake aggregate rating | 🔵 Low |
| `app/page.tsx` | 156KB single file, unmaintainable | 🔵 Low |
| `app/api/auth/login/route.ts` | No rate limiting | 🔵 Low |
| `app/api/auth/register/route.ts` | DB URL logged, referral code collision risk | 🔴🟡 Critical+Medium |
| `app/api/auth/validate/route.ts` | `autoLike: true` hardcoded, `as any` casts | 🟠 High |
| `app/api/auth/refresh/route.ts` | Refresh token not used properly | 🟡 Medium |
| `app/api/ai/generate-comment/route.ts` | Retry doesn't switch model, unreachable token code, banned fallbacks | 🟠 High |
| `app/api/ai/generate-post/route.ts` | SQL injection in vector filter, "daily" vs "monthly" mismatch | 🔴🟡 Critical+Medium |
| `app/api/ai/generate-topics/route.ts` | Bypasses AI service, logs API key prefix, leaks config in errors | 🔴🟠 Critical+High |
| `app/api/webhooks/stripe/route.ts` | New Stripe per request (minor) | 🔵 Low |
| `app/api/admin/login/route.ts` | No rate limiting | 🔵 Low |
| `app/api/cron/check-trial-expiry/route.ts` | Auth bypass when `CRON_SECRET` unset | 🔴 Critical |
| `app/api/checkout/create-session/route.ts` | No auth verification on checkout | 🟠 High |
| `prisma/schema.prisma` | No issues found (well-structured) | ✅ Clean |
| `.env.example` | Real LinkedIn Client ID committed | 🔴 Critical |
| Root dir | 20+ orphaned test scripts, stale docs, zip files | 🔵 Low |

---

## Summary Statistics

| Severity | Count |
|----------|-------|
| 🔴 Critical (Security) | 9 |
| 🟠 High (Logic Bugs) | 10 |
| 🟡 Medium (Architecture) | 10 |
| 🔵 Low (Cleanup) | 13 |
| **Total** | **42** |

---

> **Recommendation:** Address all 🔴 Critical security issues immediately before any public deployment or production use.
