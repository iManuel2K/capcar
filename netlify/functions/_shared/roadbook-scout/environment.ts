type ScoutEnvironment = {
  supabaseUrl: string;
  supabaseSecretKey: string;
  unsplashAccessKey?: string;
  manualRunSecret?: string;
};

function readEnvironment(name: string) {
  return process.env[name]?.trim();
}

export function getScoutEnvironment(): ScoutEnvironment {
  const supabaseUrl =
    readEnvironment("SUPABASE_URL") ??
    readEnvironment("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseSecretKey =
    readEnvironment("SUPABASE_SECRET_KEY") ??
    readEnvironment("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "Roadbook Scout needs SUPABASE_URL and SUPABASE_SECRET_KEY.",
    );
  }

  return {
    supabaseUrl,
    supabaseSecretKey,
    unsplashAccessKey: readEnvironment("UNSPLASH_ACCESS_KEY"),
    manualRunSecret: readEnvironment("ROADBOOK_SCOUT_SECRET"),
  };
}
