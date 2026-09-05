import { describe, expect, it } from "vitest";

import { installationGuides } from "@/features/guides/guide-catalog";
import { evaluateGuideGovernance } from "@/features/guides/guide-governance";

describe("guide governance", () => {
  it("does not allow demo guides to claim verification", () => {
    const governance = evaluateGuideGovernance(installationGuides[0]);
    expect(governance.status).toBe("draft");
    expect(governance.canVerify).toBe(false);
    expect(governance.blockers.length).toBeGreaterThan(0);
  });

  it("allows verification only with dated sources and applicability", () => {
    const guide = {
      ...installationGuides[0],
      reviewStatus: "verified" as const,
      sources: [
        {
          label: "Licensed procedure",
          kind: "authoritative" as const,
          url: "https://provider.example/procedure/1",
          verifiedAt: "2026-09-05",
        },
      ],
    };
    const governance = evaluateGuideGovernance(guide);
    expect(governance.canVerify).toBe(true);
    expect(governance.status).toBe("verified");
  });
});
