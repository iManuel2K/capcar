begin;

create table if not exists public.external_connections (
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('google')),
  provider_account_email text not null check (char_length(provider_account_email) between 3 and 320),
  access_token_ciphertext text not null,
  refresh_token_ciphertext text,
  scopes text[] not null default '{}',
  expires_at timestamptz not null,
  last_synced_at timestamptz,
  sync_status text not null default 'connected' check (sync_status in ('connected','syncing','ready','error')),
  sync_summary jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, provider)
);

alter table public.external_connections enable row level security;
revoke all on public.external_connections from public, anon, authenticated;

comment on table public.external_connections is
  'Server-only OAuth connection records. Tokens are application-encrypted before storage and never exposed through the browser Supabase client.';

commit;
