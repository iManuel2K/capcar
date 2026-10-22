begin;

-- Authenticated clients can call this RPC directly. Never trust their window
-- or route selection to reset a quota or allocate arbitrary counter rows.
create or replace function public.consume_api_rate_limit(
  p_route text,
  p_limit integer default 30,
  p_window_seconds integer default 60
)
returns table (allowed boolean, remaining integer, reset_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := auth.uid();
  v_now timestamptz := clock_timestamp();
  v_limit integer;
  v_window_seconds integer;
  v_window_start timestamptz;
  v_count integer;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_limit is null or p_limit not between 1 and 300
    or p_window_seconds is null or p_window_seconds not between 10 and 3600 then
    raise exception 'Invalid rate limit configuration';
  end if;

  select policy.max_requests, policy.window_seconds
  into v_limit, v_window_seconds
  from (values
    ('catalog-search', 30, 60),
    ('offers-search', 30, 60),
    ('vehicle-resolve', 15, 60),
    ('vehicle-model', 15, 60),
    ('copilot-chat', 15, 60),
    ('fitment-resolve', 20, 60),
    ('affiliate-out', 60, 60),
    ('community', 60, 60),
    ('community-write', 20, 60),
    ('listing-photo', 10, 60),
    ('specialist-applications', 60, 60),
    ('specialist-apply', 5, 3600),
    ('specialist-review', 30, 60),
    ('specialist-profile', 10, 3600),
    ('ai-connection', 5, 300),
    ('trip-planner', 10, 60),
    ('trip-route', 10, 60),
    ('google-sync', 2, 300),
    ('google-calendar', 10, 60)
  ) as policy(route, max_requests, window_seconds)
  where policy.route = p_route;
  if not found then raise exception 'Unknown rate limit route'; end if;
  v_limit := least(v_limit, p_limit);

  insert into public.api_rate_limits as limits
    (user_id, route, window_start, request_count)
  values (v_user_id, p_route, v_now, 1)
  on conflict (user_id, route) do update set
    window_start = case
      when limits.window_start + make_interval(secs => v_window_seconds) <= v_now
        then v_now else limits.window_start end,
    request_count = case
      when limits.window_start + make_interval(secs => v_window_seconds) <= v_now
        then 1 else least(limits.request_count, 300) + 1 end
  returning limits.window_start, limits.request_count into v_window_start, v_count;

  return query select v_count <= v_limit, greatest(v_limit - v_count, 0),
    v_window_start + make_interval(secs => v_window_seconds);
end;
$$;

revoke all on function public.consume_api_rate_limit(text, integer, integer)
  from public, anon;
grant execute on function public.consume_api_rate_limit(text, integer, integer)
  to authenticated;

-- Existing buckets must also honor privacy and size/type restrictions.
update storage.buckets set public = false, file_size_limit = 10485760,
  allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
where id = 'vehicle-documents';
update storage.buckets set public = false, file_size_limit = 1048576,
  allowed_mime_types = array['image/jpeg']
where id = 'listing-photos';

commit;
