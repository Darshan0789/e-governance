-- =============================================================================
-- REQUIRED if uploads fail with: new row violates row-level security policy
-- Supabase Storage evaluates RLS as role "public"; policies "TO authenticated"
-- often do NOT apply. Use "TO public" + auth.uid() checks instead.
-- Run the whole script in: Dashboard → SQL Editor → Run
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('application-documents', 'application-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Remove previous variants (safe to run multiple times)
DROP POLICY IF EXISTS "application_documents_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "application_documents_select_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "application_documents_insert_owner_path" ON storage.objects;
DROP POLICY IF EXISTS "application_documents_select_logged_in" ON storage.objects;

-- INSERT: only logged-in users; first path segment must be their user UUID (matches the app)
CREATE POLICY "application_documents_insert_owner_path"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'application-documents'
  AND auth.uid() IS NOT NULL
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- SELECT: any logged-in user can read (citizens + officers; officers need this to open citizen files)
CREATE POLICY "application_documents_select_logged_in"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'application-documents'
  AND auth.uid() IS NOT NULL
);
