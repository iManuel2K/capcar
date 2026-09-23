-- Photo locations use the existing published, source-linked Roadbook venue
-- and saved-place policies. No locations are published by this migration.
alter table public.roadbook_venues
  drop constraint roadbook_venues_category_check;

alter table public.roadbook_venues
  add constraint roadbook_venues_category_check check (category in (
    'drift_circuit', 'drag_acceleration', 'track_day',
    'proving_ground', 'scenic_route', 'autobahn_context', 'car_photo_spot'
  ));

alter table public.roadbook_venues
  add constraint roadbook_photo_spot_public_access_check check (
    category <> 'car_photo_spot' or access_status in ('public_context', 'permit_required')
  );

alter table public.roadbook_venues
  add constraint roadbook_photo_spot_published_details_check check (
    category <> 'car_photo_spot' or not published or coalesce((
      jsonb_typeof(requirements -> 'photo_spot') = 'object'
      and jsonb_typeof(requirements #> '{photo_spot,visualDescription}') = 'string'
      and jsonb_typeof(requirements #> '{photo_spot,bestTime}') = 'string'
      and jsonb_typeof(requirements #> '{photo_spot,lighting}') = 'string'
      and jsonb_typeof(requirements #> '{photo_spot,parkingAccess}') = 'string'
      and jsonb_typeof(requirements #> '{photo_spot,permissionRequired}') = 'boolean'
      and jsonb_typeof(requirements #> '{photo_spot,vehicleSuitability}') = 'string'
      and jsonb_typeof(requirements #> '{photo_spot,safetyNotes}') = 'string'
      and (not (requirements -> 'photo_spot' ? 'imageUrl')
        or jsonb_typeof(requirements #> '{photo_spot,imageLicense}') = 'string')
    ), false)
  );
