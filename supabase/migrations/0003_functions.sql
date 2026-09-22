-- =========================================================
-- SocialGrow — Secure RPC Functions
-- All security-critical writes (XP, approval, featuring) go
-- through SECURITY DEFINER functions so RLS can stay strict
-- on the underlying tables.
-- =========================================================

-- ---------- auto-create app_users row on signup ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.app_users (id, username, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    'user'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- notify helper ----------
create or replace function public.notify(
  p_user_id uuid, p_title text, p_message text, p_type notification_type
) returns void language plpgsql security definer as $$
begin
  insert into public.notifications (user_id, title, message, type)
  values (p_user_id, p_title, p_message, p_type);
end; $$;

-- ---------- submit proof (enforces: not own task, not already submitted, task active) ----------
create or replace function public.submit_proof(
  p_task_id uuid, p_storage_path text
) returns uuid language plpgsql security definer as $$
declare
  v_owner uuid;
  v_active boolean;
  v_proof_id uuid;
begin
  select owner_id, active into v_owner, v_active from public.tasks where id = p_task_id;

  if v_owner is null then
    raise exception 'Task not found';
  end if;
  if v_owner = auth.uid() then
    raise exception 'You cannot complete your own task';
  end if;
  if not v_active then
    raise exception 'This task is no longer active';
  end if;
  if exists (select 1 from public.proofs where task_id = p_task_id and user_id = auth.uid()) then
    raise exception 'You already submitted proof for this task';
  end if;

  insert into public.proofs (task_id, user_id, storage_path, status)
  values (p_task_id, auth.uid(), p_storage_path, 'pending')
  returning id into v_proof_id;

  update public.task_statistics
    set opens = opens + 1
    where task_id = p_task_id;

  return v_proof_id;
end; $$;

-- ---------- approve proof: atomic XP award ----------
create or replace function public.approve_proof(p_proof_id uuid)
returns void language plpgsql security definer as $$
declare
  v_task_id uuid;
  v_user_id uuid;
  v_status proof_status;
  v_xp_amount int;
  v_unlock_threshold int;
  v_new_xp int;
begin
  if not public.is_admin() then
    raise exception 'Only admins can approve proofs';
  end if;

  select task_id, user_id, status into v_task_id, v_user_id, v_status
    from public.proofs where id = p_proof_id for update;

  if v_status is null then
    raise exception 'Proof not found';
  end if;
  if v_status <> 'pending' then
    raise exception 'Proof already reviewed';
  end if;

  select (value#>>'{}')::int into v_xp_amount
    from public.app_settings where key = 'xp_per_approved_task';
  select (value#>>'{}')::int into v_unlock_threshold
    from public.app_settings where key = 'xp_unlock_threshold';

  update public.proofs
    set status = 'approved', reviewer_id = auth.uid(), reviewed_at = now()
    where id = p_proof_id;

  insert into public.xp_transactions (user_id, proof_id, amount, transaction_type)
    values (v_user_id, p_proof_id, v_xp_amount, 'task_approved');

  update public.app_users set xp = xp + v_xp_amount where id = v_user_id
    returning xp into v_new_xp;

  update public.task_statistics
    set completions = completions + 1, last_completed_at = now()
    where task_id = v_task_id;

  perform public.notify(
    v_user_id, 'Proof approved! 🎉',
    format('Your proof was approved and you earned %s XP.', v_xp_amount),
    'proof_approved'
  );

  if v_new_xp >= v_unlock_threshold and (v_new_xp - v_xp_amount) < v_unlock_threshold then
    perform public.notify(
      v_user_id, 'Your profile is unlocked! 🎉',
      'You''ve reached the XP you need — you can now add your own profile.',
      'profile_unlocked'
    );
  end if;
end; $$;

-- ---------- reject proof ----------
create or replace function public.reject_proof(p_proof_id uuid, p_reason text)
returns void language plpgsql security definer as $$
declare
  v_status proof_status;
  v_user_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only admins can reject proofs';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'A rejection reason is required';
  end if;

  select status, user_id into v_status, v_user_id from public.proofs where id = p_proof_id for update;
  if v_status is null then
    raise exception 'Proof not found';
  end if;
  if v_status <> 'pending' then
    raise exception 'Proof already reviewed';
  end if;

  update public.proofs
    set status = 'rejected', rejection_reason = p_reason,
        reviewer_id = auth.uid(), reviewed_at = now()
    where id = p_proof_id;

  perform public.notify(
    v_user_id, 'Proof rejected',
    format('Your proof was rejected. Reason: %s', p_reason),
    'proof_rejected'
  );
end; $$;

-- ---------- record impression (called when a task is shown in the feed) ----------
create or replace function public.record_impression(p_task_id uuid)
returns void language plpgsql security definer as $$
begin
  insert into public.task_statistics (task_id, impressions, last_shown_at)
  values (p_task_id, 1, now())
  on conflict (task_id) do update
    set impressions = task_statistics.impressions + 1, last_shown_at = now();
end; $$;

-- ---------- feature / unfeature (enforces max 5; swaps position with any
-- occupant so reordering never violates the unique-position constraint) ----------
create or replace function public.feature_task(p_task_id uuid, p_position int)
returns void language plpgsql security definer as $$
declare
  v_count int;
  v_occupant uuid;
  v_own_current_position int;
begin
  if not public.is_admin() then
    raise exception 'Only admins can feature profiles';
  end if;
  if p_position < 1 or p_position > 5 then
    raise exception 'Position must be between 1 and 5';
  end if;

  select position into v_own_current_position from public.featured_profiles where task_id = p_task_id;

  select count(*) into v_count from public.featured_profiles where task_id <> p_task_id;
  if v_own_current_position is null and v_count >= 5 then
    raise exception 'Your featured section is full. Unfeature one profile before adding another.';
  end if;

  select task_id into v_occupant from public.featured_profiles
    where position = p_position and task_id <> p_task_id;

  -- constraint is deferrable, so both rows can be updated in this
  -- transaction before uniqueness is checked at commit
  if v_occupant is not null and v_own_current_position is not null then
    -- swap: occupant takes this task's old position
    update public.featured_profiles set position = v_own_current_position where task_id = v_occupant;
  end if;

  insert into public.featured_profiles (task_id, position, featured_by)
  values (p_task_id, p_position, auth.uid())
  on conflict (task_id) do update set position = excluded.position, featured_by = excluded.featured_by;
end; $$;

create or replace function public.unfeature_task(p_task_id uuid)
returns void language plpgsql security definer as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can unfeature profiles';
  end if;
  delete from public.featured_profiles where task_id = p_task_id;
end; $$;

-- ---------- create a task, only once XP unlock is reached (defense in depth beyond RLS) ----------
create or replace function public.create_task(
  p_platform platform_type, p_action task_action, p_username text,
  p_profile_url text, p_content_url text, p_instructions text, p_proof_requirement text
) returns uuid language plpgsql security definer as $$
declare
  v_xp int;
  v_threshold int;
  v_task_id uuid;
begin
  select xp into v_xp from public.app_users where id = auth.uid();
  select (value#>>'{}')::int into v_threshold from public.app_settings where key = 'xp_unlock_threshold';

  if v_xp < v_threshold then
    raise exception 'You need % approved XP before adding a profile', v_threshold;
  end if;

  insert into public.tasks (owner_id, platform, action, username, profile_url, content_url, instructions, proof_requirement)
  values (auth.uid(), p_platform, p_action, p_username, p_profile_url, p_content_url, p_instructions, p_proof_requirement)
  returning id into v_task_id;

  insert into public.task_statistics (task_id) values (v_task_id);

  return v_task_id;
end; $$;
