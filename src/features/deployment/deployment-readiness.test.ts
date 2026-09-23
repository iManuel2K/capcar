import { describe, expect, it } from "vitest";

import { getDeploymentReadiness } from "@/features/deployment/deployment-readiness";

describe("deployment readiness", () => {
  it("stays local without credentials", () => {
    const result = getDeploymentReadiness({});
    expect(result.state).toBe("local");
    expect(result.ready).toBe(false);
  });

  it("requires the production host after configuration", () => {
    const result = getDeploymentReadiness({
      NEXT_PUBLIC_SITE_URL: "https://capcar.example",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      VERCEL_ENV: "preview",
    });
    expect(result.state).toBe("configured");
    expect(result.ready).toBe(false);
  });

  it("is ready only on a configured production deployment", () => {
    const result = getDeploymentReadiness({
      NEXT_PUBLIC_SITE_URL: "https://capcar.example",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      NEXT_PUBLIC_LEGAL_OPERATOR: "Capcar Beta",
      NEXT_PUBLIC_LEGAL_ADDRESS: "Example address",
      NEXT_PUBLIC_PRIVACY_CONTACT: "privacy@example.test",
      VERCEL_ENV: "production",
    });
    expect(result.state).toBe("ready");
    expect(result.checks.every((check) => check.ready)).toBe(true);
  });

  it("recognizes a Netlify production deployment", () => {
    const result = getDeploymentReadiness({
      NEXT_PUBLIC_SITE_URL: "https://capcar.dev",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      NEXT_PUBLIC_LEGAL_OPERATOR: "Capcar Beta",
      NEXT_PUBLIC_LEGAL_ADDRESS: "Example address",
      NEXT_PUBLIC_PRIVACY_CONTACT: "privacy@example.test",
      CONTEXT: "production",
    });
    expect(result.state).toBe("ready");
    expect(result.ready).toBe(true);
  });

  it("supports an explicit production marker when the host omits build context", () => {
    const result = getDeploymentReadiness({
      NEXT_PUBLIC_SITE_URL: "https://capcar.dev",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      NEXT_PUBLIC_LEGAL_OPERATOR: "Capcar Beta",
      NEXT_PUBLIC_LEGAL_ADDRESS: "Example address",
      NEXT_PUBLIC_PRIVACY_CONTACT: "privacy@example.test",
      NEXT_PUBLIC_DEPLOYMENT_ENV: "production",
    });
    expect(result.state).toBe("ready");
    expect(result.ready).toBe(true);
  });

  it("blocks readiness when live eBay mode has incomplete credentials", () => {
    const result = getDeploymentReadiness({
      NEXT_PUBLIC_SITE_URL: "https://capcar.example",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      NEXT_PUBLIC_LEGAL_OPERATOR: "Capcar Beta",
      NEXT_PUBLIC_LEGAL_ADDRESS: "Example address",
      NEXT_PUBLIC_PRIVACY_CONTACT: "privacy@example.test",
      NEXT_PUBLIC_DEPLOYMENT_ENV: "production",
      CAPCAR_EBAY_MODE: "live",
      CAPCAR_EBAY_CLIENT_ID: "client-id",
    });

    expect(result.ready).toBe(false);
    expect(
      result.checks.find((check) => check.key === "ebay-search"),
    ).toMatchObject({ ready: false });
  });

  it("reports live eBay readiness without exposing credential values", () => {
    const result = getDeploymentReadiness({
      NEXT_PUBLIC_SITE_URL: "https://capcar.example",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      NEXT_PUBLIC_LEGAL_OPERATOR: "Capcar Beta",
      NEXT_PUBLIC_LEGAL_ADDRESS: "Example address",
      NEXT_PUBLIC_PRIVACY_CONTACT: "privacy@example.test",
      NEXT_PUBLIC_DEPLOYMENT_ENV: "production",
      CAPCAR_EBAY_MODE: "live",
      CAPCAR_EBAY_CLIENT_ID: "private-client-id",
      CAPCAR_EBAY_CLIENT_SECRET: "private-client-secret",
    });

    expect(result.ready).toBe(true);
    expect(JSON.stringify(result)).not.toContain("private-client");
  });

  it("blocks a selected external provider that is not fully configured", () => {
    const result = getDeploymentReadiness({
      NEXT_PUBLIC_SITE_URL: "https://capcar.example",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      NEXT_PUBLIC_LEGAL_OPERATOR: "Capcar Beta",
      NEXT_PUBLIC_LEGAL_ADDRESS: "Example address",
      NEXT_PUBLIC_PRIVACY_CONTACT: "privacy@example.test",
      NEXT_PUBLIC_DEPLOYMENT_ENV: "production",
      CAPCAR_VEHICLE_PROVIDER_MODE: "external",
    });

    expect(result.ready).toBe(false);
    expect(
      result.checks.find((check) => check.key === "product-providers"),
    ).toMatchObject({ ready: false });
  });
});
