-- HOW TO USE (important):
-- 1. Open THIS file in your editor (or Notepad).
-- 2. Select ALL text from the first INSERT down to the last semicolon.
-- 3. Paste into Supabase Dashboard -> SQL Editor.
-- 4. Click RUN.
--
-- Do NOT paste the filename or path (e.g. do not paste "e-governance/...") into SQL Editor.
-- Only paste the SQL commands below.

INSERT INTO storage.buckets (id, name, public)
VALUES ('application-documents', 'application-documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "application_documents_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "application_documents_select_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "application_documents_insert_owner_path" ON storage.objects;
DROP POLICY IF EXISTS "application_documents_select_logged_in" ON storage.objects;

CREATE POLICY "application_documents_insert_owner_path"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'application-documents'
  AND auth.uid() IS NOT NULL
  AND split_part(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "application_documents_select_logged_in"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'application-documents'
  AND auth.uid() IS NOT NULL
);
