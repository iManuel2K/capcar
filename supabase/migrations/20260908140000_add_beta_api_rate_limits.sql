create table if not exists public.api_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  route text not null check (char_length(route) between 1 and 120),
  window_start timestamptz not null default now(),
  request_count integer not null default 1 check (request_count > 0),
  primary key (user_id, route)
);

alter table public.api_rate_limits enable row level security;

revoke all on table public.api_rate_limits from anon, authenticated;

create or replace function public.consume_api_rate_limit(
  p_route text,
  p_limit integer default 30,
  p_window_seconds integer default 60
)
returns table (allowed boolean, remaining integer, reset_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_now timestamptz := clock_timestamp();
  v_window_start timestamptz;
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  if char_length(p_route) not between 1 and 120 then
    raise exception 'Invalid route';
  end if;
  if p_limit not between 1 and 300 or p_window_seconds not between 10 and 3600 then
    raise exception 'Invalid rate limit configuration';
  end if;

  insert into public.api_rate_limits as limits (
    user_id,
    route,
    window_start,
    request_count
  ) values (
    v_user_id,
    p_route,
    v_now,
    1
  )
  on conflict (user_id, route) do update
  set
    window_start = case
      when limits.window_start + make_interval(secs => p_window_seconds) <= v_now
        then v_now
      else limits.window_start
    end,
    request_count = case
      when limits.window_start + make_interval(secs => p_window_seconds) <= v_now
        then 1
      else limits.request_count + 1
    end
  returning limits.window_start, limits.request_count
  into v_window_start, v_count;

  return query select
    v_count <= p_limit,
    greatest(p_limit - v_count, 0),
    v_window_start + make_interval(secs => p_window_seconds);
end;
$$;

revoke all on function public.consume_api_rate_limit(text, integer, integer) from public, anon;
grant execute on function public.consume_api_rate_limit(text, integer, integer) to authenticated;
