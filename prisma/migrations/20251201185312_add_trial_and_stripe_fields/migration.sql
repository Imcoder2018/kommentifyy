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
