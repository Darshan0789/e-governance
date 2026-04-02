-- Run this in Supabase SQL Editor if migrations are not applied automatically.
-- Creates a private bucket for citizen application uploads (PDF, images, Word).

insert into storage.buckets (id, name, public)
values ('application-documents', 'application-documents', false)
on conflict (id) do nothing;

drop policy if exists "application_documents_insert_authenticated" on storage.objects;
drop policy if exists "application_documents_select_authenticated" on storage.objects;
drop policy if exists "application_documents_insert_owner_path" on storage.objects;
drop policy if exists "application_documents_select_logged_in" on storage.objects;

-- Use TO public so Storage API passes RLS (see 20260403090000_storage_rls_public_role_application_documents.sql)
create policy "application_documents_insert_owner_path"
on storage.objects for insert
to public
with check (
  bucket_id = 'application-documents'
  and auth.uid() is not null
  and split_part(name, '/', 1) = auth.uid()::text
);

create policy "application_documents_select_logged_in"
on storage.objects for select
to public
using (
  bucket_id = 'application-documents'
  and auth.uid() is not null
);
