-- Add InfoFi reward fields to Tweet table
ALTER TABLE "Tweet" ADD COLUMN "rewardAmount" INTEGER DEFAULT 0;
ALTER TABLE "Tweet" ADD COLUMN "rewardType" VARCHAR(50) DEFAULT 'infofi_daily';

-- Add index for optimized daily usage queries
CREATE INDEX "Tweet_userId_createdAt_idx" ON "Tweet"("userId", "createdAt");

-- Update existing tweets to have default reward values
UPDATE "Tweet" SET "rewardAmount" = 0, "rewardType" = 'infofi_daily' WHERE "rewardAmount" IS NULL; 