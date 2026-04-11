CREATE TABLE IF NOT EXISTS "feedback_submissions" (
  "id" TEXT NOT NULL,
  "user_id" TEXT,
  "source" TEXT NOT NULL,
  "source_label" TEXT NOT NULL,
  "spirit_id" TEXT,
  "spirit_name" TEXT,
  "who" TEXT,
  "feeling" TEXT,
  "comeback" TEXT,
  "feature" TEXT,
  "wanted" TEXT,
  "price" TEXT,
  "share" TEXT,
  "other" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "feedback_submissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "feedback_submissions_created_at_idx"
ON "feedback_submissions"("created_at");

CREATE INDEX IF NOT EXISTS "feedback_submissions_source_created_at_idx"
ON "feedback_submissions"("source", "created_at");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'feedback_submissions_user_id_fkey'
      AND table_name = 'feedback_submissions'
  ) THEN
    ALTER TABLE "feedback_submissions"
    ADD CONSTRAINT "feedback_submissions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END $$;
