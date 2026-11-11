// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest";
import { drivingReviewRequestSchema, drivingReviewSchema } from "./contracts";
import { parseContextDraft } from "./review-context";
import { drivingSampleTimes } from "./frames";
import {
  emptyDrivingProfile,
  saveDrivingProfile,
  readDrivingProfiles,
  saveDrivingResult,
  DRIVING_REVIEW_KEY,
} from "./storage";
import {
  collectLocalSnapshot,
  clearLocalSnapshot,
  applyLocalSnapshot,
} from "@/features/sync/local-snapshot";
import {
  isBoundedJpeg,
  reviewDrivingFrames,
  reviewPrompt,
} from "./review-service";
import type { AiConnectionRecord } from "@/features/connections/ai-connection";
vi.mock("@/features/connections/ai-connection", () => ({
  tripPlannerEnvironmentForConnection: () => ({
    OPENAI_API_KEY: "fake-openai",
    ANTHROPIC_API_KEY: "fake-claude",
    GEMINI_API_KEY: "fake-gemini",
  }),
}));
const jpeg = (width = 640, height = 360) => {
  const bytes = Buffer.from([
    255, 216, 255, 192, 0, 17, 8, 0, 0, 0, 0, 3, 1, 17, 0, 2, 17, 0, 3, 17, 0,
    255, 217,
  ]);
  bytes.writeUInt16BE(height, 7);
  bytes.writeUInt16BE(width, 9);
  return `data:image/jpeg;base64,${bytes.toString("base64")}`;
};
const input = {
  consent: true as const,
  locale: "en" as const,
  duration: 10,
  focus: "awareness" as const,
  preferences: [],
  frames: [
    { time: 1, image: jpeg() },
    { time: 6, image: jpeg() },
  ],
};
const review = {
  summary: "Sparse frames show a road ahead.",
  limitations: ["No continuous motion or audio."],
  tips: [
    {
      frame: 1,
      observation: "A junction is visible.",
      suggestion: "Reflect on how early you noticed the junction.",
      confidence: "low" as const,
      focus: "awareness" as const,
    },
  ],
};
const saved = {
  id: "11111111-1111-4111-8111-111111111111",
  createdAt: "2026-11-08T12:00:00.000Z",
  provider: "gemini" as const,
  frameTimes: [1, 6],
  review,
};
const currentReview = {
  ...review,
  tips: [
    {
      ...review.tips[0],
      kind: "improvement",
      explanation: "A junction can limit the view of crossing traffic.",
      relatedFrame: 2,
    },
  ],
};
const supportingDetails = {
  roadConditions: "Road reported as wet",
  moments: [{ time: 1.5, speed: { value: 30, unit: "km/h" as const } }],
};
function memoryStore() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
}
afterEach(() => vi.unstubAllGlobals());
describe("bounded, consented requests", () => {
  it("requires explicit consent and rejects extra personal fields", () => {
    expect(
      drivingReviewRequestSchema.safeParse({ ...input, consent: false })
        .success,
    ).toBe(false);
    expect(
      drivingReviewRequestSchema.safeParse({ ...input, vin: "private" })
        .success,
    ).toBe(false);
  });
  it("rejects remote images, oversized clips and image payloads", () => {
    for (const patch of [
      { duration: 61 },
      {
        frames: [
          { time: 1, image: "https://example.com/private.jpg" },
          { time: 2, image: jpeg() },
        ],
      },
      { frames: [{ time: 1, image: "x".repeat(180001) }] },
    ])
      expect(
        drivingReviewRequestSchema.safeParse({ ...input, ...patch }).success,
      ).toBe(false);
  });
  it("requires chronological frames inside duration and at most twelve", () => {
    for (const frames of [
      [input.frames[1], input.frames[0]],
      [input.frames[0], { ...input.frames[1], time: 11 }],
      Array.from({ length: 13 }, (_, i) => ({ time: i / 2, image: jpeg() })),
    ])
      expect(
        drivingReviewRequestSchema.safeParse({ ...input, frames }).success,
      ).toBe(false);
  });
  it("accepts only bounded supporting details and clip-relative timestamps", () => {
    expect(
      drivingReviewRequestSchema.parse({ ...input, context: supportingDetails })
        .context,
    ).toEqual(supportingDetails);
    for (const moment of [
      { time: 11 },
      { time: 0, speed: { value: -10, unit: "km/h" } },
      { time: 0, speed: { value: 30, unit: "knots" } },
      { time: 0, note: "x".repeat(201) },
      { time: 0, verified: true },
    ]) {
      expect(
        drivingReviewRequestSchema.safeParse({
          ...input,
          context: { moments: [moment] },
        }).success,
      ).toBe(false);
    }
  });
  it("supports decimal commas, timestamp-only markers and zero speed", () => {
    const moment = {
      id: "first",
      time: "1,5",
      speed: "0",
      unit: "mph" as const,
      note: "",
    };
    const draft = {
      roadConditions: "",
      moments: [moment, { ...moment, id: "second", time: "0", speed: "" }],
    };
    expect(parseContextDraft(draft, 4).context?.moments).toEqual([
      { time: 0 },
      { time: 1.5, speed: { value: 0, unit: "mph" } },
    ]);
    expect(parseContextDraft(draft, 1).issue).toEqual({
      index: 0,
      field: "time",
    });
  });
  it("bounds JPEG dimensions and rejects fake and truncated images", () => {
    expect(isBoundedJpeg(jpeg())).toBe(true);
    expect(isBoundedJpeg(jpeg(4000))).toBe(false);
    expect(isBoundedJpeg("data:image/jpeg;base64,YWJjZA==")).toBe(false);
    expect(isBoundedJpeg(jpeg().slice(0, 25))).toBe(false);
  });
  it("allows insufficient evidence, not invented tips or numeric scores", () => {
    expect(drivingReviewSchema.parse({ ...review, tips: [] }).tips).toEqual([]);
    expect(
      drivingReviewSchema.safeParse({
        ...review,
        tips: [{ ...review.tips[0], confidence: "high" }],
      }).success,
    ).toBe(false);
  });
  it("instructs providers to distinguish frames from continuous footage", () => {
    expect(reviewPrompt(input)).toContain("NOT continuous video");
    expect(reviewPrompt(input)).toContain("Never identify people");
    expect(reviewPrompt(input)).toContain("not inferred traits");
  });
});
describe("garage persistence", () => {
  it("isolates cars, disables learning initially and never stores footage", () => {
    const store = memoryStore();
    const profile = emptyDrivingProfile("car-a");
    expect(profile.learning).toBe(false);
    saveDrivingProfile(
      saveDrivingResult(profile, {
        ...saved,
        frames: input.frames,
      } as typeof saved),
      store,
    );
    saveDrivingProfile(emptyDrivingProfile("car-b"), store);
    expect(
      readDrivingProfiles(store).find((p) => p.vehicleId === "car-b")?.reviews,
    ).toHaveLength(0);
    expect(store.getItem(DRIVING_REVIEW_KEY)).not.toContain("data:image");
  });
  it("repeated save is idempotent and keeps only twenty reviews", () => {
    let profile = emptyDrivingProfile("a");
    for (let i = 0; i < 25; i++)
      profile = saveDrivingResult(profile, {
        ...saved,
        id: `11111111-1111-4111-8111-${String(i).padStart(12, "0")}`,
      });
    expect(profile.reviews).toHaveLength(20);
    profile = saveDrivingResult(profile, profile.reviews[0]);
    expect(profile.reviews).toHaveLength(20);
  });
  it("participates in account snapshot sync and sign-out cleanup", () => {
    const store = memoryStore();
    const withDetails = { ...saved, context: supportingDetails, duration: 10 };
    saveDrivingProfile(
      saveDrivingResult(emptyDrivingProfile("a"), withDetails),
      store,
    );
    const snapshot = collectLocalSnapshot(store);
    expect(snapshot.data[DRIVING_REVIEW_KEY]).toBeTruthy();
    clearLocalSnapshot(store);
    expect(readDrivingProfiles(store)).toEqual([]);
    applyLocalSnapshot(snapshot, store);
    expect(readDrivingProfiles(store)[0].reviews).toEqual([withDetails]);
  });
  it("can reset learning without deleting saved reflections", () => {
    const store = memoryStore();
    const profile = {
      ...saveDrivingResult(emptyDrivingProfile("a"), saved),
      learning: true,
      preferences: ["space" as const],
    };
    saveDrivingProfile({ ...profile, learning: false, preferences: [] }, store);
    expect(readDrivingProfiles(store)[0]).toMatchObject({
      learning: false,
      preferences: [],
      reviews: [saved],
    });
  });
  it("recovers from corrupt local data", () => {
    expect(readDrivingProfiles({ getItem: () => "invalid" })).toEqual([]);
  });
});
describe("personal provider adapters", () => {
  it.each(["gemini", "openai", "anthropic"] as const)(
    "submits selected images and separately labeled context to %s",
    async (provider) => {
      const fetcher = vi.fn().mockResolvedValue(
        Response.json(
          provider === "gemini"
            ? {
                candidates: [
                  {
                    content: {
                      parts: [{ text: JSON.stringify(currentReview) }],
                    },
                  },
                ],
              }
            : provider === "openai"
              ? {
                  output: [
                    {
                      content: [
                        {
                          type: "output_text",
                          text: JSON.stringify(currentReview),
                        },
                      ],
                    },
                  ],
                }
              : {
                  content: [
                    { type: "text", text: JSON.stringify(currentReview) },
                  ],
                },
        ),
      );
      vi.stubGlobal("fetch", fetcher);
      const result = await reviewDrivingFrames(
        { ...input, context: supportingDetails },
        {
          provider,
          model: "configured-model",
        } as AiConnectionRecord,
      );
      expect(result).toEqual(currentReview);
      const [url, request] = fetcher.mock.calls[0];
      expect(url).toMatch(
        /^https:\/\/(api.openai.com|api.anthropic.com|generativelanguage.googleapis.com)\//,
      );
      const body = JSON.parse(request.body);
      expect(request.body).toContain("Frame 2");
      expect(request.body).not.toContain("vehicleId");
      const system = body.instructions ?? body.system ?? body.systemInstruction;
      const user = body.input ?? body.messages ?? body.contents;
      expect(JSON.stringify(system)).not.toContain("Road reported as wet");
      expect(JSON.stringify(user)).toContain(
        "Unverified user-supplied context",
      );
      expect(JSON.stringify(user)).toContain("Road reported as wet");
      if (provider === "openai") expect(body.store).toBe(false);
    },
  );
  it.each([{ frame: 12 }, { relatedFrame: 12 }, { relatedFrame: 1 }])(
    "rejects invalid frame citations %j",
    async (citation) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          Response.json({
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  ...currentReview,
                  tips: [{ ...currentReview.tips[0], ...citation }],
                }),
              },
            ],
          }),
        ),
      );
      await expect(
        reviewDrivingFrames(input, {
          provider: "anthropic",
          model: "test",
        } as AiConnectionRecord),
      ).rejects.toMatchObject({ code: "invalid_result" });
    },
  );
  it("does not return upstream errors or credentials", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("private key or scene text", { status: 429 }),
        ),
    );
    await expect(
      reviewDrivingFrames(input, {
        provider: "gemini",
        model: "test",
      } as AiConnectionRecord),
    ).rejects.toMatchObject({ code: "quota", message: "quota" });
  });
});

