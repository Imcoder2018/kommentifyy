# Bug Review - Kommentify

## Summary
- Reviewed key API/auth/Stripe and usage tracking paths. See table below for status and findings.
- Critical issues: invalid Stripe API version breaking checkout/webhooks, insecure JWT fallback secrets, and monthly usage limits tracked per-day.
- Additional risk: some services create new Prisma clients instead of reusing the shared instance, which can exhaust DB connections in serverless environments.

## Files/Folders Reviewed
| Path | Type | Notes |
| --- | --- | --- |
| lib/auth.ts | file | Uses fallback JWT secrets when env vars are missing; tokens would be signed with a known default. |
| app/api/checkout/create-session/route.ts | file | Stripe client initialized with invalid apiVersion `2025-11-17.clover`; Stripe SDK will throw and checkout cannot start. |
| app/api/webhooks/stripe/route.ts | file | Same invalid Stripe apiVersion, so webhook handler fails before verifying signatures. |
| app/api/usage/track/route.ts | file | Tracks usage in a per-day record keyed by date but compares against monthly limits; limits reset daily, so monthly quotas are never enforced. |
| lib/ai-service.ts | file | Instantiates a new PrismaClient instead of reusing `lib/prisma`; can leak connections under load. |
| app/api/* (spot checks) | folder | Other sampled routes (auth/login, auth/register, extension/command, heartbeat) had no new functional bugs spotted in this pass. |
| scripts/* | folder | Not reviewed in this pass. |
| kommentify-extension/* | folder | Not reviewed in this pass. |

## Detailed Findings
1) lib/auth.ts: Falls back to `fallback-secret`/`fallback-refresh-secret` when env vars are unset. In production this makes JWTs trivially forgeable. Require env vars and fail fast instead of defaulting.

2) app/api/checkout/create-session/route.ts: Stripe client created with apiVersion `2025-11-17.clover`, which is not a valid Stripe version string. The Stripe SDK throws during initialization, so checkout session creation fails. Use a real, pinned version (e.g., `2024-06-20`) and keep payment_method configuration aligned with that version.

3) app/api/webhooks/stripe/route.ts: Same invalid apiVersion causes webhook handler to fail before signature verification/processing, so upgrades/downgrades and payment events are never applied. Fix apiVersion to a valid Stripe version and ensure it matches the dashboard webhook setting.

4) app/api/usage/track/route.ts: Usage rows are keyed by `{ userId, date }` and the date is set to midnight today, but comparisons are made against monthly limits (`monthlyComments`, etc.). This resets counts every day, letting users exceed monthly quotas. Either aggregate monthly totals or key by month for monthly enforcement.

5) lib/ai-service.ts: Creates a new `PrismaClient()` instead of importing the shared client (`lib/prisma`). In serverless/edge this can quickly exhaust DB connections. Switch to the shared singleton export.

## Follow-ups
- Fix the above issues, then rerun relevant checkout/webhook and usage tracking flows.
- If you want a deeper pass on scripts and the extension code, I can expand the review.
