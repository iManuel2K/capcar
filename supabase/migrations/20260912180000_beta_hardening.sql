-- Requires the community and public-discovery migrations, in timestamp order.
begin;
do $$ begin
  if to_regclass('public.community_listings') is null or to_regclass('public.community_roles') is null then
    raise exception 'Apply the earlier community migrations before beta_hardening';
  end if;
end $$;

create table public.specialist_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  business_name text not null check (char_length(business_name) between 2 and 100),
  city text not null check (char_length(city) between 2 and 100),
  website text not null check (char_length(website) <= 300 and website ~ '^https://[A-Za-z0-9.-]+(:[0-9]+)?(/[^[:space:]]*)?$'),
  expertise text not null check (char_length(expertise) between 20 and 2000),
  status text not null default 'pending' check (status in ('pending','approved','rejected','revoked')),
  review_reason text check (char_length(review_reason) between 10 and 1000),
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.specialist_applications enable row level security;
revoke all on public.specialist_applications from public, anon, authenticated;
grant select on public.specialist_applications to authenticated;
create policy "Own applications or independent review" on public.specialist_applications for select to authenticated
using (user_id=auth.uid() or (public.community_has_role('moderator') and not public.community_has_role('suspended')));

create function public.specialist_apply(p_data jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); result uuid; allowed boolean;
begin
  if u is null or not exists(select 1 from auth.users where id=u and email_confirmed_at is not null) then raise exception 'Confirmed account required'; end if;
  perform pg_advisory_xact_lock(hashtext(u::text));
  if public.community_has_role('suspended') then raise exception 'Account suspended'; end if;
  select r.allowed into allowed from public.consume_api_rate_limit('specialist-apply',5,3600) r;
  if not coalesce(allowed,false) then raise exception 'Application limit reached'; end if;
  if (p_data->>'consent') is distinct from 'true' then raise exception 'Business authority confirmation required'; end if;
  if exists(select 1 from public.specialist_applications where user_id=u and status <> 'rejected') or public.community_has_role('specialist') then raise exception 'Application already active'; end if;
  insert into public.specialist_applications(user_id,business_name,city,website,expertise)
    values(u,btrim(p_data->>'business_name'),btrim(p_data->>'city'),btrim(p_data->>'website'),btrim(p_data->>'expertise'))
    on conflict(user_id) do update set business_name=excluded.business_name,city=excluded.city,website=excluded.website,expertise=excluded.expertise,status='pending',review_reason=null,reviewed_by=null,updated_at=now()
    returning id into result;
  return result;
end $$;

create function public.specialist_review(p_id uuid,p_status text,p_reason text) returns uuid
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); application public.specialist_applications%rowtype; allowed boolean;
begin
  if u is null or not public.community_has_role('moderator') or public.community_has_role('suspended') then raise exception 'Independent moderator required'; end if;
  if not exists(select 1 from auth.users where id=u and email_confirmed_at is not null) then raise exception 'Confirmed account required'; end if;
  select r.allowed into allowed from public.consume_api_rate_limit('specialist-review',30,60) r;
  if not coalesce(allowed,false) then raise exception 'Review limit reached'; end if;
  select * into application from public.specialist_applications where id=p_id;
  if not found or application.user_id=u then raise exception 'Independent review required'; end if;
  perform pg_advisory_xact_lock(hashtext(application.user_id::text));
  select * into application from public.specialist_applications where id=p_id for update;
  if not found then raise exception 'Application no longer exists'; end if;
  if p_status is null or p_status not in ('approved','rejected','revoked') or coalesce(char_length(btrim(p_reason)),0) not between 10 and 1000 then raise exception 'Review decision and evidence required'; end if;
  if (p_status='revoked' and application.status<>'approved') or (p_status in ('approved','rejected') and application.status<>'pending') then raise exception 'Application status changed'; end if;
  if p_status='approved' and exists(select 1 from public.community_roles where user_id=application.user_id and role='suspended') then raise exception 'Account suspended'; end if;
  update public.specialist_applications set status=p_status,review_reason=btrim(p_reason),reviewed_by=u,updated_at=now() where id=p_id;
  if p_status='approved' then
    insert into public.community_roles(user_id,role,display_name) values(application.user_id,'specialist',application.business_name)
      on conflict(user_id,role) do update set display_name=excluded.display_name;
  elsif p_status='revoked' then
    delete from public.community_roles where user_id=application.user_id and role='specialist';
  end if;
  insert into public.community_audit(actor_id,target_id,action,reason) values(u,p_id,'specialist_'||p_status,btrim(p_reason));
  return p_id;
