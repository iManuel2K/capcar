begin;

alter table public.user_ai_connections
  drop constraint if exists user_ai_connections_provider_check;

alter table public.user_ai_connections
  add constraint user_ai_connections_provider_check
  check (provider in ('gemini', 'openai', 'anthropic'));

commit;
