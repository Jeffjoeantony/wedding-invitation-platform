-- Optional invite media setup (run in Supabase SQL Editor if images don't load publicly).
-- Safe to re-run.
--
-- The app stores gallery + guest moments in the Storage bucket `invite-media`
-- (auto-created on first upload). DB jsonb columns are NOT required.
--
-- If invite pages can't load uploaded images, make the bucket public in the
-- Dashboard (Storage → invite-media → Public), or run the policy below.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invite-media',
  'invite-media',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read invite-media" ON storage.objects;
CREATE POLICY "Public read invite-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'invite-media');
