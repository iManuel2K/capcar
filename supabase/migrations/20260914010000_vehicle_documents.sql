-- Private evidence: never projected into public Passport payloads.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vehicle-documents', 'vehicle-documents', false, 10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "vehicle_documents_owner_read" on storage.objects
for select to authenticated using (
  bucket_id = 'vehicle-documents' and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "vehicle_documents_owner_insert" on storage.objects
for insert to authenticated with check (
  bucket_id = 'vehicle-documents' and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "vehicle_documents_owner_delete" on storage.objects
for delete to authenticated using (
  bucket_id = 'vehicle-documents' and (storage.foldername(name))[1] = (select auth.uid())::text
);
