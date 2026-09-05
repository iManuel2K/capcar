import { describe, expect, it } from "vitest";

import { getAuthStatus } from "@/features/auth/auth-config";

describe("auth mode", () => {
  it("stays local when Supabase variables are incomplete", () => {
    expect(getAuthStatus({}).mode).toBe("local");
    expect(
      getAuthStatus({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" })
        .configured,
    ).toBe(false);
  });

  it("activates only when both public Supabase variables exist", () => {
    expect(
      getAuthStatus({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable",
      }).mode,
    ).toBe("supabase");
  });
});
