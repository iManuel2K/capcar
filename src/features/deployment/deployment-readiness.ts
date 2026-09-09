import { getLegalConfiguration } from "@/features/legal/legal-config";
import { getProviderStatuses } from "@/features/providers/provider-config";

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
  const legal = getLegalConfiguration(environment);
  const siteUrl = environment.NEXT_PUBLIC_SITE_URL?.trim();
  const supabaseUrl = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const deploymentEnvironment = environment.NEXT_PUBLIC_DEPLOYMENT_ENV?.trim();
  const ebayMode = environment.CAPCAR_EBAY_MODE?.trim().toLowerCase() || "demo";
  const ebayModeValid = ebayMode === "demo" || ebayMode === "live";
  const campaignId = environment.CAPCAR_EBAY_CAMPAIGN_ID?.trim();
  const ebayReady =
    ebayModeValid &&
    (!campaignId || /^\d+$/.test(campaignId)) &&
    (ebayMode !== "live" ||
      Boolean(
        environment.CAPCAR_EBAY_CLIENT_ID?.trim() &&
        environment.CAPCAR_EBAY_CLIENT_SECRET?.trim(),
      ));
  const productProvidersReady = getProviderStatuses(environment).every(
    (provider) => provider.configured,
  );
  const production =
    deploymentEnvironment === "production" ||
    environment.VERCEL_ENV === "production" ||
    environment.CONTEXT === "production";
  const siteIsHttps = isHttpsUrl(siteUrl);
  const supabaseIsHttps = isHttpsUrl(supabaseUrl);

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
        : "Set NEXT_PUBLIC_DEPLOYMENT_ENV=production on the live Netlify context.",
    },
    {
      key: "legal-identity",
      label: "Public operator and privacy contact",
      ready: legal.complete,
      detail: legal.complete
        ? "Operator, address and privacy contact are configured."
        : "Set the operator, address and privacy contact variables before public launch.",
    },
    {
      key: "product-providers",
      label: "Product data providers",
      ready: productProvidersReady,
      detail: productProvidersReady
        ? "Every selected product provider has its required server configuration."
        : "A selected external provider is missing its endpoint or server API key.",
    },
    {
      key: "ebay-search",
      label: "International parts search",
      ready: ebayReady,
      detail: ebayReady
        ? ebayMode === "live"
          ? "Live eBay search has server-only credentials."
          : "Clearly labelled demo search is active."
        : "eBay mode, server credentials or the optional campaign ID are invalid.",
    },
  ];
  const configured = siteIsHttps && supabaseIsHttps && Boolean(publishableKey);
  const ready = checks.every((check) => check.ready);

  return {
    state: ready ? "ready" : configured ? "configured" : "local",
    ready,
    checks,
  };
}

function isHttpsUrl(value: string | undefined) {
  if (!value) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
