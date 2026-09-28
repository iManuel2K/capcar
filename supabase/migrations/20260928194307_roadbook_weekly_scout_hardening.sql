begin;

create index if not exists roadbook_discovery_candidates_source_idx
  on public.roadbook_discovery_candidates (source_key);

create index if not exists roadbook_discovery_candidates_reviewer_idx
  on public.roadbook_discovery_candidates (reviewed_by)
  where reviewed_by is not null;

grant update (status, reviewed_by, reviewed_at, review_note, updated_at)
  on public.roadbook_discovery_candidates to authenticated;

drop policy if exists "Clients cannot read Roadbook scout sources"
  on public.roadbook_scout_sources;
create policy "Clients cannot read Roadbook scout sources"
on public.roadbook_scout_sources for all to anon, authenticated
using (false) with check (false);

drop policy if exists "Clients cannot read Roadbook ingestion runs"
  on public.roadbook_ingestion_runs;
create policy "Clients cannot read Roadbook ingestion runs"
on public.roadbook_ingestion_runs for all to anon, authenticated
using (false) with check (false);

drop policy if exists "Moderators read Roadbook discovery candidates"
  on public.roadbook_discovery_candidates;
create policy "Moderators read Roadbook discovery candidates"
on public.roadbook_discovery_candidates for select to authenticated
using ((select public.community_has_role('moderator')));

drop policy if exists "Moderators decide Roadbook discovery candidates"
  on public.roadbook_discovery_candidates;
create policy "Moderators decide Roadbook discovery candidates"
on public.roadbook_discovery_candidates for update to authenticated
using ((select public.community_has_role('moderator')) and status = 'pending')
with check (
  (select public.community_has_role('moderator'))
  and status in ('approved', 'rejected')
  and reviewed_by = (select auth.uid())
  and reviewed_at is not null
);

alter function public.moderate_roadbook_discovery_candidate(uuid, text, text)
  security invoker;

commit;
