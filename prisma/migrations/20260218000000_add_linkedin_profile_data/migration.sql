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
