begin;

select plan(6);

select has_table(
  'public',
  'user_ai_connections',
  'user AI connection storage exists'
);

select ok(
  (select relrowsecurity
   from pg_class
   where oid = 'public.user_ai_connections'::regclass),
  'RLS is enabled'
);

select ok(
  not has_table_privilege('anon', 'public.user_ai_connections', 'select'),
  'anonymous visitors cannot read provider keys'
);

select ok(
  not has_table_privilege('authenticated', 'public.user_ai_connections', 'select'),
  'browser-authenticated users cannot read provider keys'
);

select ok(
  not has_table_privilege('anon', 'public.user_ai_connections', 'insert,update,delete'),
  'anonymous visitors cannot write provider keys'
);

select ok(
  not has_table_privilege('authenticated', 'public.user_ai_connections', 'insert,update,delete'),
  'browser-authenticated users cannot write provider keys'
);

select * from finish();

rollback;