end $$;
revoke all on function public.specialist_apply(jsonb),public.specialist_review(uuid,text,text) from public,anon;
grant execute on function public.specialist_apply(jsonb),public.specialist_review(uuid,text,text) to authenticated;

-- Defend direct RPC calls, not only browser forms. Part numbers remain valid.
create function public.guard_public_listing_content() returns trigger
language plpgsql set search_path='' as $$
begin
  if concat_ws(' ',new.title,new.description,new.city) ~* '(https?://|www[.]|[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,})' then
    raise exception 'Remove email addresses and web links from public listings';
  end if;
  return new;
end $$;
create trigger public_listing_content before insert or update of title,description,city on public.community_listings
for each row execute function public.guard_public_listing_content();

create function public.community_account_suspended(p_user uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.community_roles where user_id=p_user and role='suspended');
$$;
revoke all on function public.community_account_suspended(uuid) from public,anon;
grant execute on function public.community_account_suspended(uuid) to authenticated;
drop policy "Read visible listings" on public.community_listings;
create policy "Read visible listings" on public.community_listings for select to authenticated using (
  (status='published' and not public.community_account_suspended(seller_id)) or seller_id=auth.uid() or public.community_has_role('moderator')
);

create function public.guard_community_relationship() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if tg_table_name='community_messages' then
    if public.community_account_suspended(new.sender_id) or public.community_account_suspended(new.recipient_id) then raise exception 'Account suspended'; end if;
  else
    if new.status in ('requested','verified') and (public.community_account_suspended(new.specialist_id) or not exists(select 1 from public.community_roles where user_id=new.specialist_id and role='specialist')) then raise exception 'Active approved specialist required'; end if;
  end if;
  return new;
end $$;
create trigger community_message_accounts before insert on public.community_messages for each row execute function public.guard_community_relationship();
create trigger work_specialist_access before insert or update on public.work_verifications for each row execute function public.guard_community_relationship();

create function public.suspend_specialist_access() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if new.role='suspended' then
    perform pg_advisory_xact_lock(hashtext(new.user_id::text));
    delete from public.community_roles where user_id=new.user_id and role in ('specialist','reviewed_seller');
    update public.specialist_applications set status='revoked',review_reason='Specialist access withdrawn following account suspension.',updated_at=now() where user_id=new.user_id and status='approved';
  end if;
  return new;
end $$;
create trigger suspended_specialist after insert on public.community_roles for each row execute function public.suspend_specialist_access();

create or replace function public.delete_current_user_data() returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();
begin
  if u is null then raise exception 'Authentication required'; end if;
  delete from public.specialist_applications where user_id=u;
  update public.specialist_applications set reviewed_by=null where reviewed_by=u;
  delete from public.community_messages where sender_id=u or recipient_id=u;
  delete from public.community_reports where reporter_id=u;
  delete from public.community_listings where seller_id=u;
  delete from public.work_verifications where owner_id=u or specialist_id=u;
  delete from public.community_roles where user_id=u;
  update public.community_audit set actor_id=null where actor_id=u;
  delete from public.vehicle_passports where user_id=u;
  delete from public.garage_snapshots where user_id=u;
  delete from public.api_rate_limits where user_id=u;
  delete from public.affiliate_clicks where user_id=u;
end; $$;
commit;
