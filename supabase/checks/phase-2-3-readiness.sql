-- Read-only prerequisite check. Paste SQL, not a PowerShell command, into Supabase SQL Editor.
-- No customer records, credentials or personal details are returned.
select name as required_table, to_regclass('public.' || name) is not null as exists,
  coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.' || name)), false) as rls_enabled
from (values
  ('garage_snapshots'), ('vehicle_passports'), ('community_roles'),
  ('community_listings'), ('community_messages'), ('community_reports'),
  ('work_verifications'), ('community_audit'), ('public_retail_budget')
) as required(name);

select signature as required_function, to_regprocedure('public.' || signature) is not null as exists
from (values
  ('community_has_role(text)'), ('community_mutate(text,uuid,jsonb)'),
  ('consume_public_retail_budget()'), ('browse_published_listings()')
) as required(signature);
