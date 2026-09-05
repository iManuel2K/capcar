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
      VERCEL_ENV: "production",
    });
    expect(result.state).toBe("ready");
    expect(result.checks.every((check) => check.ready)).toBe(true);
  });
});
