-- =========================================================
-- SocialGrow — Fair rotation feed
-- Community tasks (excluding featured) are ordered by least
-- exposure first, with controlled randomization among tasks
-- of similar exposure, and paginated.
-- =========================================================

create or replace function public.get_featured_feed()
returns table (
  task_id uuid, platform platform_type, action task_action, username text,
  profile_url text, content_url text, instructions text, proof_requirement text,
  owner_id uuid, position int
) language sql security definer stable as $$
  select t.id, t.platform, t.action, t.username, t.profile_url, t.content_url,
         t.instructions, t.proof_requirement, t.owner_id, f.position
  from public.featured_profiles f
  join public.tasks t on t.id = f.task_id
  where t.active = true
  order by f.position asc;
$$;

create or replace function public.get_rotation_feed(
  p_platform platform_type default null,
  p_action task_action default null,
  p_limit int default 10,
  p_offset int default 0
) returns table (
  task_id uuid, platform platform_type, action task_action, username text,
  profile_url text, content_url text, instructions text, proof_requirement text,
  owner_id uuid, already_done boolean
) language sql security definer stable as $$
  with pool as (
    select t.*, coalesce(s.impressions, 0) as impressions, coalesce(s.completions, 0) as completions
    from public.tasks t
    left join public.task_statistics s on s.task_id = t.id
    where t.active = true
      and t.id not in (select task_id from public.featured_profiles)
      and t.owner_id <> auth.uid()
      and (p_platform is null or t.platform = p_platform)
      and (p_action is null or t.action = p_action)
  )
  select
    pool.id, pool.platform, pool.action, pool.username, pool.profile_url, pool.content_url,
    pool.instructions, pool.proof_requirement, pool.owner_id,
    exists(select 1 from public.proofs p where p.task_id = pool.id and p.user_id = auth.uid()) as already_done
  from pool
  order by pool.impressions asc, pool.completions asc, md5(pool.id::text || to_char(now(), 'YYYY-MM-DD-HH24')) asc
  limit p_limit offset p_offset;
$$;
