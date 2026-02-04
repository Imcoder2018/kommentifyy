-- AlterTable
ALTER TABLE "ApiUsage" ADD COLUMN     "importProfiles" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "monthlyImportCredits" INTEGER NOT NULL DEFAULT 100;
