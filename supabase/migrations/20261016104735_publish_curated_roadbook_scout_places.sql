begin;

create or replace function public.sync_roadbook_scout_places(p_targets jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  synced_count integer;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Service role required';
  end if;

  if jsonb_typeof(p_targets) <> 'array'
    or jsonb_array_length(p_targets) > 250 then
    raise exception 'Scout targets must be an array of at most 250 entries';
  end if;

  with incoming as (
    select
      target.source_key,
      target.region,
      target.country_code,
      target.latitude,
      target.longitude,
      extensions.st_setsrid(
        extensions.st_makepoint(target.longitude, target.latitude),
        4326
      )::extensions.geography as location
    from jsonb_to_recordset(p_targets) as target(
      source_key text,
      region text,
      country_code text,
      latitude double precision,
      longitude double precision
    )
    where target.source_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      and char_length(target.region) between 2 and 160
      and target.country_code ~ '^[A-Z]{2}$'
      and target.latitude between -90 and 90
      and target.longitude between -180 and 180
  ),
  synced as (
    insert into public.roadbook_venues (
      name,
      slug,
      category,
      description,
      access_status,
      location,
      country_code,
      city,
      surface,
      source_label,
      source_url,
      verification_status,
      requirements,
      published
    )
    select
      incoming.region || ' scenic drive',
      'scout-' || incoming.source_key,
      'scenic_route',
      'A curated Roadbook discovery anchor for ' || incoming.region ||
        '. Explore legal public roads in the area and verify access, weather and local restrictions before driving.',
      'public_context',
      incoming.location,
      incoming.country_code,
      incoming.region,
      'Public-road context',
      'Roadbook curated map context',
      format(
        'https://www.openstreetmap.org/?mlat=%s&mlon=%s#map=10/%s/%s',
        incoming.latitude,
        incoming.longitude,
        incoming.latitude,
        incoming.longitude
      ),
      'unverified',
      jsonb_build_object(
        'requiresRoadLegal', true,
        'scout', jsonb_build_object(
          'sourceKey', incoming.source_key,
          'locationType', 'regional_anchor'
        ),
        'disclaimer',
          'Regional discovery anchor, not a turn-by-turn route. Verify current conditions and stopping rules.'
      ),
      true
    from incoming
    where not exists (
      select 1
      from public.roadbook_venues existing
      where existing.slug <> 'scout-' || incoming.source_key
        and existing.country_code = incoming.country_code
        and existing.category in ('scenic_route', 'car_photo_spot')
        and extensions.st_dwithin(existing.location, incoming.location, 20000)
    )
    on conflict (slug) do update set
      name = excluded.name,
      description = excluded.description,
      access_status = excluded.access_status,
      location = excluded.location,
      country_code = excluded.country_code,
      city = excluded.city,
      surface = excluded.surface,
      source_label = excluded.source_label,
      source_url = excluded.source_url,
      requirements = excluded.requirements,
      published = true,
      updated_at = now()
    returning id
  )
  select count(*)::integer into synced_count from synced;

  return synced_count;
end;
$$;

revoke all on function public.sync_roadbook_scout_places(jsonb)
  from public, anon, authenticated;
grant execute on function public.sync_roadbook_scout_places(jsonb)
  to service_role;

comment on function public.sync_roadbook_scout_places(jsonb) is
  'Publishes code-curated regional Roadbook anchors. Raw event and image discoveries remain private moderation candidates.';

with latest_targets as (
  select distinct on (candidate.source_key)
    candidate.source_key,
    candidate.region,
    candidate.country_code,
    (candidate.payload #>> '{target,latitude}')::double precision as latitude,
    (candidate.payload #>> '{target,longitude}')::double precision as longitude
  from public.roadbook_discovery_candidates candidate
  where candidate.candidate_kind = 'image'
    and candidate.source_key is not null
    and candidate.region is not null
    and candidate.country_code is not null
    and jsonb_typeof(candidate.payload -> 'target') = 'object'
    and (candidate.payload #>> '{target,latitude}') is not null
    and (candidate.payload #>> '{target,longitude}') is not null
  order by candidate.source_key, candidate.last_seen_at desc
),
incoming as (
  select
    target.source_key,
    target.region,
    target.country_code,
    target.latitude,
    target.longitude,
    extensions.st_setsrid(
      extensions.st_makepoint(target.longitude, target.latitude),
      4326
    )::extensions.geography as location
  from latest_targets target
  where target.source_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and char_length(target.region) between 2 and 160
    and target.country_code ~ '^[A-Z]{2}$'
    and target.latitude between -90 and 90
    and target.longitude between -180 and 180
)
insert into public.roadbook_venues (
  name,
  slug,
  category,
  description,
  access_status,
  location,
  country_code,
  city,
  surface,
  source_label,
  source_url,
  verification_status,
  requirements,
  published
)
select
  incoming.region || ' scenic drive',
  'scout-' || incoming.source_key,
  'scenic_route',
  'A curated Roadbook discovery anchor for ' || incoming.region ||
    '. Explore legal public roads in the area and verify access, weather and local restrictions before driving.',
  'public_context',
  incoming.location,
  incoming.country_code,
  incoming.region,
  'Public-road context',
  'Roadbook curated map context',
  format(
    'https://www.openstreetmap.org/?mlat=%s&mlon=%s#map=10/%s/%s',
    incoming.latitude,
    incoming.longitude,
    incoming.latitude,
    incoming.longitude
  ),
  'unverified',
  jsonb_build_object(
    'requiresRoadLegal', true,
    'scout', jsonb_build_object(
      'sourceKey', incoming.source_key,
      'locationType', 'regional_anchor'
    ),
    'disclaimer',
      'Regional discovery anchor, not a turn-by-turn route. Verify current conditions and stopping rules.'
  ),
  true
from incoming
where not exists (
  select 1
  from public.roadbook_venues existing
  where existing.country_code = incoming.country_code
    and existing.category in ('scenic_route', 'car_photo_spot')
    and extensions.st_dwithin(existing.location, incoming.location, 20000)
)
on conflict (slug) do nothing;

commit;
