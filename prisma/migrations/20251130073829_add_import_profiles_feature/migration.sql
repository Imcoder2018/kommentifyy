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
