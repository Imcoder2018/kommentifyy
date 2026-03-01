# Kommentify - Project Guide

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Project Structure](#project-structure)
5. [Features](#features)
6. [API Documentation](#api-documentation)
7. [Authentication](#authentication)
8. [Database](#database)
9. [Configuration](#configuration)
10. [Development Commands](#development-commands)
11. [Deployment](#deployment)

---

## Project Overview

**Kommentify** is an AI-powered LinkedIn automation SaaS platform designed to help users grow their LinkedIn presence through smart commenting, intelligent networking, post scheduling, and lead management. The product consists of two main components:

1. **Web Dashboard** (`/app`) - A Next.js web application where users manage their automation, view analytics, configure settings, and access AI content generation tools.

2. **Browser Extension** (`/kommentify-extension`) - A Chrome extension that performs the actual LinkedIn automation tasks (liking, commenting, following, connecting) directly in the browser.

### Core Value Proposition

- **AI-Powered Content**: Generate LinkedIn posts, comments, and topic ideas using OpenAI/Claude
- **Safe Automation**: Browser-based automation that mimics human behavior to avoid account bans
- **Lead Management**: Track and warm up leads with multi-touch sequences
- **Post Scheduling**: Schedule content to be posted at optimal times
- **Analytics**: Track engagement, automation sessions, and networking activities

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **React 18** | UI library |
| **TypeScript** | Type safety |
| **Clerk** | Authentication & user management |
| **Tailwind CSS** | Styling (via Next.js) |
| **Lucide React** | Icon library |
| **React Flow** | Email sequence builder (visual) |
| **React Markdown** | Render markdown content |

### Backend

| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Server-side API endpoints |
| **Prisma** | ORM for PostgreSQL |
| **PostgreSQL** | Primary database |
| **Stripe** | Payment processing |
| **OpenAI API** | AI content generation |
| **OpenRouter** | Multi-model AI access (Claude, GPT, etc.) |
| **Vercel Blob** | File storage for media |
| **Upstash Vector** | Vector embeddings for AI |

### Development Tools

| Technology | Purpose |
|------------|---------|
| **TypeScript** | Language |
| **ESLint** | Code linting |
| **Vercel** | Deployment platform |
| **Chrome Extension APIs** | Browser automation |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud)
- npm or yarn

### Environment Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd Kommentify
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kommentify?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# OpenAI
OPENAI_API_KEY="sk-..."

# OpenRouter (for Claude, GPT, etc.)
OPENROUTER_API_KEY="sk-or-..."

# Vercel
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Upstash Vector
UPSTASH_VECTOR_REST_URL="https://..."
UPSTASH_VECTOR_REST_TOKEN="..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Set up the database**

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed the database with initial data
npm run prisma:seed
```

5. **Run the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Project Structure

```
Kommentify/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── admin/                # Admin-only endpoints
│   │   ├── ai/                  # AI generation endpoints
│   │   ├── auth/                # Authentication endpoints
│   │   ├── checkout/            # Stripe checkout
│   │   ├── usage/               # Usage tracking
│   │   └── vector/              # Vector database operations
│   ├── dashboard/               # User dashboard
│   │   └── components/          # Dashboard tabs & components
│   ├── admin/                   # Admin panel pages
│   ├── sign-in/                 # Clerk sign-in
│   ├── sign-up/                 # Clerk sign-up
│   ├── pricing/                 # Pricing page
│   └── (other pages)
├── components/                   # Shared React components
├── lib/                         # Utility libraries
│   ├── prisma.ts               # Prisma client
│   ├── auth.ts                # Authentication utilities
│   ├── ai-service.ts          # AI generation logic
│   ├── openai-service.ts      # OpenAI wrapper
│   ├── email-automation/       # Email automation system
│   └── i18n/                  # Internationalization
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Database migrations
│   └── seed.js                # Database seeder
├── kommentify-extension/       # Chrome extension
│   ├── src/
│   │   ├── background/        # Background scripts
│   │   ├── content/           # Content scripts
│   │   ├── components/        # Extension UI
│   │   ├── shared/            # Shared utilities
│   │   └── popup.html         # Extension popup
│   └── dist/                  # Built extension
└── public/                     # Static assets
```

### Key Directory Explanations

| Directory | Purpose |
|-----------|---------|
| `app/api/` | All server-side API endpoints |
| `app/dashboard/` | Main user dashboard with tabs |
| `app/admin/` | Admin panel for managing users/plans |
| `lib/` | Shared business logic and utilities |
| `prisma/` | Database schema and migrations |
| `kommentify-extension/` | Chrome extension source code |

---

## Features

### User Dashboard Features

| Feature | Description |
|---------|-------------|
| **Overview** | Real-time stats, activity feed, extension status |
| **Writer** | AI-powered LinkedIn post generation |
| **Comments** | AI comment generation with style learning |
| **Automation** | Configure auto-like, auto-comment, auto-follow |
| **Networking** | Profile import and connection automation |
| **Import** | Bulk import LinkedIn profiles |
| **History** | View AI-generated and published content |
| **Analytics** | Engagement statistics and charts |
| **Settings** | Comment settings, automation limits, profile sync |

### AI Content Generation

- **Post Writer**: Generate LinkedIn posts based on topics, templates, tone
- **Comment Generator**: Create comments that match user's style profile
- **Topic Lines**: Generate engaging topic lines for posts
- **Content Planner**: AI-powered content planning

### Automation Features

- **Auto-Like**: Automatically like posts in feed/search
- **Auto-Comment**: AI-generated comments on posts
- **Auto-Follow**: Follow authors of engaging posts
- **Auto-Share**: Share posts to your feed
- **Profile Import**: Import and engage with target profiles

### Lead Management

- **Lead Warmer**: Multi-touch warming sequences for leads
- **Warm Leads**: Simplified lead tracking without campaigns
- **Campaign Management**: Create and manage outreach campaigns

### Admin Features

- **User Management**: View, edit, manage users
- **Plan Management**: Configure subscription plans
- **Stats Dashboard**: Platform-wide analytics
- **Email Sequences**: Visual builder for automated emails
- **Extension Versions**: Manage extension releases

---

## API Documentation

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/clerk-callback` | POST | Sync Clerk user to database |
| `/api/auth/clerk-sync` | POST | Manual Clerk user sync |
| `/api/auth/register-fallback` | POST | Fallback registration |
| `/api/auth/extension-token` | GET | Get token for extension auth |
| `/api/auth/linkedin` | GET | LinkedIn OAuth initiation |
| `/api/auth/linkedin/callback` | GET | LinkedIn OAuth callback |

### User Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/users` | GET | List all users (admin) |
| `/api/admin/users/[userId]` | GET/PATCH/DELETE | Manage specific user |
| `/api/admin/users/[userId]/plan` | PATCH | Update user plan |
| `/api/admin/users/[userId]/ai-comments` | GET | Get user's AI comment history |

### AI Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/analyze-posts` | POST | Analyze trending posts |
| `/api/ai/generate-keywords` | POST | Generate content keywords |
| `/api/ai/content-planner` | POST | AI content planning |
| `/api/ai/test-connection` | GET | Test AI service connectivity |

### Usage & Limits

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/usage/track` | POST | Track daily usage |
| `/api/usage/daily` | GET | Get daily usage stats |
| `/api/usage/import-credits` | POST | Track import credits |

### Content Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scraped-posts` | GET/POST | Manage scraped posts |
| `/api/shared/posts` | GET | Get admin-shared posts |
| `/api/scheduled-posts` | GET/POST | Manage scheduled posts |
| `/api/comment-settings` | GET/PUT | User comment settings |

### Checkout Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/checkout/create-session` | POST | Create Stripe checkout session |
| `/api/plans` | GET | Get available plans |

### Analytics Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics` | GET | Get user analytics |
| `/api/analytics/sync` | POST | Sync extension analytics |
| `/api/live-activity` | GET | Real-time activity feed |

### Admin Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/stats` | GET | Platform-wide statistics |
| `/api/admin/plans` | GET/POST | Manage subscription plans |
| `/api/admin/referrals` | GET | View referral data |
| `/api/admin/email-sequences` | GET/POST | Manage email sequences |
| `/api/admin/email-sequences/seed` | POST | Seed email sequences |

---

## Authentication

### Clerk Integration

The application uses **Clerk** for user authentication. The setup includes:

1. **Middleware** (`middleware.ts`): Protects routes using Clerk
2. **Provider** (`app/layout.tsx`): Wraps app with ClerkProvider
3. **Sign-in/Sign-up Pages**: Located at `/sign-in` and `/sign-up`

### User Sync Flow

When a user signs up via Clerk:

1. Clerk creates the user
2. `clerk-callback` endpoint is triggered
3. User record is created in the database with plan defaults
4. User can access the dashboard

### Extension Authentication

The Chrome extension authenticates via:

1. User logs in through the extension popup
2. Extension receives session token from `/api/auth/extension-token`
3. Token is stored in extension storage
4. API calls include the token in headers

---

## Database

### Database Provider

- **PostgreSQL** via Prisma ORM
- Connection string configured via `DATABASE_URL`

### Key Models

| Model | Description |
|-------|-------------|
| `User` | User accounts with plan, referral, payment info |
| `Plan` | Subscription plans with limits |
| `ApiUsage` | Daily usage tracking per user |
| `Activity` | User activity log |
| `PostDraft` | AI-generated and scheduled posts |
| `ScrapedPost` | Posts saved from LinkedIn feed |
| `AutomationSettings` | User's automation configuration |
| `CommentSettings` | AI comment generation settings |
| `CommentStyleProfile` | LinkedIn profiles to learn commenting style |
| `LeadWarmerCampaign` | Multi-touch outreach campaigns |
| `WarmLead` | Simplified lead tracking |
| `LinkedInProfileData` | User's own LinkedIn profile data |
| `LinkedInOAuth` | OAuth tokens for server-side posting |
| `AIModel` | Available AI models |
| `EmailSequence` | Automated email sequences |
| `BlogPost` | SEO blog posts |

### Running Migrations

```bash
# Create new migration
npm run prisma:migrate -- --name migration_name

# Reset database (development only)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

---

## Configuration

### Plan Limits

Plans are stored in the database and include:

- Monthly AI comments/posts/topic lines
- Daily automation limits (likes, comments, follows, shares)
- Feature flags (automation, scheduling, import, etc.)
- Import credits

### Automation Settings

Users can configure:

- **Delay Mode**: Fixed or random with jitter
- **Daily Limits**: Max actions per day
- **Warmup Delay**: Initial delay before tasks
- **Human Simulation**: Mouse movement, scroll, reading pause

### AI Model Settings

Admin can configure which AI models are used for:

- Post generation
- Comment generation
- Topic line generation
- Chatbot assistance

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `OPENAI_API_KEY` | No | OpenAI API key |
| `OPENROUTER_API_KEY` | No | OpenRouter API key |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob token |
| `UPSTASH_VECTOR_REST_URL` | No | Upstash Vector URL |
| `UPSTASH_VECTOR_REST_TOKEN` | No | Upstash Vector token |

---

## Development Commands

### Core Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Database Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open database GUI
npm run prisma:studio

# Seed database
npm run prisma:seed
```

### Chrome Extension Development

```bash
cd kommentify-extension

# Build extension
npm run build

# The built extension is in the dist/ folder
# Load it in Chrome via chrome://extensions
```

---

## Deployment

### Vercel Deployment (Recommended)

1. **Connect repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically detect Next.js

### Required Environment Variables (Production)

```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...
BLOB_READ_WRITE_TOKEN=vercel_blob_...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Stripe Webhook Setup

1. Create Stripe webhook for your domain
2. Add webhook URL: `https://your-domain.com/api/webhooks/stripe`
3. Events to subscribe: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### Database Hosting

Recommended PostgreSQL providers:

- **Neon** (serverless, scales to zero)
- **Supabase** (with additional features)
- **Railway** (simple deployment)
- **AWS RDS** (enterprise)

---

## Additional Resources

- [Setup Guide](./doc-md/SETUP_GUIDE.md)
- [Quick Start](./doc-md/QUICK_START.md)
- [Database Setup](./doc-md/DATABASE_SETUP.md)
- [Stripe Setup](./doc-md/STRIPE_WEBHOOK_SETUP_GUIDE.md)
- [Extension Documentation](./doc-md/kommentify-extension/QUICK-START.md)

---

## Contributing Guidelines

### Development Workflow

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes** - Follow the code style and best practices:
   - Use TypeScript for all new code
   - Keep functions under 100 lines
   - Add proper error handling
   - Use Zod for input validation

3. **Run Tests and Lint**
   ```bash
   npm run lint
   npm run build
   ```

4. **Commit Changes** - Use descriptive commit messages:
   ```bash
   git add .
   git commit -m "feat: add new feature for AI comment generation"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style Guidelines

- **TypeScript**: Strict mode enabled, use proper types
- **React**: Use functional components with hooks
- **API Routes**: Validate all inputs with Zod schemas
- **Database**: Use Prisma for all database operations
- **Error Handling**: Return proper HTTP status codes

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `ai-service.ts` |
| Components | PascalCase | `DashboardCard.tsx` |
| Functions | camelCase | `generateComment()` |
| Constants | UPPER_SNAKE_CASE | `MAX_POST_LENGTH` |
| Database Models | PascalCase | `User`, `PostDraft` |

### Pull Request Guidelines

- PRs should be small and focused
- Include clear description of changes
- Link related issues
- Add screenshots for UI changes
- Update documentation if needed

### Security Best Practices

- Never commit secrets or API keys
- Validate all user inputs
- Use parameterized queries (Prisma handles this)
- Sanitize file paths
- Implement rate limiting on public endpoints

---

## Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Users                                   │
│    ┌──────────────┐           ┌──────────────┐                 │
│    │  Web Browser │           │ Chrome       │                 │
│    │  (Dashboard)  │           │ Extension    │                 │
│    └──────┬───────┘           └──────┬───────┘                 │
│           │                          │                          │
│           ▼                          ▼                          │
│    ┌──────────────────────────────────────────────────┐        │
│    │              Next.js Application                 │        │
│    │  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  │        │
│    │  │   Pages/    │  │  API Routes │  │  Cron   │  │        │
│    │  │ Components  │  │  (REST API) │  │  Jobs   │  │        │
│    │  └─────────────┘  └─────────────┘  └─────────┘  │        │
│    └──────────────────────┬──────────────────────────┘        │
│                           │                                     │
│           ┌───────────────┼───────────────┐                    │
│           ▼               ▼               ▼                    │
│    ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│    │ PostgreSQL │  │   Stripe   │  │  OpenAI/   │            │
│    │  (Prisma)  │  │  (Payments)│  │ OpenRouter │            │
│    └────────────┘  └────────────┘  └────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Component Interactions

1. **Web Dashboard** -> **API Routes** -> **Database**
2. **Chrome Extension** -> **API Routes** -> **Database**
3. **Cron Jobs** -> **API Routes** -> **External Services**

### Data Flow

```
User Action (Dashboard/Extension)
         │
         ▼
   API Route Handler
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Prisma    External
Query     Services
    │     (AI, Stripe)
    └────┬────┘
         │
         ▼
    Response
```

### Key Architectural Patterns

| Pattern | Implementation |
|---------|---------------|
| **API Routes** | Next.js App Router with route.ts files |
| **ORM** | Prisma with PostgreSQL |
| **Authentication** | Clerk with JWT tokens |
| **State Management** | React Context + Server Components |
| **Validation** | Zod schemas |
| **Error Handling** | try/catch with proper HTTP codes |

---

## Chrome Extension Architecture

### Extension Structure

```
kommentify-extension/
├── src/
│   ├── background/         # Service worker
│   │   ├── index.ts       # Main background script
│   │   └── commands.ts    # Command handlers
│   ├── content/           # Content scripts
│   │   ├── index.ts       # Main content script
│   │   └── selectors.ts  # DOM selectors
│   ├── components/        # Extension popup UI
│   │   ├── App.tsx        # Main popup component
│   │   └── ...
│   ├── shared/            # Shared utilities
│   │   ├── api.ts         # API client
│   │   ├── storage.ts    # Chrome storage
│   │   └── types.ts      # Shared types
│   └── types/            # TypeScript types
├── dist/                  # Built extension
└── package.json
```

### Extension Communication

1. **Popup <-> Background**: Uses `chrome.runtime.sendMessage`
2. **Background <-> Content**: Uses `chrome.tabs.sendMessage`
3. **Extension <-> Server**: REST API calls via fetch

### Key Extension Features

- **Automation Tasks**: Like, comment, follow, connect
- **Profile Import**: Bulk import LinkedIn profiles
- **Post Writer**: Create and publish posts
- **Live Activity**: Real-time task status updates

---

## Cron Jobs & Scheduled Tasks

### Available Cron Endpoints

| Endpoint | Schedule | Purpose |
|----------|----------|---------|
| `/api/cron/process-emails` | Every 1 min | Process email queue |
| `/api/cron/scheduled-posts` | Every 5 min | Publish scheduled posts |
| `/api/cron/check-failed-tasks` | Every 10 min | Retry failed tasks |
| `/api/cron/check-trial-expiry` | Daily | Check trial expiration |
| `/api/cron/lead-warmer` | Every 15 min | Process lead warming |

### Setting Up Cron (Vercel)

Add to your `vercel.json` or use Vercel Cron:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-emails",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/scheduled-posts",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### Processing Email Queue

The email automation system processes emails in batches:

1. Query pending emails from `EmailQueue` table
2. Send emails via configured provider (SendGrid, etc.)
3. Update status to 'sent' or 'failed'
4. Log results and handle retries

---

## Webhooks

### Clerk Webhooks

Endpoint: `/api/webhooks/clerk`

Events handled:
- `user.created` - Create user in database
- `user.updated` - Update user info
- `user.deleted` - Handle account deletion

### Stripe Webhooks

Endpoint: `/api/webhooks/stripe`

Events handled:
- `checkout.session.completed` - Activate subscription
- `customer.subscription.updated` - Update plan limits
- `customer.subscription.deleted` - Handle cancellation
- `invoice.payment_failed` - Notify user

### Verifying Webhooks

```typescript
// Clerk
import { Webhook } from 'svix';

const webhook = new Webhook(CLERK_SECRET_KEY);
webhook.verify(payload, headers);

// Stripe
import Stripe from 'stripe';
const stripe = new Stripe(STRIPE_SECRET_KEY);
const event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test.ts

# Watch mode
npm test -- --watch
```

### Test Structure

Tests should follow the pattern:
- `*.test.ts` - Unit tests
- `*.integration.ts` - Integration tests

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Dashboard loads correctly
- [ ] AI comment generation works
- [ ] Automation settings save properly
- [ ] Extension connects to API
- [ ] Payment flow completes

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Database connection error | Check DATABASE_URL in .env |
| Prisma client error | Run `npm run prisma:generate` |
| Clerk auth not working | Verify CLERK_SECRET_KEY |
| Extension not connecting | Check API_URL in extension config |
| Build fails | Run `npm run lint` to check errors |

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=true
```

### Getting Help

1. Check the existing documentation in `/doc-md`
2. Review API route implementations
3. Check browser console for extension errors
4. Review server logs in Vercel dashboard

---

## License

Proprietary - All rights reserved

---

*Last Updated: March 2026*
