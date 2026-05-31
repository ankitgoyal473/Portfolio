-- WARRen Research Files — Supabase Storage Setup
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)
--
-- Step 1: Create the warren-research storage bucket
-- Do this in Supabase Dashboard > Storage > New Bucket:
--   Name: warren-research
--   Public: No (private)
--   File size limit: 5 MB
--   Allowed MIME types: text/markdown, text/plain
--
-- Step 2: Run this RLS policy SQL in SQL Editor

-- Allow authenticated users to access only their own research files
-- Path structure: {user_id}/{symbol}/{YYYYMMDD}/{filename}
CREATE POLICY "warren_research_user_isolation"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'warren-research'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'warren-research'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
