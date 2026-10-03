import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { parseSupabaseEnv } from "@/lib/env";

export function createAdminClient(
  environment: Record<string, string | undefined> = process.env,
) {
  const publicEnvironment = parseSupabaseEnv({
    NEXT_PUBLIC_SUPABASE_URL: environment.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  const secret = environment.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error("Supabase server access is not configured.");

  return createSupabaseClient(
    publicEnvironment.NEXT_PUBLIC_SUPABASE_URL,
    secret,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
