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

  it("allows verification only with dated sources and authenticated approvals", () => {
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
    const reviews = [
      {
        id: "review-1",
        guideSlug: guide.slug,
        guideRevision: guide.revision,
        reviewerName: "Workshop Reviewer",
        reviewerRole: "mechanic" as const,
        outcome: "approved" as const,
        sourceChecked: true,
        applicabilityChecked: true,
        safetyChecked: true,
        notes: "Checked",
        evidenceState: "authenticated" as const,
        createdAt: "2026-09-05T10:00:00.000Z",
      },
      {
        id: "review-2",
        guideSlug: guide.slug,
        guideRevision: guide.revision,
        reviewerName: "Publisher Reviewer",
        reviewerRole: "publisher" as const,
        outcome: "approved" as const,
        sourceChecked: true,
        applicabilityChecked: true,
        safetyChecked: true,
        notes: "Ready",
        evidenceState: "authenticated" as const,
        createdAt: "2026-09-05T11:00:00.000Z",
      },
    ];
    const governance = evaluateGuideGovernance(guide, reviews);
    expect(governance.canVerify).toBe(true);
    expect(governance.status).toBe("verified");
  });

  it("does not count a local self-attestation as trusted approval", () => {
    const guide = installationGuides[0];
    const governance = evaluateGuideGovernance(guide, [
      {
        id: "local-review",
        guideSlug: guide.slug,
        guideRevision: guide.revision,
        reviewerName: "Local tester",
        reviewerRole: "mechanic",
        outcome: "approved",
        sourceChecked: true,
        applicabilityChecked: true,
        safetyChecked: true,
        notes: "Demo only",
        evidenceState: "local-demo",
        createdAt: "2026-09-05T10:00:00.000Z",
      },
    ]);
    expect(governance.trustedApprovals).toBe(0);
    expect(governance.canVerify).toBe(false);
  });

  it("gives every installation guide a complete, honest preparation plan", () => {
    const installGuides = installationGuides.filter(
      (guide) => guide.purpose !== "inspection",
    );
    expect(installGuides.length).toBeGreaterThan(0);

    for (const guide of installGuides) {
      expect(guide.installationPlan).toBeDefined();
      expect(guide.installationPlan!.costRange.min).toBeGreaterThanOrEqual(0);
      expect(guide.installationPlan!.costRange.max).toBeGreaterThanOrEqual(
        guide.installationPlan!.costRange.min,
      );
      expect(guide.installationPlan!.costRange.note).toMatch(/planning|vary/i);
      expect(guide.installationPlan!.prerequisites.length).toBeGreaterThan(0);
      expect(guide.installationPlan!.workAreaChecks.length).toBeGreaterThan(0);
      expect(guide.installationPlan!.technicalChecks.length).toBeGreaterThan(0);
      expect(guide.installationPlan!.legalChecks.length).toBeGreaterThan(0);
      expect(guide.installationPlan!.stopConditions.length).toBeGreaterThan(0);
      expect(guide.installationPlan!.completionRecord.length).toBeGreaterThan(
        0,
      );
      for (const step of guide.steps) {
        expect(step.whyItMatters).toBeTruthy();
        expect(step.mistakesToAvoid?.length).toBeGreaterThan(0);
        expect(step.recordAfterStep?.length).toBeGreaterThan(0);
        expect(step.estimatedMinutes).toBeGreaterThan(0);
      }
      expect(guide.reviewStatus).not.toBe("verified");
    }
  });
});
