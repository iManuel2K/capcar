import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "@/lib/env";

function createBrowserSupabaseClient() {
  const env = getSupabaseEnv();

  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      isSingleton: true,
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    },
  );
}

let browserClient: ReturnType<typeof createBrowserSupabaseClient> | undefined;

export function createClient() {
  browserClient ??= createBrowserSupabaseClient();
  return browserClient;
}
