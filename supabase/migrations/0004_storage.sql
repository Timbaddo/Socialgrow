-- =========================================================
-- SocialGrow — Storage bucket for proof screenshots (private)
-- Path convention: proofs/{user_id}/{task_id}/{filename}
-- =========================================================

insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', false)
on conflict (id) do nothing;

-- users can upload only into their own folder
create policy "users upload own proof screenshots"
  on storage.objects for insert
  with check (
    bucket_id = 'proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- users can view only their own screenshots
create policy "users view own proof screenshots"
  on storage.objects for select
  using (
    bucket_id = 'proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- admins can view all proof screenshots (via signed URL from the admin app)
create policy "admins view all proof screenshots"
  on storage.objects for select
  using (
    bucket_id = 'proofs'
    and public.is_admin()
  );

-- users can delete their own (e.g. replace before submit)
create policy "users delete own proof screenshots"
  on storage.objects for delete
  using (
    bucket_id = 'proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
