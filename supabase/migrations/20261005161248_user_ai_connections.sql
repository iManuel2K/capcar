begin;

create table public.user_ai_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider text not null check (provider in ('openai', 'anthropic')),
  api_key_ciphertext text not null,
  key_hint text not null check (char_length(key_hint) between 4 and 24),
  model text not null check (char_length(model) between 2 and 120),
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_ai_connections enable row level security;
revoke all on table public.user_ai_connections from public, anon, authenticated;

comment on table public.user_ai_connections is
  'Server-only, per-user AI provider credentials. API keys are application-encrypted and never exposed through the browser Supabase client.';

commit;
