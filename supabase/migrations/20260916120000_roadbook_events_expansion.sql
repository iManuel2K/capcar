begin;

-- Epics 137/138/149: verified venue expansion and source-led event discovery.
create table public.roadbook_events (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.roadbook_venues(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null default '' check (char_length(description) <= 1200),
  event_type text not null check (event_type in (
    'track_day', 'tourist_driving', 'driver_training',
    'motorsport', 'meet', 'festival'
  )),
  participation text not null check (participation in ('spectator', 'driver', 'mixed')),
  booking_required boolean not null default false,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  booking_url text check (booking_url is null or booking_url ~ '^https://'),
  entry_price_cents integer check (entry_price_cents >= 0),
  price_currency text not null default 'EUR' check (price_currency ~ '^[A-Z]{3}$'),
  source_label text not null check (char_length(source_label) between 2 and 120),
  source_url text not null check (source_url ~ '^https://'),
  verification_status text not null default 'unverified' check (verification_status in (
    'verified', 'official_source', 'community_report', 'stale', 'unverified'
  )),
  verified_at timestamptz,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at >= starts_at),
  check (verification_status <> 'verified' or verified_at is not null)
);

create index roadbook_events_upcoming_idx
  on public.roadbook_events (starts_at, ends_at) where published;
create index roadbook_events_venue_idx
  on public.roadbook_events (venue_id, starts_at) where published;

alter table public.roadbook_events enable row level security;
revoke all on public.roadbook_events from anon, authenticated;
grant select on public.roadbook_events to anon, authenticated;

drop policy if exists "Published Roadbook events are public" on public.roadbook_events;
create policy "Published Roadbook events are public"
on public.roadbook_events for select to anon, authenticated
using (published = true and ends_at >= now());

