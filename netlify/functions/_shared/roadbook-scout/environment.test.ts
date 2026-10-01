import { afterEach, describe, expect, it } from "vitest";

import { getScoutEnvironment } from "./environment";

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe("Roadbook Scout environment", () => {
  it("reads trimmed production function variables from process.env", () => {
    process.env.SUPABASE_URL = " https://project.supabase.co ";
    process.env.SUPABASE_SECRET_KEY = " sb_secret_test ";
    process.env.UNSPLASH_ACCESS_KEY = " unsplash-test ";

    expect(getScoutEnvironment()).toEqual({
      supabaseUrl: "https://project.supabase.co",
      supabaseSecretKey: "sb_secret_test",
      unsplashAccessKey: "unsplash-test",
      manualRunSecret: undefined,
    });
  });
});
