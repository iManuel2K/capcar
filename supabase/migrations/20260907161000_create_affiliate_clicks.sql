create table if not exists public.affiliate_clicks (
  id bigint generated always as identity primary key,
  merchant text not null check (char_length(merchant) between 3 and 120),
  item_id text,
  clicked_at timestamptz not null default now()
);

alter table public.affiliate_clicks enable row level security;

create policy "Public can record outbound affiliate clicks"
on public.affiliate_clicks for insert
to anon, authenticated
with check (true);

-- There is deliberately no public SELECT policy. Aggregate reporting should
-- only be exposed later through a protected server-side analytics endpoint.
