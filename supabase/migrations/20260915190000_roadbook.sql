begin;

create schema if not exists extensions;
create extension if not exists postgis with schema extensions;

create table public.roadbook_venues (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 140),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  category text not null check (category in (
    'drift_circuit', 'drag_acceleration', 'track_day',
    'proving_ground', 'scenic_route', 'autobahn_context'
  )),
  description text not null default '' check (char_length(description) <= 1200),
  access_status text not null check (access_status in (
    'closed_venue', 'private', 'permit_required', 'public_context', 'unknown'
  )),
  location extensions.geography(point, 4326) not null,
  route_geometry extensions.geography(linestring, 4326),
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  city text not null default '' check (char_length(city) <= 100),
  surface text check (char_length(surface) <= 80),
  length_m integer check (length_m > 0 and length_m <= 1000000),
  noise_limit_db numeric(5,2) check (noise_limit_db between 50 and 180),
  opening_hours jsonb not null default '{}'::jsonb check (jsonb_typeof(opening_hours) = 'object'),
  booking_url text check (booking_url is null or booking_url ~ '^https://'),
  entry_price_cents integer check (entry_price_cents >= 0),
  price_currency text not null default 'EUR' check (price_currency ~ '^[A-Z]{3}$'),
  requirements jsonb not null default '{}'::jsonb check (jsonb_typeof(requirements) = 'object'),
  source_label text not null check (char_length(source_label) between 2 and 120),
  source_url text not null check (source_url ~ '^https://'),
  verification_status text not null default 'unverified' check (verification_status in (
    'verified', 'official_source', 'community_report', 'stale', 'unverified'
  )),
  verified_at timestamptz,
  published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (category not in ('drift_circuit', 'drag_acceleration') or access_status in ('closed_venue', 'private', 'permit_required')),
  check (category <> 'autobahn_context' or access_status = 'public_context'),
  check (verification_status <> 'verified' or verified_at is not null)
);

create index roadbook_venues_location_gix on public.roadbook_venues using gist (location);
create index roadbook_venues_category_idx on public.roadbook_venues (category) where published;

create table public.venue_verifications (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.roadbook_venues(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (char_length(btrim(reason)) between 10 and 1000),
  evidence_url text check (evidence_url is null or evidence_url ~ '^https://'),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  moderator_note text check (moderator_note is null or char_length(btrim(moderator_note)) between 10 and 1000),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  check ((status = 'pending' and reviewed_at is null and reviewed_by is null) or status <> 'pending')
);

create index venue_verifications_queue_idx on public.venue_verifications (status, created_at);
create unique index venue_verifications_pending_unique_idx
  on public.venue_verifications (venue_id, reporter_id) where status = 'pending';

create table public.saved_roadbook_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  venue_id uuid not null references public.roadbook_venues(id) on delete cascade,
  vehicle_id text not null check (char_length(vehicle_id) between 1 and 150),
  build_id text check (build_id is null or char_length(build_id) between 1 and 150),
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now(),
  unique (user_id, venue_id, vehicle_id)
);

create index saved_roadbook_places_vehicle_idx on public.saved_roadbook_places (user_id, vehicle_id, created_at desc);

create table public.passport_visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  venue_id uuid not null references public.roadbook_venues(id) on delete restrict,
  vehicle_id text not null check (char_length(vehicle_id) between 1 and 150),
  visited_at date not null check (visited_at >= date '2000-01-01' and visited_at <= current_date),
  notes text check (notes is null or char_length(notes) <= 2000),
  lap_times jsonb not null default '[]'::jsonb check (jsonb_typeof(lap_times) = 'array'),
  obd_log jsonb check (obd_log is null or jsonb_typeof(obd_log) = 'object'),
  photo_paths text[] not null default '{}',
  conditions jsonb not null default '{}'::jsonb check (jsonb_typeof(conditions) = 'object'),
  created_at timestamptz not null default now()
);

