# Project Codebase: prisma

## 1. Project Structure

```text
.
        ├── migration.sql
        ├── migration.sql
        ├── migration.sql
        ├── migration.sql
        ├── migration.sql
        ├── migration.sql
        ├── migration.sql
    ├── add_extension_versions.sql
    ├── migration_lock.toml
├── schema.prisma
├── seed-ai-models.js
├── seed-extension-version.js
├── seed.js
```

## 2. File Contents

### migrations\20251130073829_add_import_profiles_feature\migration.sql

```
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "planId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stripePaymentLink" TEXT,
    "dailyComments" INTEGER NOT NULL DEFAULT 50,
    "dailyLikes" INTEGER NOT NULL DEFAULT 100,
    "dailyShares" INTEGER NOT NULL DEFAULT 20,
    "dailyFollows" INTEGER NOT NULL DEFAULT 50,
    "dailyConnections" INTEGER NOT NULL DEFAULT 30,
    "aiPostsPerDay" INTEGER NOT NULL DEFAULT 10,
    "aiCommentsPerDay" INTEGER NOT NULL DEFAULT 50,
    "aiTopicLinesPerDay" INTEGER NOT NULL DEFAULT 10,
    "allowAiPostGeneration" BOOLEAN NOT NULL DEFAULT true,
    "allowAiCommentGeneration" BOOLEAN NOT NULL DEFAULT true,
    "allowAiTopicLines" BOOLEAN NOT NULL DEFAULT true,
    "allowPostScheduling" BOOLEAN NOT NULL DEFAULT true,
    "allowAutomation" BOOLEAN NOT NULL DEFAULT true,
    "allowAutomationScheduling" BOOLEAN NOT NULL DEFAULT true,
    "allowNetworking" BOOLEAN NOT NULL DEFAULT true,
    "allowNetworkScheduling" BOOLEAN NOT NULL DEFAULT true,
    "allowCsvExport" BOOLEAN NOT NULL DEFAULT true,
    "allowImportProfiles" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "follows" INTEGER NOT NULL DEFAULT 0,
    "connections" INTEGER NOT NULL DEFAULT 0,
    "aiPosts" INTEGER NOT NULL DEFAULT 0,
    "aiComments" INTEGER NOT NULL DEFAULT 0,
    "aiTopicLines" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ApiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_planId_idx" ON "User"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");

-- CreateIndex
CREATE INDEX "ApiUsage_userId_date_idx" ON "ApiUsage"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ApiUsage_userId_date_key" ON "ApiUsage"("userId", "date");

-- CreateIndex
CREATE INDEX "Activity_userId_timestamp_idx" ON "Activity"("userId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_email_idx" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiUsage" ADD CONSTRAINT "ApiUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

```

---

### migrations\20251130123021_convert_daily_to_monthly_limits\migration.sql

```
/*
  Warnings:

  - You are about to drop the column `aiCommentsPerDay` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `aiPostsPerDay` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `aiTopicLinesPerDay` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `dailyComments` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `dailyConnections` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `dailyFollows` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `dailyLikes` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `dailyShares` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "aiCommentsPerDay",
DROP COLUMN "aiPostsPerDay",
DROP COLUMN "aiTopicLinesPerDay",
DROP COLUMN "dailyComments",
DROP COLUMN "dailyConnections",
DROP COLUMN "dailyFollows",
DROP COLUMN "dailyLikes",
DROP COLUMN "dailyShares",
ADD COLUMN     "aiCommentsPerMonth" INTEGER NOT NULL DEFAULT 1500,
ADD COLUMN     "aiPostsPerMonth" INTEGER NOT NULL DEFAULT 300,
ADD COLUMN     "aiTopicLinesPerMonth" INTEGER NOT NULL DEFAULT 300,
ADD COLUMN     "monthlyComments" INTEGER NOT NULL DEFAULT 1500,
ADD COLUMN     "monthlyConnections" INTEGER NOT NULL DEFAULT 900,
ADD COLUMN     "monthlyFollows" INTEGER NOT NULL DEFAULT 1500,
ADD COLUMN     "monthlyLikes" INTEGER NOT NULL DEFAULT 3000,
ADD COLUMN     "monthlyShares" INTEGER NOT NULL DEFAULT 600;

```

---

### migrations\20251201185312_add_trial_and_stripe_fields\migration.sql

```
-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "isDefaultFreePlan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTrialPlan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxImportProfilesPerBatch" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "stripePriceId" TEXT,
ADD COLUMN     "trialDurationDays" INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "trialEndsAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");

```

---

### migrations\20251201191336_make_stripe_customer_id_unique\migration.sql

```
/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_stripeCustomerId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

```

---

### migrations\20251202193854_add_import_credits\migration.sql

```
-- AlterTable
ALTER TABLE "ApiUsage" ADD COLUMN     "importProfiles" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "monthlyImportCredits" INTEGER NOT NULL DEFAULT 100;

```

---

### migrations\20260218000000_add_linkedin_profile_data\migration.sql

```
-- CreateTable
CREATE TABLE "LinkedInProfileData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileUrl" TEXT,
    "name" TEXT,
    "headline" TEXT,
    "about" TEXT,
    "language" TEXT,
    "posts" TEXT NOT NULL DEFAULT '[]',
    "experience" TEXT NOT NULL DEFAULT '[]',
    "education" TEXT NOT NULL DEFAULT '[]',
    "certifications" TEXT NOT NULL DEFAULT '[]',
    "projects" TEXT NOT NULL DEFAULT '[]',
    "skills" TEXT NOT NULL DEFAULT '[]',
    "postsTokenLimit" INTEGER NOT NULL DEFAULT 3000,
    "isSelected" BOOLEAN NOT NULL DEFAULT true,
    "lastScannedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedInProfileData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LinkedInProfileData_userId_key" ON "LinkedInProfileData"("userId");

-- CreateIndex
CREATE INDEX "LinkedInProfileData_userId_idx" ON "LinkedInProfileData"("userId");

```

---

### migrations\20260218000001_add_scheduled_post_task_fields\migration.sql

```
-- Add task tracking fields to PostDraft model
ALTER TABLE "PostDraft" ADD COLUMN "taskId" TEXT;
ALTER TABLE "PostDraft" ADD COLUMN "taskStatus" TEXT DEFAULT 'pending';
ALTER TABLE "PostDraft" ADD COLUMN "taskSentAt" TIMESTAMP(3);
ALTER TABLE "PostDraft" ADD COLUMN "taskCompletedAt" TIMESTAMP(3);
ALTER TABLE "PostDraft" ADD COLUMN "taskFailedAt" TIMESTAMP(3);
ALTER TABLE "PostDraft" ADD COLUMN "taskFailureReason" TEXT;

-- Create indexes for task tracking
CREATE INDEX "PostDraft_taskId_idx" ON "PostDraft"("taskId");
CREATE INDEX "PostDraft_taskStatus_idx" ON "PostDraft"("taskStatus");
CREATE INDEX "PostDraft_taskSentAt_idx" ON "PostDraft"("taskSentAt");
CREATE INDEX "PostDraft_taskFailedAt_idx" ON "PostDraft"("taskFailedAt");

```

---

### migrations\add_extension_versions.sql

```
-- Create extension_versions table for Supabase
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS extension_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    version VARCHAR(20) NOT NULL UNIQUE,
    features TEXT[] DEFAULT '{}',
    bug_fixes TEXT[] DEFAULT '{}',
    download_url TEXT,
    release_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster version lookups
CREATE INDEX IF NOT EXISTS idx_extension_versions_version ON extension_versions(version);
CREATE INDEX IF NOT EXISTS idx_extension_versions_created_at ON extension_versions(created_at DESC);

-- Insert initial version (update with your actual current version details)
INSERT INTO extension_versions (version, features, bug_fixes, download_url, release_notes)
VALUES (
    '1.3.4',
    ARRAY['AI-powered comment generation', 'Scheduled post automation', 'Network growth tools', 'Business hours scheduling'],
    ARRAY['Fixed scheduled posts reliability', 'Improved tab switching for posting'],
    '',
    'Current stable release with all core features'
) ON CONFLICT (version) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_extension_versions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS extension_versions_updated_at ON extension_versions;
CREATE TRIGGER extension_versions_updated_at
    BEFORE UPDATE ON extension_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_extension_versions_updated_at();

```

---

### migrations\migration_lock.toml

```
# Please do not edit this file manually
# It should be added in your version-control system (i.e. Git)
provider = "postgresql"
```

---

### schema.prisma

