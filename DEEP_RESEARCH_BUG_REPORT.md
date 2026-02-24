# 🔍 DEEP RESEARCH BUG REPORT — Kommentify

> **Generated:** 2026-02-24  
> **Scope:** All script files, configuration, and source folders in the Kommentify project  
> **Files Analyzed:** 60+ source files across `lib/`, `app/api/`, `prisma/`, `app/components/`, root config files, and scripts  

---

## 📊 Summary Dashboard

| Severity | Count | Category |
|----------|-------|----------|
| 🔴 Critical | 7 | Security / Data-loss risks |
| 🟠 High | 11 | Bugs that will break features |
| 🟡 Medium | 13 | Code quality / reliability |
| 🔵 Low | 11 | Improvements / best practices |

---

## Table of Contents

1. [Root Configuration Files](#1-root-configuration-files)
2. [lib/ — Core Services](#2-lib--core-services)
3. [app/api/auth/ — Authentication Routes](#3-appapiauth--authentication-routes)
4. [app/api/webhooks/ — Webhook Handlers](#4-appapiwebhooks--webhook-handlers)
5. [app/api/ai/ — AI Generation Routes](#5-appapiapi--ai-generation-routes)
6. [app/api/cron/ — Cron Jobs](#6-appapicron--cron-jobs)
7. [prisma/ — Database Schema](#7-prisma--database-schema)
8. [app/ — Frontend & Layout](#8-app--frontend--layout)
9. [Root-level Scripts](#9-root-level-scripts)

---

## 1. Root Configuration Files

### `next.config.js`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 1 | 🔴 **Critical** | **CORS `Access-Control-Allow-Origin` header set to a comma-separated list of origins.** The HTTP spec requires exactly ONE origin or `*` per response. Browsers reject multi-value origins, so every cross-origin extension/API request from Chrome extensions will fail with a CORS error. The `allowedOrigins` variable is `'https://kommentify.com,chrome-extension://*'` — this is passed as a single header value and browsers will block it. **Fix:** Use dynamic origin checking in middleware or a custom headers function that returns a single matched origin per request. |
| 2 | 🟡 Medium | `chrome-extension://*` is a wildcard that allows any Chrome extension to call the API. Should be restricted to the specific extension ID for production security. |

### `middleware.ts`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 3 | 🟡 Medium | Clerk middleware runs on all API routes (including `/api/webhooks/stripe` and `/api/cron/*`). Webhook/cron endpoints do their own auth — Clerk middleware may interfere with non-browser requests that don't carry Clerk tokens. Consider excluding webhook and cron paths from the matcher. |

### `package.json`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 4 | 🔵 Low | Project name is `"linkedin-automation-api"` — doesn't match the product name "Kommentify". Minor branding issue. |
| 5 | 🟡 Medium | No `engines` field specified. Node.js version compatibility is not enforced, which can cause deployment issues. |

### `vercel.json`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 6 | � **Low** | **`vercel.json` only configures `/api/cron/check-trial-expiry`** (daily at midnight). The other cron jobs (`process-emails`, `scheduled-posts`) are managed externally via **cron-job.org** and run every ~1 minute. This is working correctly. **Note:** The `check-trial-expiry` cron in `vercel.json` is redundant since `process-emails` also runs `checkExpiredTrials()` every 10 minutes — consider removing the `vercel.json` entry to avoid running the same logic from two places. |

---

## 2. `lib/` — Core Services

### `lib/auth.ts`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 7 | 🔴 **Critical** | **JWT access token expiry is 90 days** (`expiresIn: '90d'`). Industry standard for access tokens is 15 minutes to 1 hour. A stolen access token is valid for 3 months. The refresh token is actually shorter-lived (30 days) than the access token, which defeats the purpose of refresh tokens entirely. **Fix:** Set access token to `'15m'` or `'1h'`, set refresh token to `'30d'` or `'90d'`. |
| 8 | 🟠 **High** | **Top-level `throw` statements** (`if (!process.env.JWT_SECRET) throw ...`). In a serverless environment, these execute at module-load time. If imported by _any_ route (even one that doesn't need JWT), a missing env var will crash the entire application. Should be deferred to runtime/function call. |

### `lib/adminAuth.ts`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 9 | 🟡 Medium | **Duplicate `extractToken` function.** This function is identical to the one in `lib/auth.ts`. Should import from `auth.ts` instead of redefining. |
| 10 | 🟡 Medium | `requireAdmin` uses `Function` type — should be properly typed with `NextRequest` handler signature. |
| 11 | 🟠 **High** | Auth failure returns HTTP 403 ("Forbidden") for both missing token AND invalid token. Should return 401 for missing/invalid tokens and 403 for insufficient permissions. |

### `lib/ai-service.ts`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 12 | 🟡 Medium | **Hardcoded fallback model** `'anthropic/claude-sonnet-4.5'` appears 3+ times. If this model is deprecated or renamed, all fallbacks break silently. Should be a single constant or configuration value. |
| 13 | 🟡 Medium | `generateLinkedInPost` throws `'Model not found'` if model isn't in DB, but `generateContent` silently falls back. Inconsistent error handling between functions in the same service. |

### `lib/openai-service.ts` & `lib/openrouter-service.ts`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 14 | 🟠 **High** | **Singleton pattern is unsafe in serverless.** `let openAIInstance: OpenAIService | null = null` — in Vercel serverless functions, each cold start creates a new instance, but warm invocations share the singleton. If `setApiKey()` is called for one user, it changes the API key for ALL concurrent requests until the instance is garbage collected. This is a **security and correctness bug**. **Fix:** Create new instances per request, or remove `setApiKey()`. |
| 15 | 🟡 Medium | In `openrouter-service.ts`, `validateModelId()` logs a warning but returns the boolean result which is never used by the caller (`chat()` calls it but ignores the return value). Dead code / misleading. |
| 16 | 🟡 Medium | Massive code duplication between `openai-service.ts` and `openrouter-service.ts` — the prompt templates for `generateLinkedInPost`, `generateLinkedInComment`, and `generateTopicIdeas` are copy-pasted. Changes in one won't propagate to the other. |

### `lib/linkedin-service.ts`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 17 | 🔴 **Critical** | **Top-level `throw` on missing env vars** (`if (!process.env.LINKEDIN_CLIENT_ID) throw ...`). This file is imported by `cron/scheduled-posts/route.ts`. If LinkedIn env vars are not set, the entire cron endpoint (including email processing, trial checks, etc.) fails to load. Every serverless invocation that touches this import chain crashes. **Fix:** Check env vars at runtime, not module load. |
| 18 | 🟠 **High** | **Using deprecated LinkedIn UGC Posts API** (`/v2/ugcPosts`). LinkedIn deprecated UGC Posts in 2023 and recommends the Posts API (`/rest/posts`). This may stop working at any time. |
| 19 | 🟡 Medium | `postWithVideoToLinkedIn` hardcodes `'Content-Type': 'video/mp4'` — doesn't handle other video formats (WebM, MOV). |
| 20 | 🟡 Medium | LinkedIn access tokens are stored in plain text in the database (`accessToken String @db.Text`). Should be encrypted at rest. |

### `lib/user-service.ts`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 21 | 🟠 **High** | **`User` interface has wrong field names.** The interface defines `dailyComments`, `dailyLikes`, `aiPostsPerDay`, etc. — but the Prisma schema uses `monthlyComments`, `monthlyLikes`, `aiPostsPerMonth`. This means TypeScript types don't match the actual database values, and any code relying on the `User` interface's plan fields will reference undefined properties. |
| 22 | 🟡 Medium | Excessive `as unknown as User` casts throughout the service. The `User` interface should match the Prisma generated types to avoid unsafe casts. |
| 23 | 🟡 Medium | `createUser` uses `Math.random().toString(36).substr(2, 9)` for user ID generation. `substr()` is deprecated — should use `substring()`. This also appears in the Clerk webhook handler. |
| 24 | 🟡 Medium | Password is included in the `User` return type from `getAllUsers()` and `findUserByEmail()`. Password hash should never leave the service layer. |

### `lib/limit-service.ts`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 25 | 🟡 Medium | Uses `(record as any)[type]` to dynamically access fields. If a `LimitType` value doesn't match a column name (e.g., `'aiTopicLines'` maps to column `aiTopicLines`), this silently returns `0` instead of throwing an error. No validation that the type maps to an actual column. |

### `lib/openai-config.ts`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 26 | 🟡 Medium | Exposes `OpenAIConfig.apiKey` which reads `process.env.OPENAI_API_KEY` directly. This config object could be accidentally serialized to the client if imported in a client component. |
| 27 | 🟠 **High** | `generatePostPrompt` uses `parseInt(length)` where `length` is a string like `"1200"`. If someone passes a non-numeric length, `parseInt` returns `NaN`, causing `Math.max(100, NaN - 200)` to produce `NaN`, and the prompt will contain `NaN` in the character count instructions. No input validation. |

### `lib/linkedin-formatter.ts`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 28 | 🟡 Medium | `formatForLinkedIn` removes hashtags from content and re-appends them at the end. If the post body contains words starting with `#` that aren't hashtags (e.g., `#1 priority`), they get incorrectly extracted and moved to the bottom. |

---

## 3. `app/api/auth/` — Authentication Routes

### `app/api/auth/login/route.ts`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 29 | 🟠 **High** | **No rate limiting on login endpoint.** An attacker can brute-force passwords with unlimited attempts. Should implement rate limiting (e.g., max 5 attempts per email per 15 minutes). |
| 30 | 🟡 Medium | Logs `'Login attempt for: email'` in production — potential PII leak in server logs. |

### `app/api/auth/register/route.ts`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 31 | 🟠 **High** | **No rate limiting on registration endpoint.** Can be abused to create unlimited accounts for spam. |
| 32 | 🟡 Medium | **Debug logging in production** — multiple `console.log('DEBUG: ...')` statements. These should be removed or put behind a debug flag. |
| 33 | 🟡 Medium | **Error response leaks debug info** — `'Registration failed. Please try again. Debug ID: ' + Date.now()` exposes the server timestamp, which can be used for timing attacks. |
| 34 | 🟡 Medium | `generateReferralCode` uses `Math.random()` which is not cryptographically secure. Referral codes could be predicted. Should use `crypto.getRandomValues()`. |
| 35 | 🔵 Low | Referral code generation is duplicated in both `register/route.ts` and `webhooks/clerk/route.ts`. Should be extracted to a shared utility. |

### `app/api/auth/send-otp/route.ts`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 36 | 🟠 **High** | **OTP generated with `Math.random()`** — not cryptographically secure. OTPs can be predicted. Should use `crypto.randomInt()`. |
| 37 | 🟡 Medium | **Rate limiting is flawed** — the code counts recent attempts, then _deletes all OTPs for the email_ (line 184), then creates a new one. This means the rate limit counter is reset on every request. An attacker can flood with requests faster than the 10-minute window. |
| 38 | 🟡 Medium | When no email service is configured, the OTP is logged to console (`console.log('[DEV MODE] OTP for ${email}: ${otp}')`). If this runs in production without email services, OTPs are silently logged and the user gets a "success" response but never receives the email. No error is returned to the user. |

### `app/api/auth/verify-otp/route.ts`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 39 | 🟡 Medium | **No brute-force protection on OTP verification.** An attacker can try all 1,000,000 possible 6-digit codes. Should limit verification attempts (e.g., max 5 wrong attempts before invalidating the OTP). |
| 40 | 🔵 Low | OTP comparison uses `===` (string equality) which is not timing-safe. Should use `crypto.timingSafeEqual()` to prevent timing attacks. |

---

## 4. `app/api/webhooks/` — Webhook Handlers

### `app/api/webhooks/stripe/route.ts`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 41 | 🟠 **High** | **`handlePaymentSucceeded` is empty** (lines 320-323). Successful payments are not tracked. The `TODO` comment says "Payment tracking can be added here if needed" — but session-based checkout tracking only works for first payment. Recurring subscription renewals go through `invoice.payment_succeeded` which does nothing. Users who cancel and re-subscribe may have stale `totalPaid` values. |
| 42 | 🟡 Medium | `Stripe` initialized with API version `'2025-11-17.clover'` — verify this matches the actual Stripe SDK version installed (`stripe@^20.0.0`). Mismatched API versions can cause silent type mismatches. |
| 43 | 🟡 Medium | **Multiple Stripe functions lack idempotency handling.** If the same webhook event is delivered twice (which Stripe guarantees can happen), the user could be incorrectly modified twice. Should track processed event IDs. |

### `app/api/webhooks/clerk/route.ts`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 44 | 🟡 Medium | On `user.created`, if user already exists and `authProvider` is `'legacy'`, the code sets `authProvider` to `'legacy'` (unchanged). Should set to `'clerk'` to indicate they've linked their Clerk account. (Line 87: `existingUser.authProvider === 'legacy' ? 'legacy' : 'clerk'` — this keeps it as `'legacy'` when it should be changed.) |
| 45 | 🟡 Medium | `generateRandomPassword()` uses `Math.random()` — passwords generated for Clerk users (stored in DB as required field) are not cryptographically random. While they're never used for login, this is still a security smell. |

---

## 5. `app/api/ai/` — AI Generation Routes

### `app/api/ai/generate-comment/route.ts`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 46 | 🔴 **Critical** | **Wrong Prisma model name on line 146.** Code references `prisma.linkedInProfile` but the actual Prisma model is `LinkedInProfileData`. This will throw a runtime error when `useProfileData` is enabled, crashing AI comment generation for users who have profile data scanning turned on. |
| 48 | 🟠 **High** | **Hardcoded developer emails** `['alanemarkef199@gmail.com', 'arman@arwebcraftslive.com']` on line 10. Token usage info is only returned to these specific emails. This should be configurable via admin settings, not hardcoded. Also, personal emails in source code are a privacy issue. |
| 49 | 🟡 Medium | **Fallback comments bypass usage tracking.** When AI fails and mock comments are used (lines 369-377, 384-391), `limitService.incrementUsage()` is NOT called. Users can exhaust AI service by sending bad requests, get free mock comments, and never have their usage incremented. |
| 50 | 🟡 Medium | Uses `(prisma as any).commentSettings`, `(prisma as any).commentStyleProfile`, `(prisma as any).scrapedComment` instead of properly typed Prisma client calls. This hides type errors at compile time. |

---

## 6. `app/api/cron/` — Cron Jobs

### `app/api/cron/scheduled-posts/route.ts`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 51 | 🔴 **Critical** | **Top-level `throw` on missing `CRON_SECRET`** (line 18). This import-time crash will prevent the entire module from loading. Combined with issue #17 (linkedin-service.ts top-level throw), this route can fail to deploy if ANY of `CRON_SECRET`, `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, or `LINKEDIN_REDIRECT_URI` is missing. |
| 52 | 🔴 **Critical** | **`INTERNAL_API_KEY` defaults to `'internal-api-key'`** (line 149). If this env var is not set, the cron job uses a hardcoded fallback key to authenticate internal API calls. An attacker who discovers this can forge internal requests. |

### `app/api/cron/process-emails/route.ts`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 54 | 🟡 Medium | **Duplicate trial expiry logic.** `checkExpiredTrials()` in this file duplicates the logic in `check-trial-expiry/route.ts`. If both are running, users could be downgraded twice (though the second is a no-op since they're already on the free plan). |
| 55 | 🟡 Medium | Also has top-level `throw` on missing `CRON_SECRET` (same issue as #51). |
| 56 | 🟠 **High** | `triggerScheduledPosts()` creates an `Activity` record as a "command" for the extension, but the separate `scheduled-posts/route.ts` cron does the same thing via a different mechanism (HTTP call to `/api/extension/command`). If both crons run, posts could be triggered twice. |

### `app/api/cron/check-trial-expiry/route.ts`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 57 | 🟡 Medium | Response includes user emails in the JSON response body (line 92: `users: updates.map(u => ({ email: u.email, id: u.id }))`). Cron responses should not expose PII — they may be visible in monitoring dashboards. |

---

## 7. `prisma/` — Database Schema

### `prisma/schema.prisma`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 58 | 🟡 Medium | **`ApiUsage` unique constraint uses `DateTime`** (`@@unique([userId, date])`). The `date` field has `@default(now())` which includes time precision. Two API usage records created in the same second will collide, but records created 1 second apart will be treated as different "days". The `date` field should be a `DateOnly` type or the code should explicitly truncate to midnight, which it does in `limit-service.ts` — but if any other code path creates `ApiUsage` records without truncating, it will create duplicate "daily" records. |
| 59 | 🔵 Low | `ExtensionVersion` uses snake_case field names (`bug_fixes`, `download_url`, `release_notes`, `is_active`, `created_at`, `updated_at`) while all other models use camelCase. Inconsistent naming convention. |
| 60 | 🔵 Low | `LinkedInOAuth.accessToken` is stored as plain text (`@db.Text`). LinkedIn access tokens should be encrypted at rest. |
| 61 | 🔵 Low | `OTPVerification` model has no `@@unique` constraint on `email` — multiple active OTPs can exist for the same email, which is handled by code but could be enforced at the DB level. |
| 62 | 🔵 Low | `ScrapedPost` has no foreign key relation to `User` (just a plain `userId String`). Unlike other models, cascade delete won't clean up scraped posts when a user is deleted. Same for `FeedScrapeSchedule`, `UserHistory`, `LiveActivityLog`, and `CommissionPayout`. |

---

## 8. `app/` — Frontend & Layout

### `app/layout.tsx`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 63 | 🟡 Medium | **Placeholder Google verification code** — `google: 'your-google-verification-code'` on line 64. This was never replaced with the actual verification code, so Google Search Console verification via meta tag won't work. |
| 64 | 🟡 Medium | **Structured data has fabricated ratings** — `aggregateRating: { ratingValue: '5.0', ratingCount: '500' }`. If Google detects this is not backed by real reviews, it can penalize the site or issue a manual action. |
| 65 | 🔵 Low | Copyright year hardcoded to `2025` in the OTP email template (`send-otp/route.ts` line 231). Should be dynamically generated. |
| 66 | 🔵 Low | Google Analytics and Meta Pixel scripts are loaded with `dangerouslySetInnerHTML` in `<head>`. Consider using `@next/third-parties` or `next/script` with `strategy="afterInteractive"` for better performance. |

### `app/page.tsx`
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 67 | 🟠 **High** | **File is 156KB** (likely 4000+ lines). A single React component of this size is very difficult to maintain, causes large client-side JS bundles, and makes the landing page significantly behind in loading. Should be split into smaller components. |

---

## 9. Root-level Scripts

### General Issues (multiple files)
| # | Severity | Bug / Issue |
|---|----------|-------------|
| 68 | 🟡 Medium | **20+ test/debug/fix scripts in the root directory.** Files like `check_users.js`, `create_admin.js`, `debug_ai_issue.js`, `fix-plans.js`, `simulate_registration.js`, `test_admin_api.js`, etc. are development/debugging scripts left in the production codebase. They contain hardcoded API URLs, test credentials, and can be accidentally run against production. Should be moved to a `scripts/dev/` folder or removed. |
| 69 | 🟡 Medium | **Multiple `.env` files committed.** Root directory has `.env`, `.env.local`, `.env.production`, `.env.production.local`, `.env.vercel.check` — potentially containing secrets. Verify `.gitignore` correctly excludes all of these. |
| 70 | 🔵 Low | `deploy-production.ps1`, `set-vercel-env.ps1`, `setup-database.ps1`, `system-status.ps1` — PowerShell deployment scripts in root add clutter. Consider moving to a `scripts/deploy/` directory. |

---

## 🏗️ Architectural Issues (Cross-cutting)

| # | Severity | Issue |
|---|----------|-------|
| A1 | 🟠 **High** | **Pervasive `as any` type casting.** Found in `lib/user-service.ts`, `lib/limit-service.ts`, `lib/openai-service.ts`, and nearly every API route. This defeats TypeScript's type safety and hides bugs at compile time. The root cause is that the `User` interface in `user-service.ts` doesn't match the Prisma generated types. |
| A2 | 🟠 **High** | **No shared error handling middleware/utility.** Every API route has its own try/catch with slightly different error response formats. Some return `{ success: false, error: '...' }`, others return `{ error: '...' }`. Inconsistent API response shape makes client-side error handling fragile. |
| A3 | 🟡 Medium | **Excessive `console.log` in production.** Found in 35+ API route files. Every API call generates multiple log lines with emojis, debug data, full prompts, and user information. This creates noise in production logs and can hit Vercel log storage limits. Should use a structured logger with log levels. |
| A4 | 🟡 Medium | **No input sanitization framework.** While some routes use Zod validation, many API routes directly destructure `request.json()` without validation (e.g., `generate-comment`, `scheduled-posts`, `comment-settings`). Malicious input could cause unexpected behavior. |
| A5 | 🔵 Low | **`scripts-deploy/` directory** contains 74 `.bat` files for various Git operations (branch management, deployment, etc.). This appears to be a generic Git toolkit unrelated to the project. Adds 500KB+ of unrelated files to the repository. |

---

## ✅ Recommended Priority Fixes

### Immediate (Deploy-blocking / Security)
1. **Fix CORS config** (#1) — Browsers are blocking all extension API requests
2. **Fix JWT token expiry** (#7) — Access tokens valid for 90 days is a critical security risk
3. **Fix top-level throws** (#8, #17, #51, #55) — Missing env vars crash entire app
4. **Fix wrong Prisma model name** (#46) — Profile-style comments crash at runtime
5. **Fix `INTERNAL_API_KEY` default** (#52) — Hardcoded key is a security hole

### Short-term (Feature-breaking)
6. **Fix `User` interface** (#21) — TypeScript types don't match database
7. **Add rate limiting to auth endpoints** (#29, #31)
8. **Fix OTP rate limiting logic** (#37) — Current implementation resets counters
9. **Fix duplicate cron logic** (#54, #56) — Posts can be triggered twice
10. **Use crypto-safe random** (#34, #36, #45) — OTPs and referral codes are predictable

### Medium-term (Technical Debt)
13. Fix singleton pattern in AI services (#14)
14. Remove code duplication between OpenAI/OpenRouter services (#16)
15. Split 156KB `page.tsx` into components (#67)
16. Clean up root-level debug scripts (#68)
17. Add Stripe webhook idempotency (#43)
18. Implement `invoice.payment_succeeded` handler (#41)
