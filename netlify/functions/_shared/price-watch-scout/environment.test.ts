import { afterEach, describe, expect, it } from "vitest";

import { getPriceWatchEnvironment } from "./environment";

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe("price-watch environment", () => {
  it("reads trimmed production function variables from process.env", () => {
    process.env.SUPABASE_URL = " https://project.supabase.co ";
    process.env.SUPABASE_SECRET_KEY = " sb_secret_test ";
    process.env.PRICE_WATCH_JOB_SECRET = " job-secret ";

    expect(getPriceWatchEnvironment()).toMatchObject({
      supabaseUrl: "https://project.supabase.co",
      supabaseSecretKey: "sb_secret_test",
      jobSecret: "job-secret",
    });
  });
});