```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id               String     @id @default(cuid())
  email            String     @unique
  password         String
  name             String?
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
  planId           String?
  trialEndsAt      DateTime?
  stripeCustomerId String?    @unique
  
  // Auth provider fields
  authProvider     String     @default("legacy")  // legacy, clerk, admin
  clerkUserId      String?    @unique             // Clerk user ID for Clerk-authenticated users
  
  // Referral fields
  referralCode     String?    @unique  // User's unique referral code
  referredById     String?              // Who referred this user
  referredBy       User?      @relation("Referrals", fields: [referredById], references: [id])
  referrals        User[]     @relation("Referrals")  // Users this person referred
  hasPaid          Boolean    @default(false)  // Has this user ever made a payment
  totalPaid        Float      @default(0)       // Total amount user has paid
  
  activities       Activity[]
  apiUsage         ApiUsage[]
  plan             Plan?      @relation(fields: [planId], references: [id])
  postDrafts       PostDraft[]

  @@index([email])
  @@index([planId])
  @@index([referralCode])
  @@index([referredById])
  @@index([clerkUserId])
}

model Plan {
  id                        String   @id @default(cuid())
  name                      String   @unique
  price                     Float
  yearlyPrice               Float?
  stripePaymentLink         String?
  stripeYearlyPaymentLink   String?
  stripePriceId             String?
  stripeYearlyPriceId       String?
  isTrialPlan               Boolean  @default(false)
  isDefaultFreePlan         Boolean  @default(false)
  isLifetime                Boolean  @default(false)
  lifetimeMaxSpots          Int      @default(0)
  lifetimeSoldSpots         Int      @default(0)
  lifetimeExpiresAt         DateTime?
  trialDurationDays         Int      @default(3)
  allowAiPostGeneration     Boolean  @default(true)
  allowAiCommentGeneration  Boolean  @default(true)
  allowAiTopicLines         Boolean  @default(true)
  allowGeneralAutomation    Boolean  @default(true)
  allowPostScheduling       Boolean  @default(true)
  allowAutomation           Boolean  @default(true)
  allowAutomationScheduling Boolean  @default(true)
  allowNetworking           Boolean  @default(true)
  allowNetworkScheduling    Boolean  @default(true)
  allowCsvExport            Boolean  @default(true)
  allowImportProfiles       Boolean  @default(true)
  monthlyImportCredits      Int      @default(100)
  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt
  aiCommentsPerMonth        Int      @default(1500)
  aiPostsPerMonth           Int      @default(300)
  aiTopicLinesPerMonth      Int      @default(300)
  monthlyComments           Int      @default(1500)
  monthlyConnections        Int      @default(900)
  monthlyFollows            Int      @default(1500)
  monthlyLikes              Int      @default(3000)
  monthlyShares             Int      @default(600)
  displayOrder              Int      @default(0)
  users                     User[]
}

model ApiUsage {
  id             String   @id @default(cuid())
  userId         String
  date           DateTime @default(now())
  comments       Int      @default(0)
  likes          Int      @default(0)
  shares         Int      @default(0)
  follows        Int      @default(0)
  connections    Int      @default(0)
  importProfiles Int      @default(0)
  aiPosts        Int      @default(0)
  aiComments     Int      @default(0)
  bonusAiComments Int     @default(0)
  aiTopicLines   Int      @default(0)
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@index([userId, date])
}

model Activity {
  id        String   @id @default(cuid())
  userId    String
  type      String
  timestamp DateTime @default(now())
  metadata  Json?
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, timestamp])
}

model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      String   @default("admin")
  createdAt DateTime @default(now())

  @@index([email])
}

model ExtensionVersion {
  id           String   @id @default(cuid())
  version      String   @unique
  features     String[] @default([])
  bug_fixes    String[] @default([])
  download_url String?
  release_notes String?
  is_active    Boolean  @default(true)
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt

  @@index([version])
  @@index([created_at(sort: Desc)])
}

// Referral settings configured by admin
model ReferralSettings {
  id                    String   @id @default(cuid())
  commissionPercentage  Float    @default(20)     // Percentage of sale as commission (e.g., 20%)
  commissionFlat        Float    @default(0)      // Flat amount per referral (alternative to percentage)
  usePercentage         Boolean  @default(true)   // If true, use percentage; if false, use flat amount
  minPayoutAmount       Float    @default(50)     // Minimum amount before payout
  isActive              Boolean  @default(true)   // Is referral program active
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

// Track commission payouts
model CommissionPayout {
  id          String   @id @default(cuid())
  userId      String               // User receiving the payout
  amount      Float                // Payout amount
  status      String   @default("pending")  // pending, paid, cancelled
  paidAt      DateTime?
  createdAt   DateTime @default(now())
  
  @@index([userId])
  @@index([status])
}

// Email queue for automated sequences
model EmailQueue {
  id            String   @id @default(cuid())
  userId        String               // User to send email to
  sequenceType  String               // onboarding, expired_trial, paid_customer, special
  emailNumber   Int                  // Which email in the sequence (1, 2, 3, etc.)
  templateId    String               // Template identifier
  scheduledFor  DateTime             // When to send
  status        String   @default("pending")  // pending, sent, failed, cancelled
  sentAt        DateTime?
  error         String?
  metadata      String?              // JSON string for extra data
  createdAt     DateTime @default(now())
  
  @@index([status, scheduledFor])
  @@index([userId])
  @@index([sequenceType])
}

// Track email sequence state per user
model UserEmailState {
  id                    String   @id @default(cuid())
  userId                String   @unique
  onboardingStarted     DateTime?
  onboardingCompleted   Boolean  @default(false)
  expiredTrialStarted   DateTime?
  expiredTrialCompleted Boolean  @default(false)
  paidSequenceStarted   DateTime?
  paidSequenceCompleted Boolean  @default(false)
  lastEmailSent         DateTime?
  unsubscribed          Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([userId])
}

// Email Sequence - configurable sequences
model EmailSequence {
  id          String   @id @default(cuid())
  name        String               // e.g., "Onboarding", "Expired Trial"
  type        String   @unique     // onboarding, expired_trial, paid_customer, special
  description String?
  isActive    Boolean  @default(true)
  trigger     String               // signup, trial_expired, payment, manual
  nodes       String               // JSON - ReactFlow nodes data
  edges       String               // JSON - ReactFlow edges data
  emails      EmailTemplateNode[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([type])
  @@index([isActive])
}

// Email Template Node - individual emails in sequence
model EmailTemplateNode {
  id            String   @id @default(cuid())
  sequenceId    String
  sequence      EmailSequence @relation(fields: [sequenceId], references: [id], onDelete: Cascade)
  nodeId        String               // ReactFlow node ID
  position      Int                  // Order in sequence
  subject       String
  body          String   @db.Text    // Email body (HTML or text)
  delayHours    Int      @default(0) // Delay from previous email
  delayMinutes  Int      @default(0) // Additional minutes delay
  isActive      Boolean  @default(true)
  conditions    String?              // JSON - conditions for sending
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([sequenceId, nodeId])
  @@index([sequenceId])
}

// Email automation settings
model EmailAutomationSettings {
  id                String   @id @default(cuid())
  batchSize         Int      @default(50)   // Emails per cron run
  cronIntervalMins  Int      @default(1)    // How often cron runs
  maxRetriesPerEmail Int     @default(3)    // Max retries for failed emails
  retryDelayMins    Int      @default(30)   // Delay between retries
  isEnabled         Boolean  @default(true) // Global on/off switch
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// Global settings for admin-configurable values
model GlobalSettings {
  id                    String   @id @default(cuid())
  aiCommentsPerDollar   Int      @default(100)  // Number of AI comments users get for $1
  postEmbeddingsCount   Int      @default(8)    // How many inspiration posts to use for post generation
  commentEmbeddingsCount Int     @default(5)    // How many style examples to use for comment generation
  profileStyleMode      Boolean  @default(true) // Use profile style mode for AI comment generation
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

// Scraped posts from LinkedIn feed (saved by extension)
model ScrapedPost {
  id              String   @id @default(cuid())
  userId          String
  postContent     String   @db.Text
  authorName      String?
  authorProfileUrl String?
  likes           Int      @default(0)
  comments        Int      @default(0)
  shares          Int      @default(0)
  postUrl         String?
  imageUrl        String?  @db.Text
  isSharedByAdmin Boolean  @default(false)
  scrapedAt       DateTime @default(now())
  createdAt       DateTime @default(now())

  @@index([userId])
  @@index([scrapedAt])
  @@index([likes])
  @@index([comments])
  @@index([isSharedByAdmin])
}

// Feed scraping schedule (user-configurable)
model FeedScrapeSchedule {
  id              String   @id @default(cuid())
  userId          String
  scheduleTimes   String   // JSON array of times e.g. ["09:00","14:00","19:00"]
  durationMinutes Int      @default(5)  // How long to run scraping
  isActive        Boolean  @default(true)
  // Criteria for qualifying posts
  minLikes        Int      @default(0)
  minComments     Int      @default(0)
  keywords        String?  // Comma-separated words to look for in posts
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
  @@index([isActive])
}

// User history - stores AI generated posts, viral analysis, and published posts
model UserHistory {
  id        String   @id @default(cuid())
  userId    String
  type      String   // ai_generated, viral_analysis, published_post
  title     String?
  content   String   @db.Text   // JSON string for structured data
  metadata  String?  @db.Text   // Additional JSON metadata
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([type])
  @@index([createdAt])
}

// Post drafts saved from website writer
model PostDraft {
  id              String   @id @default(cuid())
  userId          String
  content         String   @db.Text
  topic           String?
  template        String?
  tone            String?
  status          String   @default("draft")  // draft, scheduled, posted
  scheduledFor    DateTime?
  postedAt        DateTime?
  // Task tracking fields
  taskId          String?  // Extension command ID
  taskStatus      String   @default("pending")  // pending, in_progress, completed, failed
  taskSentAt      DateTime?
  taskCompletedAt DateTime?
  taskFailedAt    DateTime?
  taskFailureReason String? @db.Text
  // Media attachment fields
  mediaUrl        String?  @db.Text  // Vercel Blob URL for image/video
  mediaType       String?  // 'image' or 'video'
  // LinkedIn API posting (server-side, no extension)
  linkedinPostId  String?  // LinkedIn post URN after API posting
  postMethod      String   @default("extension")  // 'extension' or 'api'
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  user            User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([status])
  @@index([scheduledFor])
  @@index([taskId])
  @@index([taskStatus])
  @@index([taskSentAt])
  @@index([taskFailedAt])
}

// Comment Style Profile - LinkedIn profiles to learn commenting style from
model CommentStyleProfile {
  id              String   @id @default(cuid())
  userId          String
  profileUrl      String   // LinkedIn profile URL
  profileId       String   // e.g. "geckse" from /in/geckse
  profileName     String?  // Display name
  commentCount    Int      @default(0)
  isSelected      Boolean  @default(false) // Whether this profile is selected for AI training
  isSharedByAdmin Boolean  @default(false) // Admin shared this profile with all users
  lastScrapedAt   DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  comments        ScrapedComment[]

  @@unique([userId, profileId])
  @@index([userId])
  @@index([isSharedByAdmin])
}

// Scraped comments from a profile owner on various LinkedIn posts
model ScrapedComment {
  id              String   @id @default(cuid())
  userId          String
  profileId       String   // Links to CommentStyleProfile.id
  postText        String   @db.Text   // The original post text the comment was on
  context         String   @db.Text   // "DIRECT COMMENT ON POST" or "REPLY TO [Name]: ..."
  commentText     String   @db.Text   // The profile owner's actual comment
  isTopComment    Boolean  @default(false) // Marked as a top/favorite comment by user
  scrapedAt       DateTime @default(now())
  createdAt       DateTime @default(now())

  profile         CommentStyleProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([profileId])
  @@index([isTopComment])
}

// User comment settings (synced between website and extension)
model CommentSettings {
  id              String   @id @default(cuid())
  userId          String   @unique
  useProfileStyle Boolean  @default(false)
  useProfileData  Boolean  @default(false)
  goal            String   @default("AddValue")
  tone            String   @default("Friendly")
  commentLength   String   @default("Short")
  commentStyle    String   @default("direct")
  model           String   @default("gpt-4o")
  userExpertise   String   @default("")
  userBackground  String   @default("")
  aiAutoPost      String   @default("manual")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
}

// Automation settings - limits, delays, presets (synced between website and extension)
model AutomationSettings {
  id                    String   @id @default(cuid())
  userId                String   @unique
  // Preset
  accountPreset         String   @default("matured-safe")
  // Delay mode: 'fixed' uses exact values, 'random' uses min-max range with jitter
  delayMode             String   @default("random")
  // Global delay controls
  baseDelay             Int      @default(0)      // extra seconds added to every action (0 = disabled)
  randomDelayEnabled    Boolean  @default(true)   // toggle random jitter on/off
  // Random interval — jitter range added on top when randomDelayEnabled
  randomIntervalMin     Int      @default(3)
  randomIntervalMax     Int      @default(10)
  // Daily limits
  dailyCommentLimit     Int      @default(30)
  dailyLikeLimit        Int      @default(60)
  dailyShareLimit       Int      @default(15)
  dailyFollowLimit      Int      @default(30)
  // Warmup delay (seconds) — single delay before any task starts
  warmupDelay           Int      @default(5)
  // Legacy starting delays (kept for backward compat, default 0 = use warmupDelay)
  automationStartDelay  Int      @default(0)
  networkingStartDelay  Int      @default(0)
  importStartDelay      Int      @default(0)
  taskInitDelay         Int      @default(0)
  // Post writer delays (seconds) — minimal, just enough for DOM
  postWriterPageLoad    Int      @default(3)
  postWriterClick       Int      @default(1)
  postWriterTyping      Int      @default(1)
  postWriterSubmit      Int      @default(2)
  // Between-posts delay intervals (seconds) — MOST IMPORTANT for safety
  searchDelayMin        Int      @default(15)
  searchDelayMax        Int      @default(30)
  commentDelayMin       Int      @default(25)
  commentDelayMax       Int      @default(60)
  // Between-connections delay intervals (seconds) — IMPORTANT for safety
  networkingDelayMin    Int      @default(20)
  networkingDelayMax    Int      @default(45)
  // Per-action delays (seconds) — small pauses before each click
  beforeOpeningDelay    Int      @default(2)
  postPageLoadDelay     Int      @default(3)
  beforeLikeDelay       Int      @default(1)
  beforeCommentDelay    Int      @default(2)
  beforeShareDelay      Int      @default(1)
  beforeFollowDelay     Int      @default(1)
  // Human simulation
  mouseMovement         Boolean  @default(true)
  scrollSimulation      Boolean  @default(true)
  readingPause          Boolean  @default(true)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([userId])
}

// Live activity log — extension pushes task actions here for website dashboard display
model LiveActivityLog {
  id          String   @id @default(cuid())
  userId      String
  taskType    String               // 'automation', 'networking', 'import', 'post_writer'
  action      String               // 'like', 'comment', 'share', 'follow', 'connect', 'post', 'delay', 'start', 'stop', 'error'
  message     String   @db.Text    // human-readable description
  details     String   @default("{}") @db.Text  // JSON — extra data (post URL, delay duration, etc.)
  level       String   @default("info")  // 'info', 'success', 'warning', 'error'
  createdAt   DateTime @default(now())

  @@index([userId, createdAt])
  @@index([userId, taskType])
}

// Commenter config - bulk commenting settings (synced between website and extension)
model CommenterConfig {
  id                    String   @id @default(cuid())
  userId                String   @unique
  // Post source
  postSource            String   @default("feed")  // "search" or "feed"
  searchKeywords        String   @default("")       // newline-separated keywords
  // Actions
  savePosts             Boolean  @default(false)
  likePosts             Boolean  @default(true)
  commentOnPosts        Boolean  @default(true)
  likeOrComment         Boolean  @default(false)
  sharePosts            Boolean  @default(false)
  followAuthors         Boolean  @default(false)
  // Processing settings
  totalPosts            Int      @default(3)
  minLikes              Int      @default(0)
  minComments           Int      @default(0)
  // Ignore keywords (newline-separated)
  ignoreKeywords        String   @default("hiring\nwe're hiring\njob opening\njoin our team\nwe are hiring\nlooking for\nopen position\nnow hiring\napply now") @db.Text
  // Window preference
  openInNewWindow       Boolean  @default(true)
  // Schedules (JSON array)
  schedules             String   @default("[]") @db.Text
  autoScheduleEnabled   Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([userId])
}

// Import config - LinkedIn profile import settings (synced between website and extension)
model ImportConfig {
  id                    String   @id @default(cuid())
  userId                String   @unique
  // Profile URLs (newline-separated)
  profileUrls           String   @default("") @db.Text
  // Automation settings
  profilesPerDay        Int      @default(20)
  sendConnections       Boolean  @default(true)
  engageLikes           Boolean  @default(true)
  engageComments        Boolean  @default(true)
  engageShares          Boolean  @default(false)
  engageFollows         Boolean  @default(true)
  smartRandom           Boolean  @default(false)
  postsPerProfile       Int      @default(2)
  engagementMethod      String   @default("individual") // 'individual' = open each post URL, 'activity' = engage on activity page
  // Schedules (JSON array)
  schedules             String   @default("[]") @db.Text
  autoScheduleEnabled   Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([userId])
}

// Admin-shared inspiration profiles (profile URLs shared with all users)
model SharedInspirationProfile {
  id              String   @id @default(cuid())
  profileUrl      String   @unique
  profileName     String
  postCount       Int      @default(0)
  sourceUserId    String
  sharedBy        String
  createdAt       DateTime @default(now())

  @@index([profileUrl])
}

// Blog posts for SEO
model BlogPost {
  id              String   @id @default(cuid())
  title           String
  slug            String   @unique
  content         String   @db.Text
  excerpt         String?  @db.Text
  featuredImage   String?
  metaTitle       String?
  metaDescription String?
  published       Boolean  @default(false)
  publishedAt     DateTime?
  authorName      String   @default("Kommentify Team")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([slug])
  @@index([published, publishedAt])
}

// Analytics data synced from extension to website
model UserAnalyticsSync {
  id                  String   @id @default(cuid())
  userId              String   @unique
  engagementStats     String   @default("{}") @db.Text
  automationRecords   String   @default("[]") @db.Text
  networkingSessions  String   @default("[]") @db.Text
  importRecords       String   @default("[]") @db.Text
  leads               String   @default("[]") @db.Text
  lastSyncedAt        DateTime @default(now())
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([userId])
}

// User's own LinkedIn profile data - scanned and stored for AI content generation
model LinkedInProfileData {
  id              String   @id @default(cuid())
  userId          String   @unique
  profileUrl      String?
  name            String?
  headline        String?
  location        String?
  connections     String?
  profileViews    String?
  about           String?  @db.Text
  language        String?
  // Stored as JSON strings to handle arrays
  posts           String   @default("[]") @db.Text
  experience      String   @default("[]") @db.Text
  education       String   @default("[]") @db.Text
  certifications  String   @default("[]") @db.Text
  projects        String   @default("[]") @db.Text
  skills          String   @default("[]") @db.Text
  interests       String   @default("[]") @db.Text
  // Full page text captured from LinkedIn for re-scanning
  fullPageText    String?  @db.Text
  // Token optimization: store truncated versions for AI prompts
  postsTokenLimit Int      @default(3000)  // Max characters from posts to include in AI prompt
  totalPostsCount Int      @default(0)     // Actual count of posts extracted from recent-activity page
  isSelected      Boolean  @default(true)  // Whether to use this data in AI generation
  lastScannedAt   DateTime?
  // Voyager API data
  linkedInUrn       String?          // LinkedIn member URN (e.g., "urn:li:fsd_profile:xxx")
  linkedInUsername   String?          // Public username slug
  followerCount     Int?             // Number of followers
  connectionCount   Int?             // Number of connections (1st degree)
  profileViewsData  String?  @db.Text // JSON - recent profile view analytics
  recentPosts       String   @default("[]") @db.Text // JSON - Voyager post data with engagement
  voyagerEmail      String?          // Email from Voyager API (may differ from account email)
  voyagerLastSyncAt DateTime?        // When Voyager data was last synced
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
}

// AI Models available for LinkedIn content generation
model AIModel {
  id                    String   @id @default(cuid())
  modelId               String   @unique  // OpenRouter/OpenAI model ID e.g. "openai/gpt-4o", "anthropic/claude-4.5-sonnet"
  name                  String            // Display name e.g. "GPT-4o", "Claude 4.5 Sonnet"
  provider              String            // "openai", "anthropic", "google", "meta", "mistral", "deepseek", "xai", "perplexity", etc.
  apiSource             String   @default("openrouter")  // "openrouter" or "openai" (only for official OpenAI models)
  
  // Pricing (per 1M tokens in USD)
  inputCostPer1M        Float    @default(0)
  outputCostPer1M       Float    @default(0)
  
  // Token limits
  maxContextTokens      Int      @default(4096)
  maxOutputTokens       Int      @default(4096)
  
  // Capabilities
  supportsSystemPrompt  Boolean  @default(true)
  supportsVision        Boolean  @default(false)
  supportsTools         Boolean  @default(false)
  supportsStreaming     Boolean  @default(true)
  
  // Quality ratings (1-10 scale based on benchmarks)
  reasoningScore        Int      @default(5)    // Complex reasoning, analysis
  writingScore          Int      @default(5)    // Creative writing, content generation
  codingScore           Int      @default(5)   // Code generation
  speedScore            Int      @default(5)    // Response speed
  
  // Categories
  category              String   @default("general")  // "premium", "standard", "budget", "free"
  isReasoningModel      Boolean  @default(false)  // Has thinking/extended reasoning mode
  isMultimodal          Boolean  @default(false)
  
  // Admin control
  isEnabled             Boolean  @default(true)   // Admin can enable/disable for all users
  isFeatured            Boolean  @default(false)  // Show in featured/recommended section
  
  // Metadata
  description           String?  @db.Text
  releaseDate           DateTime?
  lastUpdated           DateTime @default(now())
  createdAt             DateTime @default(now())
  
  @@index([provider])
  @@index([category])
  @@index([isEnabled])
  @@index([isFeatured])
}

// User's AI model preferences for different content types
model UserAIModelSettings {
  id                    String   @id @default(cuid())
  userId                String   @unique
  
  // Model selections for different content types
  postModelId           String?  // Model for generating LinkedIn posts
  commentModelId        String?  // Model for generating LinkedIn comments
  topicModelId          String?  // Model for generating topic lines/ideas
  
  // Fallback model if selected model is disabled
  fallbackModelId       String?  @default("anthropic/claude-sonnet-4.5")
  
  // Advanced settings per model (JSON)
  postModelSettings     String   @default("{}") @db.Text   // temperature, max_tokens, etc.
  commentModelSettings  String   @default("{}") @db.Text
  topicModelSettings    String   @default("{}") @db.Text
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([userId])
  @@index([postModelId])
  @@index([commentModelId])
}

// Track AI model usage and costs per user
model AIModelUsage {
  id                String   @id @default(cuid())
  userId            String
  modelId           String
  
  // Usage stats
  totalRequests     Int      @default(0)
  totalInputTokens  Int      @default(0)
  totalOutputTokens Int      @default(0)
  totalCost         Float    @default(0)  // In USD
  
  // Period tracking
  periodStart       DateTime @default(now())
  periodEnd         DateTime?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([userId, modelId, periodStart])
  @@index([userId])
  @@index([modelId])
  @@index([periodStart])
}

// LinkedIn OAuth tokens for server-side posting (no extension needed)
model LinkedInOAuth {
  id              String   @id @default(cuid())
  userId          String   @unique
  linkedinId      String?  // LinkedIn member ID (URN)
  accessToken     String   @db.Text
  refreshToken    String?  @db.Text
  tokenExpiresAt  DateTime?
  scopes          String?  // Comma-separated scopes granted
  displayName     String?
  email           String?
  profileUrl      String?
  isActive        Boolean  @default(true)
  lastUsedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
  @@index([isActive])
}

// Extension heartbeat - tracks extension online status
model ExtensionHeartbeat {
  id           String   @id @default(cuid())
  userId       String   @unique
  lastSeen     DateTime @default(now())
  version      String?  // Extension version
  status       String   @default("online")  // online, offline, busy
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@index([userId])
  @@index([lastSeen])
}

// Lead Warmer Campaign - multi-touch warming sequences
model LeadWarmerCampaign {
  id                String   @id @default(cuid())
  userId            String
  name              String
  status            String   @default("active")  // active, paused, completed, archived
  // Campaign goal context
  businessContext   String?  @db.Text  // "I help SaaS founders reduce churn through onboarding audits"
  campaignGoal      String   @default("relationship")  // relationship, authority, warm_pitch, recruit
  // Sequence configuration (JSON array of steps)
  // Each step: { day: 1, action: "follow", enabled: true }
  // Actions: follow, like, comment, like_2, comment_2, connect
  sequenceSteps     String   @default("[{\"day\":1,\"action\":\"follow\",\"enabled\":true},{\"day\":3,\"action\":\"like\",\"enabled\":true},{\"day\":5,\"action\":\"comment\",\"enabled\":true},{\"day\":7,\"action\":\"like_2\",\"enabled\":true},{\"day\":10,\"action\":\"connect\",\"enabled\":true}]") @db.Text
  // Safety limits
  profilesPerDay    Int      @default(20)
  // Stats
  totalProspects    Int      @default(0)
  warmProspects     Int      @default(0)
  connectedCount    Int      @default(0)
  repliedCount      Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  prospects         LeadWarmerProspect[]

  @@index([userId])
  @@index([status])
}

// Lead Warmer Prospect - individual leads in a campaign
model LeadWarmerProspect {
  id                String   @id @default(cuid())
  campaignId        String
  userId            String
  // Profile data
  linkedinUrl       String
  vanityId          String?  // extracted from URL e.g. "john-doe"
  firstName         String?
  lastName          String?
  company           String?
  jobTitle          String?
  profileUrn        String?  // LinkedIn URN for API calls
  campaignTag       String?  // user-defined tag: cold, hot, partners
  notes             String?  @db.Text
  // Status pipeline: cold → touched → warm → connected → replied
  status            String   @default("cold")
  // Touch tracking
  touchCount        Int      @default(0)
  nextTouchDate     DateTime?
  nextTouchAction   String?  // follow, like, comment, connect
  lastTouchDate     DateTime?
  // Recent posts (JSON array scraped by extension)
  recentPosts       String   @default("[]") @db.Text
  // Hot signal tracking
  engagedBack       Boolean  @default(false)
  engagedBackAt     DateTime?
  // Metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  campaign          LeadWarmerCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  touchLogs         LeadWarmerTouchLog[]

  @@unique([campaignId, linkedinUrl])
  @@index([userId])
  @@index([campaignId])
  @@index([status])
  @@index([nextTouchDate])
}

// Lead Warmer Touch Log - individual actions taken on a prospect
model LeadWarmerTouchLog {
  id              String   @id @default(cuid())
  prospectId      String
  userId          String
  // Action details
  touchNumber     Int      // 1, 2, 3, 4, 5...
  action          String   // follow, like, comment, connect
  status          String   @default("completed")  // pending, completed, failed, skipped
  // Content
  postText        String?  @db.Text  // the post that was engaged with
  postUrl         String?
  commentText     String?  @db.Text  // AI-generated comment
  connectionNote  String?  // connection request note (max 200 chars)
  // Result
  errorMessage    String?  @db.Text
  createdAt       DateTime @default(now())

  prospect        LeadWarmerProspect @relation(fields: [prospectId], references: [id], onDelete: Cascade)

  @@index([prospectId])
  @@index([userId])
  @@index([createdAt])
}

// OTP verification codes - serverless-safe storage
model OTPVerification {
  id         String   @id @default(cuid())
  email      String
  otp        String
  attempts   Int      @default(1)
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  
  @@index([email])
  @@index([expiresAt])
}

// Warm Leads - imported leads without campaign structure (simplified lead warmer)
model WarmLead {
  id                String   @id @default(cuid())
  userId            String
  // Profile data
  linkedinUrl       String
  vanityId          String?  // extracted from URL e.g. "john-doe"
  firstName         String?
  lastName          String?
  company           String?
  jobTitle          String?
  profileUrn        String?  // LinkedIn URN for API calls
  headline          String?  @db.Text
  tags              String?  // comma-separated user tags
  notes             String?  @db.Text
  // Status: pending_fetch, fetched, engaged, connected
  status            String   @default("pending_fetch")
  // Posts fetched flag
  postsFetched      Boolean  @default(false)
  postsFetchedAt    DateTime?
  // Engagement tracking
  touchCount        Int      @default(0)
  lastEngagedAt     DateTime?
  // Sequence position
  currentSequenceStep Int    @default(0)
  nextActionDate    DateTime?
  nextAction        String?  // like, comment, follow, connect
  // Metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  posts             WarmLeadPost[]
  engagementLogs    WarmLeadEngagement[]

  @@unique([userId, linkedinUrl])
  @@index([userId])
  @@index([status])
  @@index([nextActionDate])
}

// Warm Lead Posts - individual posts for each lead
model WarmLeadPost {
  id              String   @id @default(cuid())
  leadId          String
  userId          String
  // Post data
  postUrn         String?  // LinkedIn post URN (activity ID)
  postText        String   @db.Text
  postDate        DateTime?
  postUrl         String?
  // Engagement metrics
  likes           Int      @default(0)
  comments        Int      @default(0)
  shares          Int      @default(0)
  // Engagement status
  isLiked         Boolean  @default(false)
  likedAt         DateTime?
  isCommented     Boolean  @default(false)
  commentedAt     DateTime?
  commentText     String?  @db.Text
  // Metadata
  createdAt       DateTime @default(now())

  lead            WarmLead @relation(fields: [leadId], references: [id], onDelete: Cascade)

  @@index([leadId])
  @@index([userId])
  @@index([postDate])
}

// Warm Lead Engagement Log - individual engagement actions
model WarmLeadEngagement {
  id              String   @id @default(cuid())
  leadId          String
  postId          String?
  userId          String
  // Action details
  action          String   // like, comment, follow, connect
  status          String   @default("pending")  // pending, completed, failed
  // Content
  postUrn         String?
  commentText     String?  @db.Text
  // Result
  errorMessage    String?  @db.Text
  completedAt     DateTime?
  createdAt       DateTime @default(now())

  lead            WarmLead @relation(fields: [leadId], references: [id], onDelete: Cascade)

  @@index([leadId])
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

// Pending Extension Tasks - queue of tasks to execute when extension goes live
model PendingExtensionTask {
  id              String   @id @default(cuid())
  userId          String
  // Task details
  taskType        String   // fetch_lead_posts, engage_post, follow_lead, etc.
  taskData        String   @db.Text  // JSON payload
  priority        Int      @default(0)  // Higher = execute first
  // Status
  status          String   @default("pending")  // pending, in_progress, completed, failed
  // Scheduling
  scheduledFor    DateTime?  // When this task was originally scheduled
  missedSchedule  Boolean  @default(false)  // True if scheduled time passed while offline
  // Result
  result          String?  @db.Text  // JSON result
  errorMessage    String?  @db.Text
  attempts        Int      @default(0)
  maxAttempts     Int      @default(3)
  // Timestamps
  startedAt       DateTime?
  completedAt     DateTime?
  createdAt       DateTime @default(now())

  @@index([userId, status])
  @@index([status, scheduledFor])
  @@index([userId, taskType])
}

// Warm Leads Settings - user settings for the lead warmer (no campaigns)
model WarmLeadsSettings {
  id                    String   @id @default(cuid())
  userId                String   @unique
  // Campaign-like settings that apply to all leads
  campaignName          String   @default("My Warm Leads")
  businessContext       String?  @db.Text  // "I help SaaS founders reduce churn..."
  campaignGoal          String   @default("relationship")  // relationship, authority, warm_pitch, recruit
  // Sequence configuration (JSON array of steps)
  sequenceSteps         String   @default("[{\"day\":1,\"action\":\"follow\",\"enabled\":true},{\"day\":3,\"action\":\"like\",\"enabled\":true},{\"day\":5,\"action\":\"comment\",\"enabled\":true},{\"day\":7,\"action\":\"like\",\"enabled\":true},{\"day\":10,\"action\":\"connect\",\"enabled\":false}]") @db.Text
  // Daily limits
  profilesPerDay        Int      @default(20)
  postsPerLead          Int      @default(10)  // How many posts to fetch per lead
  // Bulk task settings
  bulkTaskLimit         Int      @default(10)  // Max leads per bulk task batch
  // Schedule settings
  scheduleEnabled       Boolean  @default(false)
  scheduleTimes         String   @default("[]") @db.Text  // JSON array of times
  scheduleTimezone      String   @default("UTC")
  // Autopilot mode
  autopilotEnabled      Boolean  @default(false)
  // Timestamps
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([userId])
}

```

