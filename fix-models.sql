-- Fix model IDs from z.ai to z-ai format
UPDATE "AIModel" SET "modelId" = REPLACE("modelId", 'z.ai/', 'z-ai/') WHERE "modelId" LIKE 'z.ai/%';
UPDATE "UserAIModelSettings" SET "commentModelId" = REPLACE("commentModelId", 'z.ai/', 'z-ai/') WHERE "commentModelId" LIKE 'z.ai/%';
UPDATE "UserAIModelSettings" SET "postModelId" = REPLACE("postModelId", 'z.ai/', 'z-ai/') WHERE "postModelId" LIKE 'z.ai/%';
UPDATE "UserAIModelSettings" SET "topicModelId" = REPLACE("topicModelId", 'z.ai/', 'z-ai/') WHERE "topicModelId" LIKE 'z.ai/%';
UPDATE "UserAIModelSettings" SET "fallbackModelId" = REPLACE("fallbackModelId", 'z.ai/', 'z-ai/') WHERE "fallbackModelId" LIKE 'z.ai/%';
UPDATE "AIModelUsage" SET "modelId" = REPLACE("modelId", 'z.ai/', 'z-ai/') WHERE "modelId" LIKE 'z.ai/%';

-- Fix invalid model IDs (gpt-5.2-pro doesn't exist, use claude-sonnet-4.5)
UPDATE "UserAIModelSettings" SET "commentModelId" = 'anthropic/claude-sonnet-4.5' WHERE "commentModelId" LIKE '%gpt-5%' OR "commentModelId" LIKE '%gpt-4.5%' OR "commentModelId" = 'openai/gpt-5.2-pro';
UPDATE "UserAIModelSettings" SET "postModelId" = 'anthropic/claude-sonnet-4.5' WHERE "postModelId" LIKE '%gpt-5%' OR "postModelId" LIKE '%gpt-4.5%' OR "postModelId" = 'openai/gpt-5.2-pro';
UPDATE "UserAIModelSettings" SET "topicModelId" = 'anthropic/claude-sonnet-4.5' WHERE "topicModelId" LIKE '%gpt-5%' OR "topicModelId" LIKE '%gpt-4.5%' OR "topicModelId" = 'openai/gpt-5.2-pro';

-- Set default fallback to Claude Sonnet 4.5
UPDATE "UserAIModelSettings" SET "fallbackModelId" = 'anthropic/claude-sonnet-4.5' WHERE "fallbackModelId" IS NULL OR "fallbackModelId" = 'openai/gpt-4o-mini';
