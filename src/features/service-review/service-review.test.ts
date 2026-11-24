import { describe, expect, it } from "vitest";

import { buildServiceReview } from "./service-review";
import type {
  ServiceEvidence,
  ServiceReviewRequest,
} from "./service-review-schema";

const today = "2026-11-24";
const oil = {
  key: "engine-oil-filter",
  title: "Engine oil & oil filter",
  intervalMonths: 12,
  intervalMileage: 15_000,
};
const input: ServiceReviewRequest = {
  consent: true,
  vehicle: { make: "BMW", model: "318i", year: 2011, mileage: 140_000 },
  photos: [{ data: "photo-one" }, { data: "photo-two" }],
  tasks: [
    oil,
    { key: "brake-fluid", title: "Brake fluid", intervalMonths: 24 },
  ],
};

function completed(overrides: Partial<ServiceEvidence> = {}): ServiceEvidence {
  return {
    photoIndex: 0,
    taskKey: oil.key,
    work: "Engine oil and oil filter replaced",
    excerpt: "Engine oil & filter replaced",
    date: "2026-07-24",
    mileage: 132_000,
    ...overrides,
  };
}

describe("buildServiceReview", () => {
  it("leaves tasks without evidence unconfirmed, never due", () => {
    const result = buildServiceReview(input, [], today);
    expect(result.items.map((item) => item.status)).toEqual([
      "unconfirmed",
      "unconfirmed",
    ]);
    expect(result.warnings).toContain("unreadable-photos");
  });

  it("uses the latest comparable dated completion and retains its source", () => {
    const result = buildServiceReview(
      {
        ...input,
        tasks: [{ ...oil, record: { date: "2026-03-01", mileage: 128_000 } }],
      },
      [
        completed(),
        completed({ photoIndex: 1, date: "2025-01-20", mileage: 110_000 }),
      ],
      today,
    );
    expect(result.items[0]).toMatchObject({
      status: "documented",
      source: "photo",
      photoIndex: 0,
      date: "2026-07-24",
      nextDueDate: "2027-07-24",
      nextDueMileage: 147_000,
    });
    expect(result.warnings).not.toContain("unreadable-photos");
  });

  it("keeps a more recent saved record rather than replacing it with older photos", () => {
    const result = buildServiceReview(
      {
        ...input,
        tasks: [{ ...oil, record: { date: "2026-10-01", mileage: 138_000 } }],
      },
      [completed()],
      today,
    );
    expect(result.items[0]).toMatchObject({
      status: "documented",
      source: "garage",
      photoIndex: null,
      date: "2026-10-01",
    });
  });

  it("marks a known service due when its planning mileage is reached", () => {
    const result = buildServiceReview(
      input,
      [completed({ mileage: 125_000 })],
      today,
    );
    expect(result.items[0]).toMatchObject({
      status: "due",
      nextDueMileage: 140_000,
    });
  });

  it("marks a known service due on its planning date without a mileage reading", () => {
    const result = buildServiceReview(
      input,
      [completed({ date: "2025-11-24", mileage: null })],
      today,
    );
    expect(result.items[0]).toMatchObject({
      status: "due",
      nextDueDate: today,
      nextDueMileage: null,
    });
  });

  it("does not infer an elapsed time interval when a photo has no service date", () => {
    const result = buildServiceReview(
      input,
      [completed({ date: null, mileage: null })],
      today,
    );
    expect(result.items[0]).toMatchObject({
      status: "unconfirmed",
      nextDueDate: null,
      nextDueMileage: null,
    });
    expect(result.warnings).toContain("uncertain-service-dates");
    expect(result.evidence).toHaveLength(1);
  });

  it("does not claim a mileage-only entry is due when the current mileage is unknown", () => {
    const result = buildServiceReview(
      { ...input, vehicle: { make: "BMW", model: "318i", year: 2011 } },
      [completed({ date: null })],
      today,
    );
    expect(result.items[0]).toMatchObject({
      status: "unconfirmed",
      nextDueDate: null,
      nextDueMileage: 147_000,
    });
  });

  it("does not apply an older date interval when an undated entry could be newer", () => {
    const result = buildServiceReview(
      input,
      [
        completed({ date: "2025-01-05", mileage: 110_000 }),
        completed({ photoIndex: 1, date: null, mileage: null }),
      ],
      today,
    );
    expect(result.items[0]).toMatchObject({
      status: "unconfirmed",
      nextDueDate: null,
    });
  });

  it("flags inconsistent public-history mileage without treating public history as service evidence", () => {
    const result = buildServiceReview(
      { ...input, history: { mileage: 155_000, date: "2026-01-05" } },
      [],
      today,
    );
    expect(result.items.every((item) => item.status === "unconfirmed")).toBe(
      true,
    );
    expect(result.warnings).toContain("history-mileage-conflict");
  });

  it("checks dated third-party readings against the service timeline, not just today’s mileage", () => {
    const result = buildServiceReview(
      { ...input, history: { mileage: 135_000, date: "2026-01-05" } },
      [completed()],
      today,
    );
    expect(result.warnings).toContain("history-mileage-conflict");
    expect(result.warnings).not.toContain("service-mileage-conflict");
  });

  it("pauses mileage-based due status when a history report disagrees with the vehicle mileage", () => {
    const result = buildServiceReview(
      { ...input, history: { mileage: 150_000, date: "2026-08-01" } },
      [completed({ mileage: 120_000 })],
      today,
    );
    expect(result.items[0]).toMatchObject({
      status: "documented",
      nextDueDate: "2027-07-24",
      nextDueMileage: null,
    });
  });

  it("needs a date for a time-only maintenance interval", () => {
    const result = buildServiceReview(
      input,
      [completed({ taskKey: "brake-fluid", date: null })],
      today,
    );
    expect(result.items[1]).toMatchObject({
      status: "unconfirmed",
      nextDueDate: null,
      nextDueMileage: null,
    });
  });

  it("flags conflicting dated service mileage and avoids a mileage-based due status", () => {
    const result = buildServiceReview(
      input,
      [
        completed({ date: "2026-04-24", mileage: 135_000 }),
        completed({ photoIndex: 1, date: "2026-07-24", mileage: 120_000 }),
      ],
      today,
    );
    expect(result.warnings).toContain("service-mileage-conflict");
    expect(result.items[0]).toMatchObject({
      status: "documented",
      nextDueMileage: null,
    });
  });

  it("does not use future or impossible completion dates for planning", () => {
    const result = buildServiceReview(
      input,
      [
        completed({ date: "2027-01-24", mileage: 108_000 }),
        completed({ photoIndex: 1, date: "2026-02-30", mileage: 120_000 }),
      ],
      today,
    );
    expect(result.items[0]).toMatchObject({
      status: "unconfirmed",
      nextDueDate: null,
      nextDueMileage: null,
    });
    expect(result.warnings).toContain("uncertain-service-dates");
  });

  it("does not associate unknown task keys or accept evidence for an unsubmitted photo", () => {
    const result = buildServiceReview(
      input,
      [
        completed({ taskKey: "unlisted-service" }),
        completed({ photoIndex: 9 }),
      ],
      today,
    );
    expect(result.evidence).toEqual([completed({ taskKey: null })]);
    expect(result.items[0].status).toBe("unconfirmed");
  });
});
