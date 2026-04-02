-- Fix "new row violates row-level security policy" when submitting applications with documents.
-- Run this in Supabase SQL Editor (or apply via supabase db push) if citizens cannot submit.

-- ---------------------------------------------------------------------------
-- APPLICATIONS: ensure authenticated users can INSERT their own rows
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can create own applications" ON public.applications;
DROP POLICY IF EXISTS "citizens_insert_own_applications" ON public.applications;

CREATE POLICY "citizens_insert_own_applications"
  ON public.applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Keep existing SELECT/UPDATE policies if present; re-add core citizen SELECT if missing
DROP POLICY IF EXISTS "Users can view own applications" ON public.applications;

CREATE POLICY "Users can view own applications"
  ON public.applications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- STORAGE: bucket + policies for application-documents
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('application-documents', 'application-documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "application_documents_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "application_documents_select_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "application_documents_insert_owner_path" ON storage.objects;
DROP POLICY IF EXISTS "application_documents_select_logged_in" ON storage.objects;

-- Storage RLS: TO public + auth.uid() (required for many Supabase Storage setups)
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
