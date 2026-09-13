begin;
do $$ begin
  if to_regclass('public.specialist_applications') is null then raise exception 'Apply the 96-101 beta_hardening migration first.'; end if;
end $$;
create table public.specialist_public_profiles (
  application_id uuid primary key references public.specialist_applications(id) on delete cascade,
  summary text not null check (char_length(summary) between 20 and 1000),
  services text not null check (char_length(services) between 3 and 250),
  service_area text not null check (char_length(service_area) between 2 and 150),
  published boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.specialist_public_profiles enable row level security;
revoke all on public.specialist_public_profiles from public,anon,authenticated;
grant select on public.specialist_public_profiles to authenticated;
create policy "Owner reads publication settings" on public.specialist_public_profiles for select to authenticated using (exists(select 1 from public.specialist_applications a where a.id=application_id and a.user_id=auth.uid()));
create function public.publish_specialist_profile(p_summary text,p_services text,p_area text,p_published boolean) returns void
language plpgsql security definer set search_path='' as $$
declare a public.specialist_applications%rowtype; allowed boolean;
begin
  if auth.uid() is null or public.community_has_role('suspended') then raise exception 'Active account required'; end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
  select * into a from public.specialist_applications where user_id=auth.uid() and status='approved';
  if not found or not public.community_has_role('specialist') then raise exception 'Approved specialist required'; end if;
  select r.allowed into allowed from public.consume_api_rate_limit('specialist-profile',10,3600) r;
  if not coalesce(allowed,false) then raise exception 'Try again later'; end if;
  insert into public.specialist_public_profiles(application_id,summary,services,service_area,published) values(a.id,btrim(p_summary),btrim(p_services),btrim(p_area),p_published)
    on conflict(application_id) do update set summary=excluded.summary,services=excluded.services,service_area=excluded.service_area,published=excluded.published,updated_at=now();
end $$;
create function public.browse_specialist_profiles() returns table(id uuid,business_name text,city text,website text,summary text,services text,service_area text)
language sql stable security definer set search_path='' as $$
  select a.user_id,a.business_name,a.city,a.website,p.summary,p.services,p.service_area
  from public.specialist_applications a join public.specialist_public_profiles p on p.application_id=a.id
  where p.published and a.status='approved' and exists(select 1 from public.community_roles r where r.user_id=a.user_id and r.role='specialist') and not exists(select 1 from public.community_roles r where r.user_id=a.user_id and r.role='suspended')
  order by a.business_name,a.id limit 200;
$$;
revoke all on function public.publish_specialist_profile(text,text,text,boolean),public.browse_specialist_profiles() from public,anon,authenticated;
grant execute on function public.publish_specialist_profile(text,text,text,boolean) to authenticated;
grant execute on function public.browse_specialist_profiles() to anon,authenticated;

create table public.community_listing_photos (
  listing_id uuid primary key references public.community_listings(id) on delete cascade,
  object_path text not null unique check (char_length(object_path)<200),
  updated_at timestamptz not null default now()
);
alter table public.community_listing_photos enable row level security;
revoke all on public.community_listing_photos from public,anon,authenticated;
grant select on public.community_listing_photos to anon,authenticated;
create function public.can_read_listing_photo(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.community_listings l where l.id=p_id and (
    (l.status='published' and not exists(select 1 from public.community_roles r where r.user_id=l.seller_id and r.role='suspended'))
    or (auth.uid() is not null and not public.community_has_role('suspended') and (l.seller_id=auth.uid() or public.community_has_role('moderator')))
  ));
$$;
revoke all on function public.can_read_listing_photo(uuid) from public;
grant execute on function public.can_read_listing_photo(uuid) to anon,authenticated;
create policy "Read visible listing photo" on public.community_listing_photos for select to anon,authenticated using(public.can_read_listing_photo(listing_id));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('listing-photos','listing-photos',false,1048576,array['image/jpeg']) on conflict(id) do nothing;
do $$ begin if exists(select 1 from storage.buckets where id='listing-photos' and public) then raise exception 'listing-photos must be a private bucket'; end if; end $$;
create policy "Upload own listing photo" on storage.objects for insert to authenticated with check (
  bucket_id='listing-photos' and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}[.]jpg$' and (storage.foldername(name))[1]=auth.uid()::text and not public.community_has_role('suspended') and exists(select 1 from public.community_listings l where l.id::text=(storage.foldername(name))[2] and l.seller_id=auth.uid() and l.status in ('pending','published','rejected'))
);
create policy "Read own photo object" on storage.objects for select to authenticated using (
  bucket_id='listing-photos' and (storage.foldername(name))[1]=auth.uid()::text
);
create policy "Read visible linked photo object" on storage.objects for select to anon,authenticated using (
  bucket_id='listing-photos' and exists(select 1 from public.community_listing_photos p where p.object_path=name and public.can_read_listing_photo(p.listing_id))
);
create policy "Remove own photo object" on storage.objects for delete to authenticated using(bucket_id='listing-photos' and (storage.foldername(name))[1]=auth.uid()::text);
create function public.attach_listing_photo(p_id uuid,p_path text) returns text language plpgsql security definer set search_path='' as $$
declare l public.community_listings%rowtype; old_path text;
begin
  if auth.uid() is null or public.community_has_role('suspended') then raise exception 'Active account required'; end if;
  select * into l from public.community_listings where id=p_id for update;
  if not found or l.seller_id<>auth.uid() or l.status not in ('pending','published','rejected') then raise exception 'Editable own listing required'; end if;
  if p_path is null or p_path !~ ('^'||auth.uid()::text||'/'||p_id::text||'/[0-9a-f-]{36}[.]jpg$') or not exists(select 1 from storage.objects where bucket_id='listing-photos' and name=p_path) then raise exception 'Own uploaded photo required'; end if;
  select object_path into old_path from public.community_listing_photos where listing_id=p_id;
  insert into public.community_listing_photos(listing_id,object_path) values(p_id,p_path) on conflict(listing_id) do update set object_path=excluded.object_path,updated_at=now();
  update public.community_listings set status='pending' where id=p_id;
  return old_path;
end $$;
revoke all on function public.attach_listing_photo(uuid,text) from public,anon;
grant execute on function public.attach_listing_photo(uuid,text) to authenticated;
commit;
