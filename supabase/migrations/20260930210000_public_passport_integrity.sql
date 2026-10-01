begin;

alter table public.vehicle_passports
  add column if not exists record_hash text,
  add column if not exists expires_at timestamptz,
  add column if not exists revoked_at timestamptz;

alter table public.vehicle_passports
  drop constraint if exists vehicle_passports_record_hash_check;
alter table public.vehicle_passports
  add constraint vehicle_passports_record_hash_check
  check (record_hash is null or record_hash ~ '^[a-f0-9]{64}$');

create index if not exists vehicle_passports_public_expiry_idx
  on public.vehicle_passports (share_id, expires_at)
  where is_public and revoked_at is null;

grant select on public.vehicle_passports to anon;
grant select, insert, update, delete on public.vehicle_passports to authenticated;

drop policy if exists "Anyone reads public vehicle passports"
  on public.vehicle_passports;
create policy "Anyone reads valid public vehicle passports"
on public.vehicle_passports for select to anon, authenticated
using (
  is_public = true
  and revoked_at is null
  and (expires_at is null or expires_at > now())
);

comment on column public.vehicle_passports.record_hash is
  'SHA-256 of the canonical public Passport payload. Null identifies a legacy shared record.';
comment on column public.vehicle_passports.expires_at is
  'Optional owner-selected public-link expiry. Expired records are hidden by RLS.';
comment on column public.vehicle_passports.revoked_at is
  'Timestamp of owner revocation. Revoked records are hidden by RLS.';

commit;