---

### seed-ai-models.js

```javascript
/**
 * Seed file for AI Models - Best models for LinkedIn content generation
 * Updated: February 2026
 * 
 * Categories:
 * - premium: Top-tier models with best quality ($10+/1M output)
 * - standard: Good balance of quality and cost ($1-10/1M output)
 * - budget: Cost-effective models ($0.1-1/1M output)
 * - free: Free or nearly free models (<$0.1/1M output)
 * 
 * API Sources:
 * - openai: Official OpenAI API (for ChatGPT models only)
 * - openrouter: OpenRouter API (for all other models)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const AI_MODELS = [
  // ==================== PREMIUM MODELS ====================
  // OpenAI GPT-5 Series (via OpenAI API)
  {
    modelId: 'gpt-5.2',
    name: 'GPT-5.2',
    provider: 'openai',
    apiSource: 'openai',
    inputCostPer1M: 5.00,
    outputCostPer1M: 15.00,
    maxContextTokens: 400000,
    maxOutputTokens: 16384,
    reasoningScore: 9,
    writingScore: 10,
    codingScore: 9,
    speedScore: 7,
    category: 'premium',
    isReasoningModel: true,
    isFeatured: true,
    description: 'Latest GPT-5 with 400K context, adaptive reasoning, best for complex content'
  },
  {
    modelId: 'gpt-5.2-pro',
    name: 'GPT-5.2 Pro',
    provider: 'openai',
    apiSource: 'openai',
    inputCostPer1M: 10.00,
    outputCostPer1M: 30.00,
    maxContextTokens: 400000,
    maxOutputTokens: 16384,
    reasoningScore: 10,
    writingScore: 10,
    codingScore: 10,
    speedScore: 6,
    category: 'premium',
    isReasoningModel: true,
    isFeatured: true,
    description: 'Most advanced GPT-5 with extended thinking, reduced hallucination'
  },
  {
    modelId: 'gpt-5.3-codex',
    name: 'GPT-5.3 Codex',
    provider: 'openai',
    apiSource: 'openai',
    inputCostPer1M: 8.00,
    outputCostPer1M: 24.00,
    maxContextTokens: 200000,
    maxOutputTokens: 16384,
    reasoningScore: 9,
    writingScore: 9,
    codingScore: 10,
    speedScore: 8,
    category: 'premium',
    isReasoningModel: true,
    isFeatured: true,
    description: 'Self-improving model, 25% faster than 5.2-Codex, best for technical content'
  },
  {
    modelId: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    apiSource: 'openai',
    inputCostPer1M: 2.50,
    outputCostPer1M: 10.00,
    maxContextTokens: 128000,
    maxOutputTokens: 16384,
    reasoningScore: 9,
    writingScore: 9,
    codingScore: 9,
    speedScore: 8,
    category: 'premium',
    isMultimodal: true,
    isFeatured: true,
    description: 'Best all-around model, excellent for LinkedIn posts and comments'
  },
  {
    modelId: 'o1',
    name: 'o1 (Reasoning)',
    provider: 'openai',
    apiSource: 'openai',
    inputCostPer1M: 15.00,
    outputCostPer1M: 60.00,
    maxContextTokens: 200000,
    maxOutputTokens: 100000,
    reasoningScore: 10,
    writingScore: 8,
    codingScore: 10,
    speedScore: 4,
    category: 'premium',
    isReasoningModel: true,
    isFeatured: true,
    description: 'Deep reasoning model, best for complex analysis and thought leadership content'
  },
  {
    modelId: 'o1-mini',
    name: 'o1-mini',
    provider: 'openai',
    apiSource: 'openai',
    inputCostPer1M: 3.00,
    outputCostPer1M: 12.00,
    maxContextTokens: 128000,
    maxOutputTokens: 65536,
    reasoningScore: 8,
    writingScore: 7,
    codingScore: 8,
    speedScore: 6,
    category: 'premium',
    isReasoningModel: true,
    description: 'Fast reasoning model, good balance of speed and quality'
  },

  // Anthropic Claude 4.x Series (via OpenRouter)
  {
    modelId: 'anthropic/claude-opus-4.6',
    name: 'Claude Opus 4.6',
    provider: 'anthropic',
    apiSource: 'openrouter',
    inputCostPer1M: 15.00,
    outputCostPer1M: 75.00,
    maxContextTokens: 200000,
    maxOutputTokens: 16384,
    reasoningScore: 10,
    writingScore: 10,
    codingScore: 10,
    speedScore: 5,
    category: 'premium',
    isReasoningModel: true,
    isFeatured: true,
    description: 'Latest Anthropic flagship, maximum intelligence, best for premium content'
  },
  {
    modelId: 'anthropic/claude-opus-4.5',
    name: 'Claude Opus 4.5',
    provider: 'anthropic',
    apiSource: 'openrouter',
    inputCostPer1M: 15.00,
    outputCostPer1M: 75.00,
    maxContextTokens: 200000,
    maxOutputTokens: 16384,
    reasoningScore: 10,
    writingScore: 10,
    codingScore: 10,
    speedScore: 5,
    category: 'premium',
    isReasoningModel: true,
    description: 'Top-tier reasoning, excellent for complex thought leadership'
  },
  {
    modelId: 'anthropic/claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    apiSource: 'openrouter',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    maxContextTokens: 200000,
    maxOutputTokens: 16384,
    reasoningScore: 9,
    writingScore: 9,
    codingScore: 9,
    speedScore: 7,
    category: 'premium',
    isMultimodal: true,
    isFeatured: true,
    description: 'Excellent balance of speed and quality, great for LinkedIn content'
  },
  {
    modelId: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    apiSource: 'openrouter',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    maxContextTokens: 200000,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 9,
    codingScore: 8,
    speedScore: 8,
    category: 'standard',
    isMultimodal: true,
    description: 'Balanced performance, excellent instruction following'
  },
  {
    modelId: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    apiSource: 'openrouter',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    maxContextTokens: 200000,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 9,
    codingScore: 8,
    speedScore: 8,
    category: 'standard',
    isMultimodal: true,
    description: 'Proven performer, great for professional content'
  },

  // Google Gemini 3.x Series (via OpenRouter)
  {
    modelId: 'google/gemini-3-pro',
    name: 'Gemini 3 Pro',
    provider: 'google',
    apiSource: 'openrouter',
    inputCostPer1M: 1.25,
    outputCostPer1M: 10.00,
    maxContextTokens: 1000000,
    maxOutputTokens: 65536,
    reasoningScore: 10,
    writingScore: 10,
    codingScore: 9,
    speedScore: 7,
    category: 'premium',
    isMultimodal: true,
    isFeatured: true,
    description: 'LM Arena #1, 1M context, best for long-form content and research'
  },
  {
    modelId: 'google/gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    provider: 'google',
    apiSource: 'openrouter',
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    maxContextTokens: 1000000,
    maxOutputTokens: 65536,
    reasoningScore: 9,
    writingScore: 9,
    codingScore: 8,
    speedScore: 9,
    category: 'standard',
    isMultimodal: true,
    isFeatured: true,
    description: 'Near-Pro quality at Flash prices, 1M context, excellent value'
  },
  {
    modelId: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    apiSource: 'openrouter',
    inputCostPer1M: 1.25,
    outputCostPer1M: 10.00,
    maxContextTokens: 2000000,
    maxOutputTokens: 65536,
    reasoningScore: 9,
    writingScore: 9,
    codingScore: 9,
    speedScore: 7,
    category: 'premium',
    isMultimodal: true,
    description: '2M context, excellent for processing large documents'
  },
  {
    modelId: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    apiSource: 'openrouter',
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    maxContextTokens: 1000000,
    maxOutputTokens: 65536,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 7,
    speedScore: 9,
    category: 'standard',
    isMultimodal: true,
    description: 'Fast and affordable, great for high-volume content'
  },

  // xAI Grok Series (via OpenRouter)
  {
    modelId: 'x-ai/grok-4.1',
    name: 'Grok 4.1',
    provider: 'xai',
    apiSource: 'openrouter',
    inputCostPer1M: 2.00,
    outputCostPer1M: 10.00,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 9,
    writingScore: 9,
    codingScore: 8,
    speedScore: 8,
    category: 'premium',
    isFeatured: true,
    description: 'Real-time web integration via X, great for trending topics'
  },
  {
    modelId: 'x-ai/grok-4.1-thinking',
    name: 'Grok 4.1 Thinking',
    provider: 'xai',
    apiSource: 'openrouter',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    maxContextTokens: 131072,
    maxOutputTokens: 16384,
    reasoningScore: 10,
    writingScore: 9,
    codingScore: 9,
    speedScore: 6,
    category: 'premium',
    isReasoningModel: true,
    description: 'Extended reasoning mode, LM Arena #2'
  },
  {
    modelId: 'x-ai/grok-beta',
    name: 'Grok Beta',
    provider: 'xai',
    apiSource: 'openrouter',
    inputCostPer1M: 1.00,
    outputCostPer1M: 5.00,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 7,
    speedScore: 8,
    category: 'standard',
    description: 'Access to real-time X data, good for current events content'
  },

  // ==================== STANDARD MODELS ====================
  // DeepSeek Series (via OpenRouter)
  {
    modelId: 'deepseek/deepseek-v3.2',
    name: 'DeepSeek V3.2',
    provider: 'deepseek',
    apiSource: 'openrouter',
    inputCostPer1M: 0.27,
    outputCostPer1M: 1.10,
    maxContextTokens: 64000,
    maxOutputTokens: 8192,
    reasoningScore: 9,
    writingScore: 8,
    codingScore: 9,
    speedScore: 8,
    category: 'standard',
    isFeatured: true,
    description: 'Best value champion, matches GPT-4o at 1/40th cost'
  },
  {
    modelId: 'deepseek/deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    apiSource: 'openrouter',
    inputCostPer1M: 0.27,
    outputCostPer1M: 1.10,
    maxContextTokens: 64000,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 9,
    speedScore: 8,
    category: 'standard',
    description: 'Excellent reasoning and tool use, very cost-effective'
  },
  {
    modelId: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'deepseek',
    apiSource: 'openrouter',
    inputCostPer1M: 0.55,
    outputCostPer1M: 2.19,
    maxContextTokens: 64000,
    maxOutputTokens: 8192,
    reasoningScore: 9,
    writingScore: 8,
    codingScore: 9,
    speedScore: 6,
    category: 'standard',
    isReasoningModel: true,
    description: 'Open-source reasoning model, excellent for analysis'
  },
  {
    modelId: 'deepseek/deepseek-coder-v2',
    name: 'DeepSeek Coder V2',
    provider: 'deepseek',
    apiSource: 'openrouter',
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    maxContextTokens: 128000,
    maxOutputTokens: 4096,
    reasoningScore: 7,
    writingScore: 6,
    codingScore: 9,
    speedScore: 9,
    category: 'budget',
    description: 'Best for technical LinkedIn content and code explanations'
  },

  // Perplexity Series (via OpenRouter)
  {
    modelId: 'perplexity/sonar-pro',
    name: 'Sonar Pro',
    provider: 'perplexity',
    apiSource: 'openrouter',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    maxContextTokens: 200000,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 7,
    speedScore: 8,
    category: 'standard',
    isFeatured: true,
    description: 'Real-time web search, great for research-backed content'
  },
  {
    modelId: 'perplexity/sonar',
    name: 'Sonar',
    provider: 'perplexity',
    apiSource: 'openrouter',
    inputCostPer1M: 1.00,
    outputCostPer1M: 1.00,
    maxContextTokens: 127000,
    maxOutputTokens: 4096,
    reasoningScore: 7,
    writingScore: 7,
    codingScore: 6,
    speedScore: 9,
    category: 'budget',
    description: 'Affordable with web search, good for current events'
  },
  {
    modelId: 'perplexity/llama-3.1-sonar-large-128k-online',
    name: 'Llama 3.1 Sonar Large Online',
    provider: 'perplexity',
    apiSource: 'openrouter',
    inputCostPer1M: 1.00,
    outputCostPer1M: 1.00,
    maxContextTokens: 128000,
    maxOutputTokens: 4096,
    reasoningScore: 7,
    writingScore: 7,
    codingScore: 6,
    speedScore: 9,
    category: 'budget',
    description: 'Online search with Llama 3.1, great for trending topics'
  },

  // Meta Llama Series (via OpenRouter)
  {
    modelId: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B Instruct',
    provider: 'meta',
    apiSource: 'openrouter',
    inputCostPer1M: 0.35,
    outputCostPer1M: 0.40,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 7,
    speedScore: 9,
    category: 'budget',
    isFeatured: true,
    description: 'Best open-source model, excellent value for money'
  },
  {
    modelId: 'meta-llama/llama-3.2-90b-vision-instruct',
    name: 'Llama 3.2 90B Vision',
    provider: 'meta',
    apiSource: 'openrouter',
    inputCostPer1M: 0.90,
    outputCostPer1M: 0.90,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 7,
    speedScore: 8,
    category: 'standard',
    isMultimodal: true,
    description: 'Multimodal Llama, great for image + text content'
  },
  {
    modelId: 'meta-llama/llama-3.2-11b-vision-instruct',
    name: 'Llama 3.2 11B Vision',
    provider: 'meta',
    apiSource: 'openrouter',
    inputCostPer1M: 0.055,
    outputCostPer1M: 0.055,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 6,
    writingScore: 7,
    codingScore: 5,
    speedScore: 10,
    category: 'free',
    isMultimodal: true,
    description: 'Lightweight multimodal, very affordable'
  },
  {
    modelId: 'meta-llama/llama-3.1-405b-instruct',
    name: 'Llama 3.1 405B Instruct',
    provider: 'meta',
    apiSource: 'openrouter',
    inputCostPer1M: 2.70,
    outputCostPer1M: 2.70,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 9,
    writingScore: 9,
    codingScore: 8,
    speedScore: 6,
    category: 'standard',
    description: 'Largest Llama model, near-frontier performance'
  },
  {
    modelId: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B Instruct',
    provider: 'meta',
    apiSource: 'openrouter',
    inputCostPer1M: 0.35,
    outputCostPer1M: 0.40,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 7,
    speedScore: 9,
    category: 'budget',
    description: 'Great balance of quality and speed'
  },
  {
    modelId: 'meta-llama/llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B Instruct',
    provider: 'meta',
    apiSource: 'openrouter',
    inputCostPer1M: 0.055,
    outputCostPer1M: 0.055,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 6,
    writingScore: 6,
    codingScore: 5,
    speedScore: 10,
    category: 'free',
    description: 'Fast and cheap, good for simple content'
  },

  // Mistral Series (via OpenRouter)
  {
    modelId: 'mistralai/devstral-2-2512',
    name: 'Devstral 2 2512',
    provider: 'mistral',
    apiSource: 'openrouter',
    inputCostPer1M: 0.35,
    outputCostPer1M: 0.39,
    maxContextTokens: 256000,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 7,
    codingScore: 9,
    speedScore: 8,
    category: 'budget',
    isFeatured: true,
    description: '123B agentic coding model, MIT license, enterprise-ready'
  },
  {
    modelId: 'mistralai/mistral-large-2',
    name: 'Mistral Large 2',
    provider: 'mistral',
    apiSource: 'openrouter',
    inputCostPer1M: 2.00,
    outputCostPer1M: 6.00,
    maxContextTokens: 128000,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 8,
    speedScore: 8,
    category: 'standard',
    description: 'Mistral flagship, great multilingual support'
  },
  {
    modelId: 'mistralai/mistral-medium',
    name: 'Mistral Medium',
    provider: 'mistral',
    apiSource: 'openrouter',
    inputCostPer1M: 1.00,
    outputCostPer1M: 3.00,
    maxContextTokens: 32000,
    maxOutputTokens: 8192,
    reasoningScore: 7,
    writingScore: 8,
    codingScore: 7,
    speedScore: 9,
    category: 'standard',
    description: 'Good balance model, efficient for content generation'
  },
  {
    modelId: 'mistralai/mistral-small',
    name: 'Mistral Small',
    provider: 'mistral',
    apiSource: 'openrouter',
    inputCostPer1M: 0.20,
    outputCostPer1M: 0.60,
    maxContextTokens: 32000,
    maxOutputTokens: 8192,
    reasoningScore: 6,
    writingScore: 7,
    codingScore: 6,
    speedScore: 10,
    category: 'budget',
    description: 'Fast and affordable, good for high-volume tasks'
  },
  {
    modelId: 'mistralai/mixtral-8x22b-instruct',
    name: 'Mixtral 8x22B Instruct',
    provider: 'mistral',
    apiSource: 'openrouter',
    inputCostPer1M: 0.65,
    outputCostPer1M: 0.65,
    maxContextTokens: 65536,
    maxOutputTokens: 4096,
    reasoningScore: 7,
    writingScore: 8,
    codingScore: 7,
    speedScore: 8,
    category: 'budget',
    description: 'MoE architecture, efficient and capable'
  },
  {
    modelId: 'mistralai/mixtral-8x7b-instruct',
    name: 'Mixtral 8x7B Instruct',
    provider: 'mistral',
    apiSource: 'openrouter',
    inputCostPer1M: 0.24,
    outputCostPer1M: 0.24,
    maxContextTokens: 32768,
    maxOutputTokens: 4096,
    reasoningScore: 6,
    writingScore: 7,
    codingScore: 6,
    speedScore: 9,
    category: 'budget',
    description: 'Original MoE, still great value'
  },

  // ==================== BUDGET MODELS ====================
  // GLM Series (via OpenRouter)
  {
    modelId: 'z-ai/glm-4.7',
    name: 'GLM 4.7',
    provider: 'zhipu',
    apiSource: 'openrouter',
    inputCostPer1M: 0.35,
    outputCostPer1M: 0.39,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 8,
    speedScore: 8,
    category: 'budget',
    isFeatured: true,
    description: 'Enhanced programming, stable multi-step reasoning, great UI'
  },
  {
    modelId: 'z-ai/glm-4-plus',
    name: 'GLM 4 Plus',
    provider: 'zhipu',
    apiSource: 'openrouter',
    inputCostPer1M: 0.50,
    outputCostPer1M: 0.50,
    maxContextTokens: 128000,
    maxOutputTokens: 8192,
    reasoningScore: 7,
    writingScore: 8,
    codingScore: 7,
    speedScore: 8,
    category: 'budget',
    description: 'Chinese frontier model, strong multilingual'
  },
  {
    modelId: 'z-ai/glm-4-flash',
    name: 'GLM 4 Flash',
    provider: 'zhipu',
    apiSource: 'openrouter',
    inputCostPer1M: 0.014,
    outputCostPer1M: 0.014,
    maxContextTokens: 128000,
    maxOutputTokens: 8192,
    reasoningScore: 6,
    writingScore: 6,
    codingScore: 5,
    speedScore: 10,
    category: 'free',
    description: 'Ultra-fast and cheap, good for simple tasks'
  },

  // Qwen Series (via OpenRouter)
  {
    modelId: 'qwen/qwen-3-coder',
    name: 'Qwen 3 Coder',
    provider: 'alibaba',
    apiSource: 'openrouter',
    inputCostPer1M: 0.07,
    outputCostPer1M: 1.10,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 7,
    writingScore: 6,
    codingScore: 9,
    speedScore: 9,
    category: 'budget',
    description: 'Best budget coding model, great for technical content'
  },
  {
    modelId: 'qwen/qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B Instruct',
    provider: 'alibaba',
    apiSource: 'openrouter',
    inputCostPer1M: 0.35,
    outputCostPer1M: 0.40,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 8,
    speedScore: 8,
    category: 'budget',
    description: 'Strong all-around model, great value'
  },
  {
    modelId: 'qwen/qwen-2.5-7b-instruct',
    name: 'Qwen 2.5 7B Instruct',
    provider: 'alibaba',
    apiSource: 'openrouter',
    inputCostPer1M: 0.015,
    outputCostPer1M: 0.015,
    maxContextTokens: 32768,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 6,
    codingScore: 5,
    speedScore: 10,
    category: 'free',
    description: 'Very cheap, good for simple content'
  },
  {
    modelId: 'qwen/qwq-32b-preview',
    name: 'QwQ 32B Preview',
    provider: 'alibaba',
    apiSource: 'openrouter',
    inputCostPer1M: 0.12,
    outputCostPer1M: 0.18,
    maxContextTokens: 32768,
    maxOutputTokens: 16384,
    reasoningScore: 8,
    writingScore: 7,
    codingScore: 8,
    speedScore: 7,
    category: 'budget',
    isReasoningModel: true,
    description: 'Open-source reasoning model, good for analysis'
  },

  // MiniMax Series (via OpenRouter)
  {
    modelId: 'minimax/minimax-m2.1',
    name: 'MiniMax M2.1',
    provider: 'minimax',
    apiSource: 'openrouter',
    inputCostPer1M: 0.20,
    outputCostPer1M: 0.20,
    maxContextTokens: 65536,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 9,
    speedScore: 8,
    category: 'budget',
    description: '10B activated params, 72.5% SWE-Bench, ultra-low cost'
  },

  // ByteDance Seed Series (via OpenRouter)
  {
    modelId: 'bytedance/seed-1.6',
    name: 'Seed 1.6',
    provider: 'bytedance',
    apiSource: 'openrouter',
    inputCostPer1M: 0.80,
    outputCostPer1M: 2.40,
    maxContextTokens: 256000,
    maxOutputTokens: 16384,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 7,
    speedScore: 7,
    category: 'standard',
    isReasoningModel: true,
    isMultimodal: true,
    description: 'Adaptive deep thinking, video understanding'
  },

  // NVIDIA Nemotron Series (via OpenRouter)
  {
    modelId: 'nvidia/nemotron-3-nano',
    name: 'Nemotron 3 Nano',
    provider: 'nvidia',
    apiSource: 'openrouter',
    inputCostPer1M: 0.02,
    outputCostPer1M: 0.02,
    maxContextTokens: 256000,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 6,
    codingScore: 5,
    speedScore: 10,
    category: 'free',
    description: '30B MoE for agentic AI, fully open, 256K context'
  },
  {
    modelId: 'nvidia/nemotron-4-340b-instruct',
    name: 'Nemotron 4 340B Instruct',
    provider: 'nvidia',
    apiSource: 'openrouter',
    inputCostPer1M: 0.80,
    outputCostPer1M: 0.80,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 7,
    speedScore: 7,
    category: 'standard',
    description: 'NVIDIA flagship, great for enterprise content'
  },

  // ==================== FREE MODELS ====================
  // Xiaomi MiMo Series
  {
    modelId: 'xiaomi/mimo-v2-flash',
    name: 'MiMo-V2-Flash',
    provider: 'xiaomi',
    apiSource: 'openrouter',
    inputCostPer1M: 0.035,
    outputCostPer1M: 0.035,
    maxContextTokens: 256000,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 8,
    speedScore: 9,
    category: 'free',
    isFeatured: true,
    description: '309B MoE, matches Claude Sonnet 4.5 at 3.5% cost, 256K context'
  },

  // AllenAI OLMo Series
  {
    modelId: 'allenai/olmo-3.1-32b-think',
    name: 'OLMo 3.1 32B Think',
    provider: 'allenai',
    apiSource: 'openrouter',
    inputCostPer1M: 0.10,
    outputCostPer1M: 0.15,
    maxContextTokens: 131072,
    maxOutputTokens: 16384,
    reasoningScore: 7,
    writingScore: 7,
    codingScore: 6,
    speedScore: 8,
    category: 'budget',
    isReasoningModel: true,
    description: 'Open-source reasoning, Apache 2.0, full transparency'
  },
  {
    modelId: 'allenai/olmo-2-32b-instruct',
    name: 'OLMo 2 32B Instruct',
    provider: 'allenai',
    apiSource: 'openrouter',
    inputCostPer1M: 0.08,
    outputCostPer1M: 0.08,
    maxContextTokens: 131072,
    maxOutputTokens: 4096,
    reasoningScore: 7,
    writingScore: 7,
    codingScore: 6,
    speedScore: 9,
    category: 'budget',
    description: 'Fully open-source, great for transparency'
  },

  // DeepSeek Nex Series
  {
    modelId: 'deepseek/deepseek-v3.1-nex-n1',
    name: 'DeepSeek V3.1 Nex-N1',
    provider: 'deepseek',
    apiSource: 'openrouter',
    inputCostPer1M: 0.03,
    outputCostPer1M: 0.05,
    maxContextTokens: 64000,
    maxOutputTokens: 8192,
    reasoningScore: 7,
    writingScore: 7,
    codingScore: 8,
    speedScore: 9,
    category: 'free',
    description: 'Post-trained for agent autonomy, strong coding'
  },

  // Yi Series (01.AI)
  {
    modelId: '01-ai/yi-large',
    name: 'Yi Large',
    provider: '01ai',
    apiSource: 'openrouter',
    inputCostPer1M: 0.70,
    outputCostPer1M: 0.80,
    maxContextTokens: 32768,
    maxOutputTokens: 4096,
    reasoningScore: 7,
    writingScore: 8,
    codingScore: 6,
    speedScore: 9,
    category: 'budget',
    description: 'Strong bilingual (EN/CN), good for international content'
  },
  {
    modelId: '01-ai/yi-34b-chat',
    name: 'Yi 34B Chat',
    provider: '01ai',
    apiSource: 'openrouter',
    inputCostPer1M: 0.19,
    outputCostPer1M: 0.19,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 6,
    writingScore: 7,
    codingScore: 5,
    speedScore: 9,
    category: 'budget',
    description: 'Affordable bilingual model'
  },

  // Command R Series (Cohere)
  {
    modelId: 'cohere/command-r-plus',
    name: 'Command R Plus',
    provider: 'cohere',
    apiSource: 'openrouter',
    inputCostPer1M: 2.50,
    outputCostPer1M: 10.00,
    maxContextTokens: 128000,
    maxOutputTokens: 4096,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 6,
    speedScore: 8,
    category: 'standard',
    supportsTools: true,
    description: 'Best for RAG and tool use, great for research-backed content'
  },
  {
    modelId: 'cohere/command-r',
    name: 'Command R',
    provider: 'cohere',
    apiSource: 'openrouter',
    inputCostPer1M: 0.50,
    outputCostPer1M: 1.50,
    maxContextTokens: 128000,
    maxOutputTokens: 4096,
    reasoningScore: 7,
    writingScore: 7,
    codingScore: 5,
    speedScore: 9,
    category: 'budget',
    supportsTools: true,
    description: 'Affordable RAG model with tool support'
  },
  {
    modelId: 'cohere/command',
    name: 'Command',
    provider: 'cohere',
    apiSource: 'openrouter',
    inputCostPer1M: 1.00,
    outputCostPer1M: 2.00,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 6,
    writingScore: 8,
    codingScore: 4,
    speedScore: 9,
    category: 'budget',
    description: 'Cohere flagship, great for business writing'
  },

  // Phi Series (Microsoft)
  {
    modelId: 'microsoft/phi-4',
    name: 'Phi-4',
    provider: 'microsoft',
    apiSource: 'openrouter',
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    maxContextTokens: 16384,
    maxOutputTokens: 4096,
    reasoningScore: 7,
    writingScore: 7,
    codingScore: 7,
    speedScore: 10,
    category: 'budget',
    description: '14B params, punches above weight, great for concise content'
  },
  {
    modelId: 'microsoft/phi-3.5-mini-128k-instruct',
    name: 'Phi-3.5 Mini 128K',
    provider: 'microsoft',
    apiSource: 'openrouter',
    inputCostPer1M: 0.10,
    outputCostPer1M: 0.10,
    maxContextTokens: 128000,
    maxOutputTokens: 4096,
    reasoningScore: 6,
    writingScore: 6,
    codingScore: 5,
    speedScore: 10,
    category: 'budget',
    description: 'Tiny but mighty, 128K context'
  },

  // Gemma Series (Google)
  {
    modelId: 'google/gemma-2-27b-it',
    name: 'Gemma 2 27B IT',
    provider: 'google',
    apiSource: 'openrouter',
    inputCostPer1M: 0.07,
    outputCostPer1M: 0.07,
    maxContextTokens: 8192,
    maxOutputTokens: 4096,
    reasoningScore: 6,
    writingScore: 7,
    codingScore: 6,
    speedScore: 10,
    category: 'budget',
    description: 'Open Google model, efficient and capable'
  },
  {
    modelId: 'google/gemma-2-9b-it',
    name: 'Gemma 2 9B IT',
    provider: 'google',
    apiSource: 'openrouter',
    inputCostPer1M: 0.03,
    outputCostPer1M: 0.03,
    maxContextTokens: 8192,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 6,
    codingScore: 5,
    speedScore: 10,
    category: 'free',
    description: 'Small but efficient, very affordable'
  },

  // ==================== SPECIALIZED MODELS ====================
  // Hermes Series (Nous Research)
  {
    modelId: 'nousresearch/hermes-3-llama-3.1-405b',
    name: 'Hermes 3 Llama 405B',
    provider: 'nous',
    apiSource: 'openrouter',
    inputCostPer1M: 2.00,
    outputCostPer1M: 2.00,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 9,
    writingScore: 9,
    codingScore: 8,
    speedScore: 6,
    category: 'standard',
    description: 'Fine-tuned Llama 405B, excellent for creative writing'
  },
  {
    modelId: 'nousresearch/hermes-3-llama-3.1-70b',
    name: 'Hermes 3 Llama 70B',
    provider: 'nous',
    apiSource: 'openrouter',
    inputCostPer1M: 0.35,
    outputCostPer1M: 0.40,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 9,
    codingScore: 7,
    speedScore: 8,
    category: 'budget',
    description: 'Fine-tuned for creative and professional writing'
  },

  // Solar Series (Upstage)
  {
    modelId: 'upstage/solar-10.7b-instruct',
    name: 'Solar 10.7B Instruct',
    provider: 'upstage',
    apiSource: 'openrouter',
    inputCostPer1M: 0.10,
    outputCostPer1M: 0.10,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 6,
    writingScore: 7,
    codingScore: 5,
    speedScore: 10,
    category: 'budget',
    description: 'Korean model, great for concise content'
  },

  // Kimi Series (Moonshot)
  {
    modelId: 'moonshot/kimi-2.5-agent',
    name: 'Kimi K2.5 Agent',
    provider: 'moonshot',
    apiSource: 'openrouter',
    inputCostPer1M: 0.60,
    outputCostPer1M: 1.20,
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    reasoningScore: 8,
    writingScore: 8,
    codingScore: 7,
    speedScore: 8,
    category: 'standard',
    description: 'Agent swarm capabilities, great for complex tasks'
  },
  {
    modelId: 'moonshot/kimi-dev-72b',
    name: 'Kimi Dev 72B',
    provider: 'moonshot',
    apiSource: 'openrouter',
    inputCostPer1M: 0.35,
    outputCostPer1M: 0.40,
    maxContextTokens: 128000,
    maxOutputTokens: 8192,
    reasoningScore: 7,
    writingScore: 7,
    codingScore: 8,
    speedScore: 8,
    category: 'budget',
    description: 'Developer-focused, great for technical content'
  },

  // Aether Series
  {
    modelId: 'aether/aether-1b',
    name: 'Aether 1B',
    provider: 'aether',
    apiSource: 'openrouter',
    inputCostPer1M: 0.001,
    outputCostPer1M: 0.001,
    maxContextTokens: 2048,
    maxOutputTokens: 1024,
    reasoningScore: 3,
    writingScore: 4,
    codingScore: 2,
    speedScore: 10,
    category: 'free',
    description: 'Ultra-light, nearly free, for simplest tasks'
  },

  // GPT-4o Mini (OpenAI)
  {
    modelId: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    apiSource: 'openai',
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    maxContextTokens: 128000,
    maxOutputTokens: 16384,
    reasoningScore: 7,
    writingScore: 8,
    codingScore: 7,
    speedScore: 10,
    category: 'budget',
    isFeatured: true,
    description: 'Best budget OpenAI model, fast and capable'
  },
  {
    modelId: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    apiSource: 'openai',
    inputCostPer1M: 10.00,
    outputCostPer1M: 30.00,
    maxContextTokens: 128000,
    maxOutputTokens: 4096,
    reasoningScore: 8,
    writingScore: 9,
    codingScore: 8,
    speedScore: 7,
    category: 'premium',
    description: 'Previous generation flagship, still excellent'
  },
  {
    modelId: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    apiSource: 'openai',
    inputCostPer1M: 0.50,
    outputCostPer1M: 1.50,
    maxContextTokens: 16384,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 6,
    codingScore: 5,
    speedScore: 10,
    category: 'budget',
    description: 'Classic budget model, fast and reliable'
  },

  // WizardLM Series
  {
    modelId: 'microsoft/wizardlm-2-8x22b',
    name: 'WizardLM 2 8x22B',
    provider: 'microsoft',
    apiSource: 'openrouter',
    inputCostPer1M: 0.55,
    outputCostPer1M: 0.55,
    maxContextTokens: 65536,
    maxOutputTokens: 4096,
    reasoningScore: 7,
    writingScore: 8,
    codingScore: 7,
    speedScore: 8,
    category: 'budget',
    description: 'MoE architecture, good for diverse content'
  },
  {
    modelId: 'microsoft/wizardlm-2-7b',
    name: 'WizardLM 2 7B',
    provider: 'microsoft',
    apiSource: 'openrouter',
    inputCostPer1M: 0.035,
    outputCostPer1M: 0.035,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 6,
    codingScore: 5,
    speedScore: 10,
    category: 'free',
    description: 'Small WizardLM, very affordable'
  },

  // OpenChat Series
  {
    modelId: 'openchat/openchat-7b',
    name: 'OpenChat 7B',
    provider: 'openchat',
    apiSource: 'openrouter',
    inputCostPer1M: 0.03,
    outputCostPer1M: 0.03,
    maxContextTokens: 8192,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 6,
    codingScore: 4,
    speedScore: 10,
    category: 'free',
    description: 'Open-source chat model, good for basic content'
  },

  // Pygmalion Series
  {
    modelId: 'pygmalion-ai/mythalion-13b',
    name: 'Mythalion 13B',
    provider: 'pygmalion',
    apiSource: 'openrouter',
    inputCostPer1M: 0.07,
    outputCostPer1M: 0.07,
    maxContextTokens: 8192,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 7,
    codingScore: 3,
    speedScore: 9,
    category: 'budget',
    description: 'Creative writing focused, good for storytelling'
  },

  // Hugging Face Zephyr
  {
    modelId: 'huggingfaceh4/zephyr-7b-beta',
    name: 'Zephyr 7B Beta',
    provider: 'huggingface',
    apiSource: 'openrouter',
    inputCostPer1M: 0.035,
    outputCostPer1M: 0.035,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 6,
    codingScore: 4,
    speedScore: 10,
    category: 'free',
    description: 'HuggingFace alignment, good for conversational content'
  },

  // Teknium OpenHermes
  {
    modelId: 'teknium/openhermes-2.5-mistral-7b',
    name: 'OpenHermes 2.5 Mistral 7B',
    provider: 'teknium',
    apiSource: 'openrouter',
    inputCostPer1M: 0.016,
    outputCostPer1M: 0.016,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 6,
    codingScore: 4,
    speedScore: 10,
    category: 'free',
    description: 'Fine-tuned Mistral, good for general content'
  },

  // Intel Neural Chat
  {
    modelId: 'intel/neural-chat-7b',
    name: 'Neural Chat 7B',
    provider: 'intel',
    apiSource: 'openrouter',
    inputCostPer1M: 0.02,
    outputCostPer1M: 0.02,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 4,
    writingScore: 5,
    codingScore: 3,
    speedScore: 10,
    category: 'free',
    description: 'Intel optimized, efficient inference'
  },

  // Cognitive Computations Dolphin
  {
    modelId: 'cognitivecomputations/dolphin-mixtral-8x7b',
    name: 'Dolphin Mixtral 8x7B',
    provider: 'cognitive',
    apiSource: 'openrouter',
    inputCostPer1M: 0.24,
    outputCostPer1M: 0.24,
    maxContextTokens: 32768,
    maxOutputTokens: 4096,
    reasoningScore: 6,
    writingScore: 7,
    codingScore: 6,
    speedScore: 9,
    category: 'budget',
    description: 'Uncensored Mixtral, good for unrestricted content'
  },

  // Sao10K Series
  {
    modelId: 'sao10k/fimbulvetr-11b-v2',
    name: 'Fimbulvetr 11B V2',
    provider: 'sao10k',
    apiSource: 'openrouter',
    inputCostPer1M: 0.055,
    outputCostPer1M: 0.055,
    maxContextTokens: 8192,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 6,
    codingScore: 4,
    speedScore: 10,
    category: 'free',
    description: 'Roleplay focused, creative writing'
  },

  // Undi95 Series
  {
    modelId: 'undi95/toppy-m-7b',
    name: 'Toppy M 7B',
    provider: 'undi95',
    apiSource: 'openrouter',
    inputCostPer1M: 0.03,
    outputCostPer1M: 0.03,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 4,
    writingScore: 6,
    codingScore: 3,
    speedScore: 10,
    category: 'free',
    description: 'Creative writing focused'
  },

  // Gryphe Mythomax
  {
    modelId: 'gryphe/mythomax-l2-13b',
    name: 'MythoMax L2 13B',
    provider: 'gryphe',
    apiSource: 'openrouter',
    inputCostPer1M: 0.07,
    outputCostPer1M: 0.07,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 7,
    codingScore: 3,
    speedScore: 9,
    category: 'budget',
    description: 'Storytelling focused, good for narrative content'
  },

  // Neversleep Series
  {
    modelId: 'neversleep/noromaid-mixtral-8x7b-instruct',
    name: 'Noromaid Mixtral 8x7B',
    provider: 'neversleep',
    apiSource: 'openrouter',
    inputCostPer1M: 0.24,
    outputCostPer1M: 0.24,
    maxContextTokens: 8000,
    maxOutputTokens: 4096,
    reasoningScore: 6,
    writingScore: 7,
    codingScore: 5,
    speedScore: 9,
    category: 'budget',
    description: 'Uncensored, good for unrestricted content'
  },

  // Snowflake Arctic
  {
    modelId: 'snowflake/arctic-instruct',
    name: 'Arctic Instruct',
    provider: 'snowflake',
    apiSource: 'openrouter',
    inputCostPer1M: 0.28,
    outputCostPer1M: 0.28,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 7,
    writingScore: 7,
    codingScore: 6,
    speedScore: 9,
    category: 'budget',
    description: 'Enterprise-focused, good for business content'
  },

  // Inflection Pi
  {
    modelId: 'inflection/pi',
    name: 'Pi',
    provider: 'inflection',
    apiSource: 'openrouter',
    inputCostPer1M: 0.50,
    outputCostPer1M: 0.50,
    maxContextTokens: 8000,
    maxOutputTokens: 4096,
    reasoningScore: 6,
    writingScore: 8,
    codingScore: 4,
    speedScore: 9,
    category: 'budget',
    description: 'Emotionally intelligent, great for empathetic content'
  },

  // Adept Persimmon
  {
    modelId: 'adept/persimmon-8b-chat',
    name: 'Persimmon 8B Chat',
    provider: 'adept',
    apiSource: 'openrouter',
    inputCostPer1M: 0.03,
    outputCostPer1M: 0.03,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 4,
    writingScore: 5,
    codingScore: 3,
    speedScore: 10,
    category: 'free',
    description: 'Adept AI model, efficient'
  },

  // Together Computer
  {
    modelId: 'togethercomputer/stripedhyena-nous-7b',
    name: 'StripedHyena Nous 7B',
    provider: 'together',
    apiSource: 'openrouter',
    inputCostPer1M: 0.03,
    outputCostPer1M: 0.03,
    maxContextTokens: 32768,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 6,
    codingScore: 4,
    speedScore: 10,
    category: 'free',
    description: 'Alternative architecture, long context'
  },

  // Databricks Dolly
  {
    modelId: 'databricks/dolly-v2-12b',
    name: 'Dolly V2 12B',
    provider: 'databricks',
    apiSource: 'openrouter',
    inputCostPer1M: 0.05,
    outputCostPer1M: 0.05,
    maxContextTokens: 2048,
    maxOutputTokens: 1024,
    reasoningScore: 4,
    writingScore: 5,
    codingScore: 3,
    speedScore: 10,
    category: 'free',
    description: 'Instruction following, open-source'
  },

  // TII Falcon
  {
    modelId: 'tiiuae/falcon-180b-chat',
    name: 'Falcon 180B Chat',
    provider: 'tii',
    apiSource: 'openrouter',
    inputCostPer1M: 0.90,
    outputCostPer1M: 0.90,
    maxContextTokens: 2048,
    maxOutputTokens: 1024,
    reasoningScore: 7,
    writingScore: 7,
    codingScore: 6,
    speedScore: 7,
    category: 'standard',
    description: 'Large open model, good for research'
  },
  {
    modelId: 'tiiuae/falcon-7b-instruct',
    name: 'Falcon 7B Instruct',
    provider: 'tii',
    apiSource: 'openrouter',
    inputCostPer1M: 0.02,
    outputCostPer1M: 0.02,
    maxContextTokens: 2048,
    maxOutputTokens: 1024,
    reasoningScore: 4,
    writingScore: 5,
    codingScore: 3,
    speedScore: 10,
    category: 'free',
    description: 'Lightweight Falcon, very affordable'
  },

  // Stability AI
  {
    modelId: 'stability-ai/sdxl-turbo',
    name: 'SDXL Turbo',
    provider: 'stability',
    apiSource: 'openrouter',
    inputCostPer1M: 0.05,
    outputCostPer1M: 0.05,
    maxContextTokens: 2048,
    maxOutputTokens: 1024,
    reasoningScore: 3,
    writingScore: 4,
    codingScore: 2,
    speedScore: 10,
    category: 'free',
    description: 'Image generation focused, text capabilities limited'
  },

  // Additional Premium Models
  {
    modelId: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    apiSource: 'openrouter',
    inputCostPer1M: 15.00,
    outputCostPer1M: 75.00,
    maxContextTokens: 200000,
    maxOutputTokens: 4096,
    reasoningScore: 9,
    writingScore: 10,
    codingScore: 9,
    speedScore: 5,
    category: 'premium',
    isMultimodal: true,
    description: 'Previous Anthropic flagship, still excellent for writing'
  },
  {
    modelId: 'anthropic/claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    apiSource: 'openrouter',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    maxContextTokens: 200000,
    maxOutputTokens: 4096,
    reasoningScore: 8,
    writingScore: 9,
    codingScore: 8,
    speedScore: 8,
    category: 'standard',
    isMultimodal: true,
    description: 'Balanced Claude 3, great for professional content'
  },
  {
    modelId: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    apiSource: 'openrouter',
    inputCostPer1M: 0.25,
    outputCostPer1M: 1.25,
    maxContextTokens: 200000,
    maxOutputTokens: 4096,
    reasoningScore: 6,
    writingScore: 7,
    codingScore: 6,
    speedScore: 10,
    category: 'budget',
    isMultimodal: true,
    description: 'Fast Claude, great for high-volume content'
  },
];

async function main() {
  console.log('Seeding AI models...');
  
  let created = 0;
  let updated = 0;
  
  for (const model of AI_MODELS) {
    try {
      const existing = await prisma.aIModel.findUnique({
        where: { modelId: model.modelId }
      });
      
      if (existing) {
        await prisma.aIModel.update({
          where: { modelId: model.modelId },
          data: {
            ...model,
            lastUpdated: new Date()
          }
        });
        updated++;
      } else {
        await prisma.aIModel.create({
          data: model
        });
        created++;
      }
    } catch (error) {
      console.error(`Error seeding model ${model.modelId}:`, error.message);
    }
  }
  
  console.log(`Seeding complete! Created: ${created}, Updated: ${updated}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

