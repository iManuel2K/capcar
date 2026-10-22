import { describe, expect, it } from "vitest";
import { copilotResponseSchema } from "@/features/copilot/copilot-schema";

const response = {
  provider: "test",
  source: "external",
  answer: "Test",
  evidence: [],
  warnings: [],
};

describe("copilot navigation", () => {
  it.each([
    "//attacker.test",
    "/\\attacker.test",
    "/\n/attacker.test",
    "javascript:alert(1)",
    "https://attacker.test",
  ])("rejects provider-controlled external action %s", (href) => {
    expect(
      copilotResponseSchema.safeParse({
        ...response,
        nextActions: [{ label: "Continue", href }],
      }).success,
    ).toBe(false);
  });
  it("keeps valid garage actions", () => {
    expect(
      copilotResponseSchema.safeParse({
        ...response,
        nextActions: [
          { label: "Build", href: "/garage/car-a/builds?view=all" },
        ],
      }).success,
    ).toBe(true);
  });
});
