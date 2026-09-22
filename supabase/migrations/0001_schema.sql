-- =========================================================
-- SocialGrow — Core Schema
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------- ENUMS ----------
do $$ begin
  create type user_role as enum ('user', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type platform_type as enum ('facebook', 'instagram', 'tiktok', 'youtube', 'x');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_action as enum ('follow', 'like', 'comment', 'visit_profile', 'subscribe');
exception when duplicate_object then null; end $$;

do $$ begin
  create type proof_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type activity_status as enum ('active', 'low', 'inactive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum (
    'proof_approved', 'proof_rejected', 'profile_unlocked',
    'profile_submitted', 'profile_approved', 'profile_rejected',
    'announcement', 'system'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status as enum ('open', 'reviewed', 'dismissed', 'actioned');
exception when duplicate_object then null; end $$;

-- ---------- PROFILES (app users, 1:1 with auth.users) ----------
create table if not exists public.app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text not null,
  role user_role not null default 'user',
  xp integer not null default 0,
  activity_status activity_status not null default 'active',
  whatsapp_dismissed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint xp_non_negative check (xp >= 0)
);

create index if not exists idx_app_users_role on public.app_users(role);

-- ---------- TASKS (a "task" = a submitted profile/action to complete) ----------
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.app_users(id) on delete cascade,
  platform platform_type not null,
  action task_action not null,
  username text not null,
  profile_url text not null,
  content_url text,
  instructions text not null,
  proof_requirement text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tasks_owner on public.tasks(owner_id);
create index if not exists idx_tasks_active on public.tasks(active);
create index if not exists idx_tasks_platform on public.tasks(platform);

-- ---------- PROOFS ----------
create table if not exists public.proofs (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.app_users(id) on delete cascade,
  storage_path text not null,
  status proof_status not null default 'pending',
  rejection_reason text,
  reviewer_id uuid references public.app_users(id),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (task_id, user_id)
);

create index if not exists idx_proofs_user on public.proofs(user_id);
create index if not exists idx_proofs_task on public.proofs(task_id);
create index if not exists idx_proofs_status on public.proofs(status);

-- ---------- XP TRANSACTIONS ----------
create table if not exists public.xp_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  proof_id uuid references public.proofs(id) on delete set null,
  amount integer not null,
  transaction_type text not null, -- 'task_approved', 'adjustment', etc.
  created_at timestamptz not null default now()
);

create index if not exists idx_xp_tx_user on public.xp_transactions(user_id);

-- ---------- TASK STATISTICS (rotation fairness) ----------
create table if not exists public.task_statistics (
  task_id uuid primary key references public.tasks(id) on delete cascade,
  impressions integer not null default 0,
  opens integer not null default 0,
  completions integer not null default 0,
  last_shown_at timestamptz,
  last_completed_at timestamptz
);

-- ---------- FEATURED PROFILES ----------
create table if not exists public.featured_profiles (
  task_id uuid primary key references public.tasks(id) on delete cascade,
  position integer not null check (position between 1 and 5),
  featured_by uuid references public.app_users(id),
  created_at timestamptz not null default now(),
  -- deferrable so a swap (two rows exchanging positions) can happen
  -- within one transaction without tripping the uniqueness check mid-statement
  constraint featured_profiles_position_unique unique (position) deferrable initially deferred
);

-- ---------- NOTIFICATIONS ----------
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  title text not null,
  message text not null,
  type notification_type not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id, read);

-- ---------- REPORTS ----------
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references public.app_users(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  reported_user_id uuid references public.app_users(id) on delete cascade,
  reason text not null,
  description text,
  status report_status not null default 'open',
  admin_notes text,
  created_at timestamptz not null default now()
);

-- ---------- APP SETTINGS (admin-configurable, no hardcoding) ----------
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value) values
  ('xp_per_approved_task', '10'),
  ('xp_unlock_threshold', '100'),
  ('max_featured_profiles', '5'),
  ('low_activity_threshold_days', '14'),
  ('inactive_threshold_days', '30')
on conflict (key) do nothing;

-- ---------- updated_at trigger helper ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_app_users_updated on public.app_users;
create trigger trg_app_users_updated before update on public.app_users
  for each row execute function public.set_updated_at();

drop trigger if exists trg_tasks_updated on public.tasks;
create trigger trg_tasks_updated before update on public.tasks
  for each row execute function public.set_updated_at();
