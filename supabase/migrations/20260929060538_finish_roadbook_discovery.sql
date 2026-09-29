begin;

-- Roadbook opens as a European discovery map. Keep the spatial query bounded,
-- but allow the initial continent view to return the existing curated catalog.
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
      least(greatest(p_radius_m, 1000), 3500000)
    )
  order by extensions.st_distance(
    v.location,
    extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography
  )
  limit 250;
$$;

revoke all on function public.roadbook_venues_nearby(double precision, double precision, integer, text[]) from public;
grant execute on function public.roadbook_venues_nearby(double precision, double precision, integer, text[]) to anon, authenticated;

commit;
