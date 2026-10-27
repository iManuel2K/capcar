-- Preserve the existing service-only access policy.
alter table public.trip_planning_jobs
  add column request_hash text,
  add column dispatched_at timestamptz;
