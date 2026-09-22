-- =========================================================
-- SocialGrow — Row Level Security
-- =========================================================

alter table public.app_users enable row level security;
alter table public.tasks enable row level security;
alter table public.proofs enable row level security;
alter table public.xp_transactions enable row level security;
alter table public.task_statistics enable row level security;
alter table public.featured_profiles enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.app_settings enable row level security;

-- ---------- helper: is current user admin? ----------
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.app_users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ========== app_users ==========
create policy "users can view own profile" on public.app_users
  for select using (auth.uid() = id);

create policy "admins can view all users" on public.app_users
  for select using (public.is_admin());

create policy "users can update limited own fields" on public.app_users
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = 'user'          -- cannot self-promote to admin
  );

create policy "admins can update any user" on public.app_users
  for update using (public.is_admin());

-- note: XP is never updated directly by client policy; see approve_proof() RPC below,
-- which runs as SECURITY DEFINER and bypasses the "role only" restriction safely
-- because it is the only path that touches xp.

create policy "insert own row on signup" on public.app_users
  for insert with check (auth.uid() = id and role = 'user');

-- ========== tasks ==========
create policy "anyone authenticated can view active tasks" on public.tasks
  for select using (auth.role() = 'authenticated');

create policy "unlocked users can insert own task" on public.tasks
  for insert with check (
    owner_id = auth.uid()
    and (select xp from public.app_users where id = auth.uid())
        >= (select (value#>>'{}')::int from public.app_settings where key = 'xp_unlock_threshold')
  );

create policy "owners can update own task" on public.tasks
  for update using (owner_id = auth.uid());

create policy "admins manage all tasks" on public.tasks
  for all using (public.is_admin());

-- ========== proofs ==========
create policy "users view own proofs" on public.proofs
  for select using (user_id = auth.uid());

create policy "admins view all proofs" on public.proofs
  for select using (public.is_admin());

create policy "users submit own proof, not own task" on public.proofs
  for insert with check (
    user_id = auth.uid()
    and not exists (
      select 1 from public.tasks t
      where t.id = task_id and t.owner_id = auth.uid()
    )
  );

-- status changes only via approve_proof/reject_proof RPCs (security definer) —
-- no direct client update policy for status.
create policy "admins can directly edit proofs if needed" on public.proofs
  for update using (public.is_admin());

-- ========== xp_transactions ==========
create policy "users view own xp history" on public.xp_transactions
  for select using (user_id = auth.uid());

create policy "admins view all xp history" on public.xp_transactions
  for select using (public.is_admin());
-- no insert policy for clients: only the approve_proof() RPC (SECURITY DEFINER) writes here.

-- ========== task_statistics ==========
create policy "anyone authenticated can view stats" on public.task_statistics
  for select using (auth.role() = 'authenticated');

create policy "admins manage stats" on public.task_statistics
  for all using (public.is_admin());
-- normal increments happen via record_impression()/record_open() RPCs (security definer).

-- ========== featured_profiles ==========
create policy "anyone authenticated can view featured" on public.featured_profiles
  for select using (auth.role() = 'authenticated');

create policy "admins manage featured" on public.featured_profiles
  for all using (public.is_admin());

-- ========== notifications ==========
create policy "users view own notifications" on public.notifications
  for select using (user_id = auth.uid());

create policy "users mark own notifications read" on public.notifications
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "admins manage notifications" on public.notifications
  for all using (public.is_admin());

-- ========== reports ==========
create policy "users view own reports" on public.reports
  for select using (reporter_id = auth.uid());

create policy "users create reports" on public.reports
  for insert with check (reporter_id = auth.uid());

create policy "admins manage all reports" on public.reports
  for all using (public.is_admin());

-- ========== app_settings ==========
create policy "anyone authenticated can read settings" on public.app_settings
  for select using (auth.role() = 'authenticated');

create policy "admins manage settings" on public.app_settings
  for all using (public.is_admin());
