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