describe("marked review moments", () => {
  it.each([0, 19, 21.4])(
    "samples around the mark at %s within the existing budget",
    (time) => {
      const frames = drivingSampleTimes(21.4, time);
      expect(frames.length).toBeLessThanOrEqual(12);
      expect(frames).toEqual([...new Set(frames)].sort((a, b) => a - b));
      expect(frames.every((frame) => frame >= 0 && frame < 21.4)).toBe(true);
      expect(frames.some((frame) => Math.abs(time - frame) < 0.05)).toBe(true);
      if (time === 19)
        expect(frames).toEqual(
          expect.arrayContaining([17.5, 18.6, 19, 19.4, 20.5]),
        );
    },
  );

  it("rejects an out-of-clip marker", () => {
    expect(
      drivingReviewRequestSchema.safeParse({
        ...input,
        context: { moments: [], focusTime: 11 },
      }).success,
    ).toBe(false);
  });

  it.each([1, 2])(
    "accepts only marker citations near the requested time (frame %s)",
    async (frame) => {
      const markedMoment = {
        observation: "The closest frame shows a car.",
        frame,
      };
      const provider = vi.fn().mockResolvedValue(
        Response.json({
          content: [
            {
              type: "text",
              text: JSON.stringify({ ...currentReview, markedMoment }),
            },
          ],
        }),
      );
      vi.stubGlobal("fetch", provider);
      const result = await reviewDrivingFrames(
        { ...input, context: { moments: [], focusTime: 6 } },
        { provider: "anthropic", model: "test" } as AiConnectionRecord,
      );
      expect(result.markedMoment).toEqual(
        frame === 2 ? markedMoment : undefined,
      );
      expect(JSON.parse(provider.mock.calls[0][1].body).system).toContain(
        "marked 6.00 seconds",
      );
    },
  );
});