-- Every record below links to the venue operator. Capcar does not infer
-- current access, prices or driver eligibility from the venue name alone.
insert into public.roadbook_venues (
  name, slug, category, description, access_status, location, country_code, city,
  surface, length_m, source_label, source_url, verification_status, verified_at,
  requirements, published
)
values
  (
    'DEKRA Lausitzring', 'dekra-lausitzring', 'proving_ground',
    'Motorsport, testing and technology venue. Access depends on the published event or an arrangement with the operator.',
    'permit_required', extensions.st_setsrid(extensions.st_makepoint(13.9272, 51.5346), 4326)::extensions.geography,
    'DE', 'Klettwitz', 'Asphalt', 4534,
    'DEKRA Lausitzring official website', 'https://dekra-lausitzring.de/',
    'official_source', now(), '{"requiresRoadLegal":false}'::jsonb, true
  ),
  (
    'Motorsport Arena Oschersleben', 'motorsport-arena-oschersleben', 'track_day',
    'Permanent motorsport venue with public events, training and scheduled driving formats. Confirm the exact participant rules before travelling.',
    'permit_required', extensions.st_setsrid(extensions.st_makepoint(11.2786, 52.0266), 4326)::extensions.geography,
    'DE', 'Oschersleben', 'Asphalt', 3667,
    'Motorsport Arena Oschersleben official website', 'https://www.motorsportarena.com/',
    'official_source', now(), '{"requiresRoadLegal":false}'::jsonb, true
  ),
  (
    'Circuit de Spa-Francorchamps', 'circuit-spa-francorchamps', 'track_day',
    'Permanent Belgian circuit. Public access, driving sessions and event entry are governed by the official calendar and organiser conditions.',
    'permit_required', extensions.st_setsrid(extensions.st_makepoint(5.9714, 50.4372), 4326)::extensions.geography,
    'BE', 'Stavelot', 'Asphalt', 7004,
    'Circuit de Spa-Francorchamps official website', 'https://www.spa-francorchamps.be/',
    'official_source', now(), '{"requiresRoadLegal":false}'::jsonb, true
  ),
  (
    'Circuit Zandvoort', 'circuit-zandvoort', 'track_day',
    'Permanent circuit in the Dutch dunes. Check the official event schedule and participant requirements for each visit.',
    'permit_required', extensions.st_setsrid(extensions.st_makepoint(4.5409, 52.3888), 4326)::extensions.geography,
    'NL', 'Zandvoort', 'Asphalt', 4259,
    'Circuit Zandvoort official website', 'https://www.circuitzandvoort.nl/en/',
    'official_source', now(), '{"requiresRoadLegal":false}'::jsonb, true
  ),
  (
    'Red Bull Ring', 'red-bull-ring', 'track_day',
    'Permanent Austrian circuit and driving centre. Driver participation requires the relevant official programme or booking.',
    'permit_required', extensions.st_setsrid(extensions.st_makepoint(14.7647, 47.2197), 4326)::extensions.geography,
    'AT', 'Spielberg', 'Asphalt', 4318,
    'Red Bull Ring official website', 'https://www.redbullring.com/',
    'official_source', now(), '{"requiresRoadLegal":false}'::jsonb, true
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  access_status = excluded.access_status,
  location = excluded.location,
  country_code = excluded.country_code,
  city = excluded.city,
  surface = excluded.surface,
  length_m = excluded.length_m,
  source_label = excluded.source_label,
  source_url = excluded.source_url,
  verification_status = excluded.verification_status,
  verified_at = excluded.verified_at,
  requirements = excluded.requirements,
  published = true,
  updated_at = now();

insert into public.roadbook_events (
  venue_id, title, slug, description, event_type, participation,
  booking_required, starts_at, ends_at, booking_url, source_label, source_url,
  verification_status, verified_at, published
)
select v.id, seed.title, seed.slug, seed.description, seed.event_type,
  seed.participation, seed.booking_required, seed.starts_at, seed.ends_at,
  seed.booking_url, seed.source_label, seed.source_url,
  'official_source', now(), true
from (
  values
    (
      'dekra-lausitzring', 'DEKRA Klassik Tage', 'dekra-klassik-tage-2026',
      'Official venue event for historic vehicles and automotive culture.',
      'festival', 'spectator', false,
      timestamptz '2026-09-19 09:00:00+02', timestamptz '2026-09-20 18:00:00+02',
      'https://dekra-lausitzring.de/events/', 'DEKRA Lausitzring event calendar', 'https://dekra-lausitzring.de/events/'
    ),
    (
      'dekra-lausitzring', 'DMV Goodyear Racing Days', 'dmv-goodyear-racing-days-lausitzring-2026',
      'Officially listed motorsport weekend. Participation and spectator access follow organiser rules.',
      'motorsport', 'spectator', true,
      timestamptz '2026-09-25 09:00:00+02', timestamptz '2026-09-27 18:00:00+02',
      'https://dekra-lausitzring.de/events/', 'DEKRA Lausitzring event calendar', 'https://dekra-lausitzring.de/events/'
    ),
    (
      'dekra-lausitzring', 'GRIP – Das Motorevent', 'grip-motorevent-lausitzring-2026',
      'Officially listed automotive performance and community event.',
      'festival', 'spectator', true,
      timestamptz '2026-10-04 09:00:00+02', timestamptz '2026-10-04 18:00:00+02',
      'https://dekra-lausitzring.de/events/', 'DEKRA Lausitzring event calendar', 'https://dekra-lausitzring.de/events/'
    ),
    (
      'motorsport-arena-oschersleben', 'Arena Training', 'oschersleben-arena-training-2026-09-23',
      'Scheduled driver-training format. Confirm eligibility, vehicle rules and availability with the operator.',
      'driver_training', 'driver', true,
      timestamptz '2026-09-23 08:00:00+02', timestamptz '2026-09-23 18:00:00+02',
      'https://www.motorsportarena.com/Termine', 'Motorsport Arena official calendar', 'https://www.motorsportarena.com/Termine'
    ),
    (
      'motorsport-arena-oschersleben', 'DRX Rallycross', 'oschersleben-drx-rallycross-2026',
      'Officially listed rallycross weekend at Motorsport Arena Oschersleben.',
      'motorsport', 'spectator', true,
      timestamptz '2026-10-10 08:00:00+02', timestamptz '2026-10-11 18:00:00+02',
      'https://www.motorsportarena.com/Termine', 'Motorsport Arena official calendar', 'https://www.motorsportarena.com/Termine'
    ),
    (
      'motorsport-arena-oschersleben', 'Touristenfahrten', 'oschersleben-touristenfahrten-2026-10-14',
      'Scheduled public driving session. Driver and vehicle requirements must be confirmed before booking.',
      'tourist_driving', 'driver', true,
      timestamptz '2026-10-14 08:00:00+02', timestamptz '2026-10-14 18:00:00+02',
      'https://www.motorsportarena.com/Termine', 'Motorsport Arena official calendar', 'https://www.motorsportarena.com/Termine'
    ),
    (
      'motorsport-arena-oschersleben', 'Welfen Racing Days', 'oschersleben-welfen-racing-days-2026',
      'Officially listed motorsport weekend at Motorsport Arena Oschersleben.',
      'motorsport', 'spectator', true,
      timestamptz '2026-10-16 08:00:00+02', timestamptz '2026-10-18 18:00:00+02',
      'https://www.motorsportarena.com/Termine', 'Motorsport Arena official calendar', 'https://www.motorsportarena.com/Termine'
    ),
    (
      'circuit-spa-francorchamps', 'Ultimate Cup European Series', 'spa-ultimate-cup-european-series-2026',
      'Officially listed European motorsport weekend at Spa-Francorchamps.',
      'motorsport', 'spectator', true,
      timestamptz '2026-09-18 08:00:00+02', timestamptz '2026-09-20 18:00:00+02',
      'https://www.spa-francorchamps.be/', 'Circuit de Spa-Francorchamps official website', 'https://www.spa-francorchamps.be/'
    )
) as seed(
  venue_slug, title, slug, description, event_type, participation,
  booking_required, starts_at, ends_at, booking_url, source_label, source_url
)
join public.roadbook_venues v on v.slug = seed.venue_slug
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  event_type = excluded.event_type,
  participation = excluded.participation,
  booking_required = excluded.booking_required,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  booking_url = excluded.booking_url,
  source_label = excluded.source_label,
  source_url = excluded.source_url,
  verification_status = excluded.verification_status,
  verified_at = excluded.verified_at,
  published = true,
  updated_at = now();

commit;
