type PriceWatchEnvironment = {
  supabaseUrl: string;
  supabaseSecretKey: string;
  jobSecret: string;
  providers: Record<string, string | undefined>;
};

function read(name: string) {
  return process.env[name]?.trim();
}

export function getPriceWatchEnvironment(): PriceWatchEnvironment {
  const supabaseUrl = read("SUPABASE_URL") ?? read("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseSecretKey =
    read("SUPABASE_SECRET_KEY") ?? read("SUPABASE_SERVICE_ROLE_KEY");
  const jobSecret = read("PRICE_WATCH_JOB_SECRET");
  if (!supabaseUrl || !supabaseSecretKey || !jobSecret)
    throw new Error(
      "Scheduled price watches need SUPABASE_URL, SUPABASE_SECRET_KEY and PRICE_WATCH_JOB_SECRET.",
    );
  return {
    supabaseUrl,
    supabaseSecretKey,
    jobSecret,
    providers: {
      CAPCAR_EBAY_CLIENT_ID: read("CAPCAR_EBAY_CLIENT_ID"),
      CAPCAR_EBAY_CLIENT_SECRET: read("CAPCAR_EBAY_CLIENT_SECRET"),
      CAPCAR_EBAY_ACCESS_TOKEN: read("CAPCAR_EBAY_ACCESS_TOKEN"),
      CAPCAR_EBAY_CAMPAIGN_ID: read("CAPCAR_EBAY_CAMPAIGN_ID"),
      CAPCAR_RETAIL_PARTNER_NAME: read("CAPCAR_RETAIL_PARTNER_NAME"),
      CAPCAR_RETAIL_PARTNER_ENDPOINT: read("CAPCAR_RETAIL_PARTNER_ENDPOINT"),
      CAPCAR_RETAIL_PARTNER_API_KEY: read("CAPCAR_RETAIL_PARTNER_API_KEY"),
    },
  };
}
