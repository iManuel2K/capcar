begin;

create table public.price_watch_subscriptions (
  user_id uuid not null references auth.users(id) on delete cascade,
  watch_id uuid not null,
  vehicle_id text not null check (char_length(vehicle_id) between 1 and 120),
  vehicle_label text not null check (char_length(vehicle_label) between 2 and 160),
  build_id text not null check (char_length(build_id) between 1 and 120),
  item_id text not null check (char_length(item_id) between 1 and 120),
  quote_id text not null check (char_length(quote_id) between 1 and 220),
  provider text not null check (provider in ('ebay', 'partner')),
  provider_item_id text not null check (char_length(provider_item_id) between 1 and 220),
  query text not null check (char_length(query) between 3 and 100),
  part_number text check (part_number is null or char_length(part_number) <= 80),
  market text not null check (market in ('DE', 'GB', 'FR', 'IT', 'ES', 'US')),
  destination text not null check (destination in ('DE', 'AT', 'FR', 'IT', 'ES', 'NL', 'BE', 'GB', 'US')),
  target_price numeric(12,2) check (target_price is null or target_price >= 0),
  interval_hours integer not null default 12 check (interval_hours between 6 and 168),
  enabled boolean not null default true,
  next_check_at timestamptz not null default now(),
  last_checked_at timestamptz,
  consecutive_failures integer not null default 0 check (consecutive_failures between 0 and 20),
  last_error text check (last_error is null or char_length(last_error) <= 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, watch_id)
);

create table public.price_watch_results (
  user_id uuid not null,
  watch_id uuid not null,
  status text not null check (status in ('available', 'missing', 'error')),
  result jsonb check (result is null or jsonb_typeof(result) = 'object'),
  checked_at timestamptz not null,
  next_check_at timestamptz not null,
  error_code text check (error_code is null or error_code in ('access', 'limit', 'timeout', 'unavailable', 'missing')),
  error_message text check (error_message is null or char_length(error_message) <= 200),
  consumed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, watch_id),
  foreign key (user_id, watch_id)
    references public.price_watch_subscriptions(user_id, watch_id)
    on delete cascade,
  check ((status = 'available') = (result is not null))
);

create table public.price_watch_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null check (status in ('running', 'completed', 'partial', 'failed')),
  watches_checked integer not null default 0 check (watches_checked >= 0),
  results_updated integer not null default 0 check (results_updated >= 0),
  errors jsonb not null default '[]'::jsonb check (jsonb_typeof(errors) = 'array'),
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index price_watch_subscriptions_due_idx
  on public.price_watch_subscriptions (next_check_at, user_id)
  where enabled;

create index price_watch_results_pending_idx
  on public.price_watch_results (user_id, checked_at desc)
  where consumed_at is null;

create index price_watch_runs_recent_idx
  on public.price_watch_runs (started_at desc);

alter table public.price_watch_subscriptions enable row level security;
alter table public.price_watch_results enable row level security;
alter table public.price_watch_runs enable row level security;

revoke all on public.price_watch_subscriptions from anon, authenticated;
revoke all on public.price_watch_results from anon, authenticated;
revoke all on public.price_watch_runs from anon, authenticated;

grant select, insert, update, delete on public.price_watch_subscriptions to authenticated;
grant select on public.price_watch_results to authenticated;
grant update (consumed_at) on public.price_watch_results to authenticated;

create policy "Owners manage scheduled price watches"
on public.price_watch_subscriptions for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Owners read scheduled price watch results"
on public.price_watch_results for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Owners consume scheduled price watch results"
on public.price_watch_results for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Clients cannot read price watch runs"
on public.price_watch_runs for all to anon, authenticated
using (false) with check (false);

create or replace function public.guard_price_watch_subscription_limit()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' and (
    select count(*) from public.price_watch_subscriptions
    where user_id = new.user_id
  ) >= 50 then
    raise exception 'A maximum of 50 scheduled price watches is supported per account';
  end if;
  return new;
end;
$$;

create trigger price_watch_subscription_limit
before insert on public.price_watch_subscriptions
for each row execute function public.guard_price_watch_subscription_limit();

revoke all on function public.guard_price_watch_subscription_limit() from public, anon, authenticated;

comment on table public.price_watch_subscriptions is
  'Authenticated Build Planner watches eligible for bounded closed-browser checks.';
comment on table public.price_watch_results is
  'Latest server observation for each watch; imported into the existing local workbench on the next Garage visit.';
comment on table public.price_watch_runs is
  'Private operational summaries for the Netlify price-watch worker.';

commit;
