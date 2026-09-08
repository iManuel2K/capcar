alter table public.affiliate_clicks
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists vehicle_passports_user_created_idx
  on public.vehicle_passports (user_id, created_at desc);

drop policy if exists "Public can record outbound affiliate clicks"
  on public.affiliate_clicks;

create policy "Authenticated users record their own outbound clicks"
on public.affiliate_clicks for insert
to authenticated
with check ((select auth.uid()) = user_id);

create or replace function public.delete_current_user_data()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  delete from public.vehicle_passports where user_id = v_user_id;
  delete from public.garage_snapshots where user_id = v_user_id;
  delete from public.api_rate_limits where user_id = v_user_id;
  delete from public.affiliate_clicks where user_id = v_user_id;
end;
$$;

create or replace function public.delete_current_user()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  perform public.delete_current_user_data();
  delete from auth.users where id = v_user_id;
end;
$$;

revoke all on function public.delete_current_user_data() from public, anon;
revoke all on function public.delete_current_user() from public, anon;
grant execute on function public.delete_current_user_data() to authenticated;
grant execute on function public.delete_current_user() to authenticated;