create index passport_visits_vehicle_idx on public.passport_visits (user_id, vehicle_id, visited_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'roadbook-visits', 'roadbook-visits', false, 12582912,
  array['image/jpeg', 'image/png', 'image/webp', 'text/plain', 'application/json', 'text/csv']
)
on conflict (id) do nothing;

alter table public.roadbook_venues enable row level security;
alter table public.venue_verifications enable row level security;
alter table public.saved_roadbook_places enable row level security;
alter table public.passport_visits enable row level security;

revoke all on public.roadbook_venues, public.venue_verifications, public.saved_roadbook_places, public.passport_visits from anon, authenticated;
grant select on public.roadbook_venues to anon, authenticated;
grant select, insert, update on public.venue_verifications to authenticated;
grant select, insert, update, delete on public.saved_roadbook_places to authenticated;
grant select, insert, update, delete on public.passport_visits to authenticated;

create policy "Published Roadbook venues are public"
on public.roadbook_venues for select to anon, authenticated
using (published = true);

create policy "People submit and read their Roadbook reports"
on public.venue_verifications for select to authenticated
using (reporter_id = auth.uid() or public.community_has_role('moderator'));

create policy "People report Roadbook venue changes"
on public.venue_verifications for insert to authenticated
with check (reporter_id = auth.uid() and status = 'pending' and reviewed_by is null and reviewed_at is null);

create policy "Moderators review Roadbook reports"
on public.venue_verifications for update to authenticated
using (public.community_has_role('moderator'))
with check (public.community_has_role('moderator'));

