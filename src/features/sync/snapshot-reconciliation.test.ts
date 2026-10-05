import { describe, expect, it } from "vitest";

import type { LocalSnapshot } from "@/features/sync/local-snapshot";
import { decideInitialSnapshot } from "@/features/sync/snapshot-reconciliation";

function snapshot(
  data: LocalSnapshot["data"],
  capturedAt = "2026-09-08T12:00:00.000Z",
): LocalSnapshot {
  return { version: 1, capturedAt, data };
}

describe("snapshot reconciliation", () => {
  it("restores the cloud on an empty device", () => {
    expect(
      decideInitialSnapshot({
        currentUserId: "user-1",
        previousUserId: null,
        local: snapshot({}),
        remote: snapshot({ vehicles: "[]" }),
      }),
    ).toBe("use-remote");
  });

  it("keeps anonymous work when no cloud snapshot exists", () => {
    expect(
      decideInitialSnapshot({
        currentUserId: "user-1",
        previousUserId: null,
        local: snapshot({ vehicles: "[1]" }),
      }),
    ).toBe("use-local");
  });

  it("uses the cloud copy when neither version has trusted timestamps", () => {
    expect(
      decideInitialSnapshot({
        currentUserId: "user-1",
        previousUserId: "user-1",
        local: snapshot({ vehicles: "[1]" }),
        remote: snapshot({ vehicles: "[2]" }),
      }),
    ).toBe("use-remote");
  });

  it("uses the newest known version", () => {
    expect(
      decideInitialSnapshot({
        currentUserId: "user-1",
        previousUserId: "user-1",
        local: snapshot({ vehicles: "[1]" }),
        remote: snapshot({ vehicles: "[2]" }),
        localChangedAt: "2026-09-08T13:00:00.000Z",
        remoteUpdatedAt: "2026-09-08T12:30:00.000Z",
      }),
    ).toBe("use-local");
  });

  it("never carries another user's device data into the current account", () => {
    expect(
      decideInitialSnapshot({
        currentUserId: "user-2",
        previousUserId: "user-1",
        local: snapshot({ vehicles: "[1]" }),
      }),
    ).toBe("empty");
  });
});
