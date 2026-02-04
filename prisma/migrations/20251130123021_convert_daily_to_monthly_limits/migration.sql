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
