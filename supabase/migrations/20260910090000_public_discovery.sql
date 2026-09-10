-- Fixed global budgets protect anonymous retailer access across server instances.
create table public.public_retail_budget (
  id boolean primary key default true check (id),
  minute_start timestamptz not null,
  minute_count integer not null,
  day_start timestamptz not null,
  day_count integer not null
);
alter table public.public_retail_budget enable row level security;
revoke all on public.public_retail_budget from public, anon, authenticated;

create function public.consume_public_retail_budget()
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  t timestamptz := clock_timestamp();
  budget public.public_retail_budget%rowtype;
begin
  insert into public.public_retail_budget values (true, t, 0, t, 0)
    on conflict do nothing;
  select * into budget from public.public_retail_budget where id = true for update;
  if t >= budget.minute_start + interval '1 minute' then
    budget.minute_start := t; budget.minute_count := 0;
  end if;
  if t >= budget.day_start + interval '1 day' then
    budget.day_start := t; budget.day_count := 0;
  end if;
  if budget.minute_count >= 30 or budget.day_count >= 1200 then return false; end if;
  update public.public_retail_budget set
    minute_start = budget.minute_start, minute_count = budget.minute_count + 1,
    day_start = budget.day_start, day_count = budget.day_count + 1 where id = true;
  return true;
end;
$$;
revoke all on function public.consume_public_retail_budget() from public;
grant execute on function public.consume_public_retail_budget() to anon, authenticated;

-- Explicit public projection: no identities, inboxes, reports or work records.
create function public.browse_published_listings()
returns table (id uuid, title text, description text, city text, price_cents integer, condition text)
language sql stable security definer set search_path = '' as $$
  select l.id, l.title, l.description, l.city, l.price_cents, l.condition
  from public.community_listings l
  where l.status = 'published' and not exists (
    select 1 from public.community_roles r where r.user_id = l.seller_id and r.role = 'suspended'
  )
  order by l.created_at desc, l.id limit 100;
$$;
revoke all on function public.browse_published_listings() from public;
grant execute on function public.browse_published_listings() to anon, authenticated;
