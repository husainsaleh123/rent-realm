-- Private contract storage. Run once in the Supabase SQL Editor.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tenant-contracts',
  'tenant-contracts',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users upload their own tenant contracts" on storage.objects;
create policy "Users upload their own tenant contracts"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'tenant-contracts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users read their own tenant contracts" on storage.objects;
create policy "Users read their own tenant contracts"
on storage.objects for select
to authenticated
using (
  bucket_id = 'tenant-contracts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users delete their own tenant contracts" on storage.objects;
create policy "Users delete their own tenant contracts"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'tenant-contracts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
