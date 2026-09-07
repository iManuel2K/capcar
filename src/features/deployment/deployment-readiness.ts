export type DeploymentReadinessState = "local" | "configured" | "ready";

export type DeploymentCheck = {
  key: string;
  label: string;
  ready: boolean;
  detail: string;
};

export type DeploymentReadiness = {
  state: DeploymentReadinessState;
  ready: boolean;
  checks: DeploymentCheck[];
};

export function getDeploymentReadiness(
  environment: Record<string, string | undefined> = process.env,
): DeploymentReadiness {
  const siteUrl = environment.NEXT_PUBLIC_SITE_URL?.trim();
  const supabaseUrl = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const production =
    environment.VERCEL_ENV === "production" ||
    environment.CONTEXT === "production";
  const siteIsHttps = Boolean(siteUrl?.startsWith("https://"));
  const supabaseIsHttps = Boolean(supabaseUrl?.startsWith("https://"));

  const checks: DeploymentCheck[] = [
    {
      key: "site-url",
      label: "Canonical HTTPS site URL",
      ready: siteIsHttps,
      detail: siteIsHttps
        ? "A public HTTPS URL is configured."
        : "Set NEXT_PUBLIC_SITE_URL to the final https:// address.",
    },
    {
      key: "supabase-url",
      label: "Supabase project URL",
      ready: supabaseIsHttps,
      detail: supabaseIsHttps
        ? "A secure Supabase endpoint is configured."
        : "Add NEXT_PUBLIC_SUPABASE_URL in the production environment.",
    },
    {
      key: "supabase-key",
      label: "Supabase publishable key",
      ready: Boolean(publishableKey),
      detail: publishableKey
        ? "The browser-safe publishable key is present."
        : "Add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; never expose a secret key.",
    },
    {
      key: "production-host",
      label: "Production deployment",
      ready: production,
      detail: production
        ? "The application is running in the production environment."
        : "Local and preview environments remain in launch-preview mode. Netlify uses CONTEXT=production.",
    },
  ];
  const configured = siteIsHttps && supabaseIsHttps && Boolean(publishableKey);
  const ready = configured && production;

  return {
    state: ready ? "ready" : configured ? "configured" : "local",
    ready,
    checks,
  };
}
