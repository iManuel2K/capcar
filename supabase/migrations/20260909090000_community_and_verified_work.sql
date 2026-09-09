-- No client may grant roles, publish listings or issue its own verified stamp.
create table public.community_roles (
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('moderator','specialist','reviewed_seller','suspended')),
  display_name text not null check (length(display_name) between 2 and 100),
  primary key(user_id, role)
);
create function public.community_has_role(p_role text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.community_roles where user_id = auth.uid() and role = p_role);
$$;
revoke all on function public.community_has_role(text) from public, anon;
grant execute on function public.community_has_role(text) to authenticated;

create table public.community_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  title text not null check(length(title) between 5 and 120),
  description text not null check(length(description) between 20 and 3000),
  city text not null check(length(city) between 2 and 100),
  price_cents integer not null check(price_cents between 100 and 10000000),
  condition text not null check(condition in ('new','used','for-parts')),
  status text not null default 'pending' check(status in ('pending','published','rejected','withdrawn','sold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.community_listings(status, created_at desc);
create index on public.community_listings(seller_id);
create table public.community_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.community_listings(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check(length(reason) between 10 and 1000),
  closed boolean not null default false,
  created_at timestamptz not null default now(),
  unique(listing_id, reporter_id)
);
create table public.community_messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.community_listings(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null check(length(body) between 5 and 2000),
  created_at timestamptz not null default now(),
  check(sender_id <> recipient_id)
);
create index on public.community_messages(recipient_id, created_at desc);
create table public.work_verifications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id text not null check(length(vehicle_id) between 1 and 150),
  specialist_id uuid not null references auth.users(id) on delete cascade,
  work text not null check(length(work) between 5 and 500),
  performed_on date not null check(performed_on >= '1900-01-01'),
  status text not null default 'requested' check(status in ('requested','verified','rejected','revoked')),
  evidence text check(length(evidence) between 5 and 500),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  check(owner_id <> specialist_id),
  check(status not in ('verified','rejected') or evidence is not null)
);
create index on public.work_verifications(owner_id, vehicle_id);
create index on public.work_verifications(specialist_id);
create table public.community_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  target_id uuid not null,
  action text not null,
  reason text not null check(length(reason) between 5 and 1000),
  created_at timestamptz not null default now()
);
alter table public.community_roles enable row level security;
alter table public.community_listings enable row level security;
alter table public.community_reports enable row level security;
alter table public.community_messages enable row level security;
alter table public.work_verifications enable row level security;
alter table public.community_audit enable row level security;
revoke all on public.community_roles, public.community_listings, public.community_reports, public.community_messages, public.work_verifications, public.community_audit from anon, authenticated;
grant select on public.community_roles, public.community_listings, public.community_reports, public.community_messages, public.work_verifications, public.community_audit to authenticated;
create policy "Read community roles" on public.community_roles for select to authenticated using (role in ('specialist','reviewed_seller') or user_id=auth.uid());
create policy "Read visible listings" on public.community_listings for select to authenticated using (status='published' or seller_id=auth.uid() or public.community_has_role('moderator'));
create policy "Read own reports" on public.community_reports for select to authenticated using (reporter_id=auth.uid() or public.community_has_role('moderator'));
create policy "Read participant messages" on public.community_messages for select to authenticated using (sender_id=auth.uid() or recipient_id=auth.uid());
create policy "Read relevant stamps" on public.work_verifications for select to authenticated using (owner_id=auth.uid() or (specialist_id=auth.uid() and public.community_has_role('specialist')));
create policy "Moderators read audit" on public.community_audit for select to authenticated using(public.community_has_role('moderator'));

create function public.community_mutate(p_action text, p_id uuid default null, p_data jsonb default '{}') returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  u uuid := auth.uid(); l public.community_listings; w public.work_verifications;
  result uuid; allowed boolean; v_snapshot jsonb; v_vehicles jsonb;
