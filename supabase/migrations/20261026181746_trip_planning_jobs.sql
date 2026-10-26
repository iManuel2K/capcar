create table public.trip_planning_jobs (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  input jsonb,
  context jsonb,
  result jsonb,
  error text,
  error_code text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '1 hour')
);
create index trip_planning_jobs_user_idx on public.trip_planning_jobs(user_id);
create index trip_planning_jobs_expiry_idx on public.trip_planning_jobs(expires_at);
alter table public.trip_planning_jobs enable row level security;
revoke all on public.trip_planning_jobs from public, anon, authenticated;
grant select, insert, update, delete on public.trip_planning_jobs to service_role;
