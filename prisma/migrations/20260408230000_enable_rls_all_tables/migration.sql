-- Enable Row Level Security on all tables
-- The app uses service_role key (bypasses RLS), so this only protects against
-- direct access via anon key. No existing functionality is affected.

-- Enable RLS
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "spirits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "blessings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "spirit_statuses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "blessing_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "feedback_submissions" ENABLE ROW LEVEL SECURITY;

-- blessing_items: public read (needed for displaying blessing options)
CREATE POLICY "blessing_items_public_read" ON "blessing_items"
  FOR SELECT USING (true);

-- All other tables: deny anon access by default
-- Service role key bypasses RLS, so API routes continue working unchanged
-- If future client-side Supabase access is needed, add specific policies then