```

---

### seed-extension-version.js

```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial extension version...');
  
  // Add initial version
  const version = await prisma.extensionVersion.upsert({
    where: { version: '1.3.4' },
    update: {},
    create: {
      version: '1.3.4',
      features: [
        'AI-powered comment generation',
        'Scheduled post automation',
        'Network growth tools',
        'Business hours scheduling',
        'Live import history updates',
        'Profile URL persistence',
        'Dashboard scheduled posts display'
      ],
      bug_fixes: [
        'Fixed scheduled posts reliability',
        'Improved tab switching for posting',
        'Fixed import tab live updates',
        'Enhanced dashboard visibility'
      ],
      download_url: '',
      release_notes: 'Current stable release with all core features and improvements',
      is_active: true
    }
  });

  console.log('Created/updated version:', version);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

```

---

### seed.js

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default plans
  console.log('Creating plans...');
  
  const freePlan = await prisma.plan.upsert({
    where: { name: 'Free' },
    update: {},
    create: {
      name: 'Free',
      price: 0,
      dailyComments: 10,
      dailyLikes: 20,
      dailyShares: 5,
      dailyFollows: 10,
      dailyConnections: 5,
      aiPostsPerDay: 2,
      aiCommentsPerDay: 10,
      allowAiPostGeneration: true,
      allowAiCommentGeneration: true,
      allowPostScheduling: false,
      allowAutomation: true,
      allowAutomationScheduling: false,
      allowNetworking: false,
      allowNetworkScheduling: false,
      allowCsvExport: false,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { name: 'Pro' },
    update: {},
    create: {
      name: 'Pro',
      price: 29.99,
      dailyComments: 50,
      dailyLikes: 100,
      dailyShares: 20,
      dailyFollows: 50,
      dailyConnections: 30,
      aiPostsPerDay: 10,
      aiCommentsPerDay: 50,
      allowAiPostGeneration: true,
      allowAiCommentGeneration: true,
      allowPostScheduling: true,
      allowAutomation: true,
      allowAutomationScheduling: true,
      allowNetworking: true,
      allowNetworkScheduling: true,
      allowCsvExport: true,
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { name: 'Enterprise' },
    update: {},
    create: {
      name: 'Enterprise',
      price: 99.99,
      dailyComments: 200,
      dailyLikes: 500,
      dailyShares: 100,
      dailyFollows: 200,
      dailyConnections: 100,
      aiPostsPerDay: 50,
      aiCommentsPerDay: 200,
      allowAiPostGeneration: true,
      allowAiCommentGeneration: true,
      allowPostScheduling: true,
      allowAutomation: true,
      allowAutomationScheduling: true,
      allowNetworking: true,
      allowNetworkScheduling: true,
      allowCsvExport: true,
    },
  });

  console.log('✅ Plans created:', { freePlan: freePlan.name, proPlan: proPlan.name, enterprisePlan: enterprisePlan.name });

  // Create admin user
  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash('Admin@123456', 10);
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@linkedin-automation.com' },
    update: {},
    create: {
      email: 'admin@linkedin-automation.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });

  console.log('✅ Admin user created:', admin.email);
  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Default Admin Credentials:');
  console.log('   Email: admin@linkedin-automation.com');
  console.log('   Password: Admin@123456');
  console.log('\n⚠️  IMPORTANT: Change these credentials in production!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

```

---

