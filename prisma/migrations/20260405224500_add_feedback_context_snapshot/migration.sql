ALTER TABLE "feedback_submissions"
ADD COLUMN IF NOT EXISTS "context_snapshot" JSONB;
