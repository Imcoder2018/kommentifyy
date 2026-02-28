-- Migration: Add AdminAIModelSettings table
-- Created: 2026-02-28

-- Create AdminAIModelSettings table
CREATE TABLE "AdminAIModelSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    "postModelId" TEXT NOT NULL DEFAULT 'anthropic/claude-sonnet-4.5',
    "hookModelId" TEXT NOT NULL DEFAULT 'anthropic/claude-sonnet-4.5',
    "commentModelId" TEXT NOT NULL DEFAULT 'anthropic/claude-sonnet-4.5',
    "topicModelId" TEXT NOT NULL DEFAULT 'anthropic/claude-sonnet-4.5',
    "chatbotModelId" TEXT NOT NULL DEFAULT 'gpt-4o',
    "fallbackModelId" TEXT NOT NULL DEFAULT 'anthropic/claude-sonnet-4.5',
    "allowUserModelSelection" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX "AdminAIModelSettings_postModelId_idx" ON "AdminAIModelSettings"("postModelId");
CREATE INDEX "AdminAIModelSettings_commentModelId_idx" ON "AdminAIModelSettings"("commentModelId");

-- Insert default settings
INSERT INTO "AdminAIModelSettings" ("id", "postModelId", "hookModelId", "commentModelId", "topicModelId", "chatbotModelId", "fallbackModelId", "allowUserModelSelection", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'anthropic/claude-sonnet-4.5', 'anthropic/claude-sonnet-4.5', 'anthropic/claude-sonnet-4.5', 'anthropic/claude-sonnet-4.5', 'gpt-4o', 'anthropic/claude-sonnet-4.5', false, now(), now());
