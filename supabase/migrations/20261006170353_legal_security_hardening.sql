begin;

-- A deterministic six-hour run key makes repeated or concurrent scheduler
-- deliveries idempotent before any retailer calls can be made.
alter table public.price_watch_runs
  add column if not exists run_key text;

create unique index if not exists price_watch_runs_run_key_idx
  on public.price_watch_runs (run_key)
  where run_key is not null;

alter table public.price_watch_runs
  drop constraint if exists price_watch_runs_run_key_format;
alter table public.price_watch_runs
  add constraint price_watch_runs_run_key_format
  check (
    run_key is null
    or run_key ~ '^price-watch-[0-9]{4}-[0-9]{2}-[0-9]{2}-(00|06|12|18)$'
  );

-- Trigger functions are invoked by Postgres itself and must never be exposed
-- as callable RPC endpoints.
revoke all on function public.guard_community_relationship()
  from public, anon, authenticated;
revoke all on function public.suspend_specialist_access()
  from public, anon, authenticated;
revoke all on function public.guard_public_listing_content()
  from public, anon, authenticated;

comment on column public.price_watch_runs.run_key is
  'Private scheduler idempotency key; one run per six-hour UTC window.';

commit;
