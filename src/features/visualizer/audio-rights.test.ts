import { expect, it } from "vitest";
import { exhaustRecordingSchema } from "./exhaust-audio";
it("requires explicit distribution permission before cataloguing a public recording", () => {
  const item = {
    id: "test",
    label: "Test",
    platform: "E90",
    engineCode: "N43",
    model: "318i",
    productionYear: 2011,
    configuration: "stock",
    scenario: "idle",
    exhaustSystem: "Stock",
    otherModifications: "None",
    source: "https://example.com/recording",
    rights: "Owner permission",
    recordingNotes: "Test fixture",
    audioPath: "/audio/test.mp3",
  };
  expect(exhaustRecordingSchema.safeParse(item).success).toBe(false);
  const permission = {
    rightsHolder: "Test owner",
    reference: "Written permission reference",
    reviewedAt: "2026-01-01T00:00:00.000Z",
    publicDistribution: false,
  };
  expect(
    exhaustRecordingSchema.safeParse({ ...item, permission }).success,
  ).toBe(false);
  expect(
    exhaustRecordingSchema.safeParse({
      ...item,
      permission: { ...permission, publicDistribution: true },
    }).success,
  ).toBe(true);
});