begin
  if u is null or not exists(select 1 from auth.users where id=u and email_confirmed_at is not null) then raise exception 'Confirmed account required'; end if;
  if public.community_has_role('suspended') and p_action not in ('withdraw','revoke_stamp') then raise exception 'Account suspended from community activity'; end if;
  select r.allowed into allowed from public.consume_api_rate_limit('community-write',20,60) r;
  if not coalesce(allowed,false) then raise exception 'Too many requests'; end if;
  -- Serialize writes by this actor to make quotas meaningful under concurrency.
  perform pg_advisory_xact_lock(hashtextextended(u::text,0));
  if p_action = 'create' then
    if (select count(*) from public.community_listings where seller_id=u and status in ('pending','published')) >= 20 then raise exception 'Active listing limit reached'; end if;
    insert into public.community_listings(seller_id,title,description,city,price_cents,condition)
    values(u,trim(p_data->>'title'),trim(p_data->>'description'),trim(p_data->>'city'),(p_data->>'price_cents')::integer,p_data->>'condition') returning id into result;
  elsif p_action in ('edit','withdraw','sold','moderate','report','message','review_seller','suspend_seller') then
    select * into l from public.community_listings where id=p_id for update;
    if not found then raise exception 'Listing unavailable'; end if;
    result := l.id;
    if p_action in ('edit','withdraw','sold') then
      if l.seller_id<>u then raise exception 'Owner required'; end if;
      if p_action='edit' then
        if l.status not in ('pending','published') then raise exception 'Create a new listing after closure'; end if;
        update public.community_listings set title=trim(p_data->>'title'), description=trim(p_data->>'description'), city=trim(p_data->>'city'), price_cents=(p_data->>'price_cents')::integer, condition=p_data->>'condition', status='pending', updated_at=now() where id=l.id;
      else
        update public.community_listings set status=case when p_action='sold' then 'sold' else 'withdrawn' end,updated_at=now() where id=l.id;
      end if;
    elsif p_action in ('moderate','review_seller','suspend_seller') then
      if not public.community_has_role('moderator') or l.seller_id=u then raise exception 'Independent moderator required'; end if;
      if p_action='moderate' then
        if l.status in ('withdrawn','sold') then raise exception 'Closed listings cannot be republished'; end if;
        if p_data->>'status'='published' and exists(select 1 from public.community_roles where user_id=l.seller_id and role='suspended') then raise exception 'Suspended seller cannot publish'; end if;
        if p_data->>'status' not in ('published','rejected') or p_data->>'status' is null then raise exception 'Invalid decision'; end if;
        update public.community_listings set status=p_data->>'status', updated_at=now() where id=l.id;
      elsif p_action='review_seller' then
        if exists(select 1 from public.community_roles where user_id=l.seller_id and role='suspended') then raise exception 'Seller is suspended'; end if;
        insert into public.community_roles(user_id,role,display_name) values(l.seller_id,'reviewed_seller','Reviewed community seller') on conflict do nothing;
      else
        insert into public.community_roles(user_id,role,display_name) values(l.seller_id,'suspended','Suspended community account') on conflict do nothing;
        delete from public.community_roles where user_id=l.seller_id and role='reviewed_seller';
        update public.community_listings set status='rejected',updated_at=now() where seller_id=l.seller_id and status in ('pending','published');
      end if;
      insert into public.community_audit(actor_id,target_id,action,reason) values(u,l.id,p_action,trim(p_data->>'reason'));
    elsif p_action='report' then
      if l.status<>'published' or l.seller_id=u then raise exception 'Published listing required'; end if;
      insert into public.community_reports(listing_id,reporter_id,reason) values(l.id,u,trim(p_data->>'reason')) on conflict(listing_id,reporter_id) do update set reason=excluded.reason,closed=false;
    else
      if l.status<>'published' or l.seller_id=u then raise exception 'Published listing required'; end if;
      insert into public.community_messages(listing_id,sender_id,recipient_id,body) values(l.id,u,l.seller_id,trim(p_data->>'body'));
    end if;
  elsif p_action='reply' then
    if exists(select 1 from public.community_messages m join public.community_roles r on r.user_id=m.sender_id and r.role='suspended' where m.id=p_id) then raise exception 'Recipient unavailable'; end if;
    insert into public.community_messages(listing_id,sender_id,recipient_id,body)
      select listing_id,u,sender_id,trim(p_data->>'body') from public.community_messages where id=p_id and recipient_id=u returning id into result;
    if result is null then raise exception 'Message unavailable'; end if;
  elsif p_action='close_report' then
    if not public.community_has_role('moderator') then raise exception 'Moderator required'; end if;
    update public.community_reports set closed=true where id=p_id returning id into result;
    insert into public.community_audit(actor_id,target_id,action,reason) values(u,p_id,p_action,trim(p_data->>'reason'));
  elsif p_action='request_stamp' then
    select payload into v_snapshot from public.garage_snapshots where user_id=u;
    v_vehicles := coalesce((v_snapshot->'data'->>'capcar.vehicles.v1')::jsonb,'[]'::jsonb);
    if not exists(select 1 from jsonb_array_elements(v_vehicles) v where v->>'id'=p_data->>'vehicle_id' and coalesce((v->>'demoProject')::boolean,false)=false) then raise exception 'Sync your real vehicle first'; end if;
    if not exists(select 1 from public.community_roles where user_id=(p_data->>'specialist_id')::uuid and role='specialist') then raise exception 'Approved specialist required'; end if;
    if (p_data->>'performed_on')::date>current_date then raise exception 'Future work cannot be stamped'; end if;
    if exists(select 1 from public.work_verifications where owner_id=u and vehicle_id=p_data->>'vehicle_id' and specialist_id=(p_data->>'specialist_id')::uuid and work=trim(p_data->>'work') and status='requested') then raise exception 'Request already exists'; end if;
    insert into public.work_verifications(owner_id,vehicle_id,specialist_id,work,performed_on) values(u,p_data->>'vehicle_id',(p_data->>'specialist_id')::uuid,trim(p_data->>'work'),(p_data->>'performed_on')::date) returning id into result;
  elsif p_action in ('decide_stamp','revoke_stamp') then
    select * into w from public.work_verifications where id=p_id for update;
    if not found then raise exception 'Stamp unavailable'; end if;
    if p_action='revoke_stamp' then
      if w.owner_id<>u and not (w.specialist_id=u and public.community_has_role('specialist')) then raise exception 'Not authorized'; end if;
      update public.work_verifications set status='revoked',decided_at=now() where id=w.id;
    else
      if w.specialist_id<>u or not public.community_has_role('specialist') or w.status<>'requested' then raise exception 'Assigned specialist required'; end if;
      if p_data->>'status' not in ('verified','rejected') or p_data->>'status' is null then raise exception 'Invalid decision'; end if;
      update public.work_verifications set status=p_data->>'status',evidence=trim(p_data->>'evidence'),decided_at=now() where id=w.id;
    end if;
    result:=w.id;
  else raise exception 'Unknown action';
  end if;
  return result;
end;
$$;
revoke all on function public.community_mutate(text,uuid,jsonb) from public, anon;
grant execute on function public.community_mutate(text,uuid,jsonb) to authenticated;

-- Extend the existing erase-data action; deleting the account also cascades these records.
create or replace function public.delete_current_user_data() returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();
begin
  if u is null then raise exception 'Authentication required'; end if;
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
