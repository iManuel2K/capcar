import { describe, expect, it } from "vitest";

import { parseSupabaseEnv } from "@/lib/env";

describe("parseSupabaseEnv", () => {
  it("accepts a valid Supabase configuration", () => {
    expect(
      parseSupabaseEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      }),
    ).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    });
  });

  it("rejects an incomplete configuration", () => {
    expect(() => parseSupabaseEnv({})).toThrow("Supabase is not configured");
  });
});