create policy "People manage their saved Roadbook places"
on public.saved_roadbook_places for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "People manage their Passport visits"
on public.passport_visits for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Roadbook visit owners read media"
on storage.objects for select to authenticated
using (bucket_id = 'roadbook-visits' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Roadbook visit owners upload media"
on storage.objects for insert to authenticated
with check (bucket_id = 'roadbook-visits' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Roadbook visit owners delete media"
on storage.objects for delete to authenticated
using (bucket_id = 'roadbook-visits' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function public.roadbook_venues_nearby(
  p_lat double precision,
  p_lng double precision,
  p_radius_m integer default 150000,
  p_categories text[] default null
)
returns table (
  id uuid,
  name text,
  slug text,
  category text,
  description text,
  access_status text,
  latitude double precision,
  longitude double precision,
  route_geojson jsonb,
  country_code text,
  city text,
  surface text,
  length_m integer,
  noise_limit_db numeric,
  opening_hours jsonb,
  booking_url text,
  entry_price_cents integer,
  price_currency text,
  requirements jsonb,
  source_label text,
  source_url text,
  verification_status text,
  verified_at timestamptz,
  distance_m double precision
)
language sql stable security invoker set search_path = '' as $$
  select
    v.id, v.name, v.slug, v.category, v.description, v.access_status,
    extensions.st_y(v.location::extensions.geometry),
    extensions.st_x(v.location::extensions.geometry),
    case when v.route_geometry is null then null else extensions.st_asgeojson(v.route_geometry::extensions.geometry)::jsonb end,
    v.country_code, v.city, v.surface, v.length_m, v.noise_limit_db,
    v.opening_hours, v.booking_url, v.entry_price_cents, v.price_currency,
    v.requirements, v.source_label, v.source_url, v.verification_status,
    v.verified_at,
    extensions.st_distance(
      v.location,
      extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography
    )
  from public.roadbook_venues v
  where v.published
    and p_lat between -90 and 90
    and p_lng between -180 and 180
    and (p_categories is null or v.category = any(p_categories))
    and extensions.st_dwithin(
      v.location,
      extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography,
      least(greatest(p_radius_m, 1000), 1000000)
    )
  order by extensions.st_distance(
    v.location,
    extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography
  )
  limit 250;
$$;

revoke all on function public.roadbook_venues_nearby(double precision, double precision, integer, text[]) from public;
grant execute on function public.roadbook_venues_nearby(double precision, double precision, integer, text[]) to anon, authenticated;

create or replace function public.moderate_roadbook_report(
  p_report_id uuid,
  p_status text,
  p_note text
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  report public.venue_verifications%rowtype;
begin
  if auth.uid() is null or not public.community_has_role('moderator') then
    raise exception 'Moderator required';
  end if;
  if p_status not in ('accepted', 'rejected') or char_length(btrim(p_note)) not between 10 and 1000 then
    raise exception 'A valid decision and review note are required';
  end if;
  select * into report from public.venue_verifications where id = p_report_id for update;
  if not found or report.status <> 'pending' then raise exception 'Pending report not found'; end if;
  update public.venue_verifications
    set status = p_status, moderator_note = btrim(p_note), reviewed_by = auth.uid(), reviewed_at = now()
    where id = p_report_id;
  if p_status = 'accepted' then
    update public.roadbook_venues
      set verification_status = 'community_report', verified_at = null, updated_at = now()
      where id = report.venue_id;
  end if;
  return p_report_id;
end;
$$;

revoke all on function public.moderate_roadbook_report(uuid, text, text) from public, anon;
grant execute on function public.moderate_roadbook_report(uuid, text, text) to authenticated;

create or replace function public.delete_current_user_data()
returns void language plpgsql security definer set search_path = '' as $$
declare u uuid := auth.uid();
begin
  if u is null then raise exception 'Authentication required'; end if;
  delete from public.venue_verifications where reporter_id = u;
  update public.venue_verifications set reviewed_by = null where reviewed_by = u;
  delete from public.saved_roadbook_places where user_id = u;
  delete from public.passport_visits where user_id = u;
  delete from public.specialist_applications where user_id = u;
  update public.specialist_applications set reviewed_by = null where reviewed_by = u;
  delete from public.community_messages where sender_id = u or recipient_id = u;
  delete from public.community_reports where reporter_id = u;
  delete from public.community_listings where seller_id = u;
  delete from public.work_verifications where owner_id = u or specialist_id = u;
  delete from public.community_roles where user_id = u;
  update public.community_audit set actor_id = null where actor_id = u;
  delete from public.vehicle_passports where user_id = u;
  delete from public.garage_snapshots where user_id = u;
  delete from public.api_rate_limits where user_id = u;
  delete from public.affiliate_clicks where user_id = u;
end;
$$;

-- Official-source starter records. They make no claim about today's opening,
-- entry price or suitability; users must follow the linked venue instructions.
insert into public.roadbook_venues (
  name, slug, category, description, access_status, location, country_code, city,
  surface, source_label, source_url, verification_status, published
)
values
  (
    'Nürburgring', 'nuerburgring', 'track_day',
    'Motorsport venue and driving-event context. Check the official event and access information before travelling.',
    'permit_required', extensions.st_setsrid(extensions.st_makepoint(6.9475, 50.3356), 4326)::extensions.geography,
    'DE', 'Nürburg', 'Asphalt', 'Nürburgring official website', 'https://www.nuerburgring.de/', 'official_source', true
  ),
  (
    'Hockenheimring', 'hockenheimring', 'track_day',
    'Motorsport venue and scheduled driving-event context. Entry depends on the official event conditions.',
    'permit_required', extensions.st_setsrid(extensions.st_makepoint(8.5658, 49.3278), 4326)::extensions.geography,
    'DE', 'Hockenheim', 'Asphalt', 'Hockenheimring official website', 'https://www.hockenheimring.de/', 'official_source', true
  ),
  (
    'Bilster Berg', 'bilster-berg', 'proving_ground',
    'Private driving venue. Access, vehicle requirements and available formats must be confirmed with the operator.',
    'private', extensions.st_setsrid(extensions.st_makepoint(9.0682, 51.7816), 4326)::extensions.geography,
    'DE', 'Bad Driburg', 'Asphalt', 'Bilster Berg official website', 'https://www.bilster-berg.de/', 'official_source', true
  )
on conflict (slug) do nothing;

commit;
