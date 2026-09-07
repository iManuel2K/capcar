create table if not exists public.vehicle_passports (
  share_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vehicle_passports enable row level security;

create policy "Owners manage vehicle passports"
on public.vehicle_passports for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Anyone reads public vehicle passports"
on public.vehicle_passports for select
to anon, authenticated
using (is_public = true);
