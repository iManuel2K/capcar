import { describe, expect, it } from "vitest";

import { failedRunLog, successfulRunLog } from "./monitoring";

describe("price-watch worker monitoring", () => {
  it("records bounded operational counts without customer identifiers", () => {
    const log = successfulRunLog(
      { status: "partial", checked: 4, updated: 3, errors: 1 },
      1_000,
      1_275,
    );

    expect(log).toEqual({
      event: "price_watch_run_completed",
      worker: "price-watch-refresh-background",
      workerVersion: 1,
      status: "partial",
      watchesChecked: 4,
      resultsUpdated: 3,
      errorCount: 1,
      durationMs: 275,
    });
    expect(JSON.stringify(log)).not.toMatch(/user|query|providerItemId/i);
  });

  it("truncates failure details and never serializes arbitrary objects", () => {
    const log = failedRunLog(new Error("x".repeat(250)), 1_000, 1_100);

    expect(log.errorName).toBe("Error");
    expect(log.errorMessage).toHaveLength(200);
    expect(log.durationMs).toBe(100);
  });
});
