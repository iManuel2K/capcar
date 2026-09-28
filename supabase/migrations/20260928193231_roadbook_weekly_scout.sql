begin;

create table public.roadbook_scout_sources (
  source_key text primary key check (source_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  source_kind text not null check (source_kind in ('event_page', 'place_page', 'image_query')),
  scope text not null check (scope in ('global_major', 'europe')),
  name text not null check (char_length(name) between 2 and 160),
  source_url text not null check (source_url ~ '^https://'),
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  enabled boolean not null default true,
  last_checked_at timestamptz,
  last_success_at timestamptz,
  last_error text check (last_error is null or char_length(last_error) <= 500),
  consecutive_failures integer not null default 0 check (consecutive_failures >= 0),
  response_etag text check (response_etag is null or char_length(response_etag) <= 500),
  response_last_modified text check (response_last_modified is null or char_length(response_last_modified) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roadbook_discovery_candidates (
  id uuid primary key default gen_random_uuid(),
  candidate_kind text not null check (candidate_kind in ('event', 'place', 'image')),
  fingerprint text not null check (char_length(fingerprint) between 8 and 160),
  source_key text references public.roadbook_scout_sources(source_key) on delete set null,
  title text not null check (char_length(title) between 2 and 200),
  source_url text not null check (source_url ~ '^https://'),
  country_code text check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  region text check (region is null or char_length(region) <= 160),
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_note text check (review_note is null or char_length(btrim(review_note)) between 5 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (candidate_kind, fingerprint),
  check (
    (status = 'pending' and reviewed_at is null and reviewed_by is null)
    or
    (status <> 'pending' and reviewed_at is not null and reviewed_by is not null)
  )
);

create table public.roadbook_ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  shard smallint not null check (shard between 0 and 15),
  status text not null check (status in ('running', 'completed', 'partial', 'failed')),
  sources_checked integer not null default 0 check (sources_checked >= 0),
  photos_checked integer not null default 0 check (photos_checked >= 0),
  candidates_found integer not null default 0 check (candidates_found >= 0),
  skipped jsonb not null default '[]'::jsonb check (jsonb_typeof(skipped) = 'array'),
  errors jsonb not null default '[]'::jsonb check (jsonb_typeof(errors) = 'array'),
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index roadbook_scout_sources_enabled_idx
  on public.roadbook_scout_sources (scope, source_kind, source_key)
  where enabled;

create index roadbook_discovery_candidates_queue_idx
  on public.roadbook_discovery_candidates (status, candidate_kind, last_seen_at desc);

create index roadbook_discovery_candidates_source_idx
  on public.roadbook_discovery_candidates (source_key);

create index roadbook_discovery_candidates_reviewer_idx
  on public.roadbook_discovery_candidates (reviewed_by)
  where reviewed_by is not null;

create index roadbook_ingestion_runs_recent_idx
  on public.roadbook_ingestion_runs (started_at desc);

alter table public.roadbook_scout_sources enable row level security;
alter table public.roadbook_discovery_candidates enable row level security;
alter table public.roadbook_ingestion_runs enable row level security;

revoke all on public.roadbook_scout_sources from anon, authenticated;
revoke all on public.roadbook_discovery_candidates from anon, authenticated;
revoke all on public.roadbook_ingestion_runs from anon, authenticated;

grant select on public.roadbook_discovery_candidates to authenticated;
grant update (status, reviewed_by, reviewed_at, review_note, updated_at)
  on public.roadbook_discovery_candidates to authenticated;

create policy "Clients cannot read Roadbook scout sources"
on public.roadbook_scout_sources for all to anon, authenticated
using (false) with check (false);

create policy "Clients cannot read Roadbook ingestion runs"
on public.roadbook_ingestion_runs for all to anon, authenticated
using (false) with check (false);

create policy "Moderators read Roadbook discovery candidates"
on public.roadbook_discovery_candidates for select to authenticated
using ((select public.community_has_role('moderator')));

create policy "Moderators decide Roadbook discovery candidates"
on public.roadbook_discovery_candidates for update to authenticated
using ((select public.community_has_role('moderator')) and status = 'pending')
with check (
  (select public.community_has_role('moderator'))
  and status in ('approved', 'rejected')
  and reviewed_by = (select auth.uid())
  and reviewed_at is not null
);

create or replace function public.moderate_roadbook_discovery_candidate(
  p_candidate_id uuid,
  p_status text,
  p_note text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.community_has_role('moderator') then
    raise exception 'Moderator required';
  end if;

  if p_status not in ('approved', 'rejected') then
    raise exception 'Decision must be approved or rejected';
  end if;

  if p_note is null or char_length(btrim(p_note)) not between 5 and 1000 then
    raise exception 'A review note between 5 and 1000 characters is required';
  end if;

  update public.roadbook_discovery_candidates
  set
    status = p_status,
    review_note = btrim(p_note),
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    updated_at = now()
  where id = p_candidate_id and status = 'pending';

  if not found then
    raise exception 'Pending candidate not found';
  end if;

  return p_candidate_id;
end;
$$;

revoke all on function public.moderate_roadbook_discovery_candidate(uuid, text, text) from public, anon;
grant execute on function public.moderate_roadbook_discovery_candidate(uuid, text, text) to authenticated;

comment on table public.roadbook_discovery_candidates is
  'Private Roadbook Scout review queue. Candidates are never published automatically.';

comment on table public.roadbook_scout_sources is
  'Curated official sources and Unsplash query targets monitored by Netlify scheduled functions.';

commit;
