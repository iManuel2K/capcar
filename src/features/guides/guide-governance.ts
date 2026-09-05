import type {
  GuideReviewStatus,
  InstallationGuide,
} from "@/features/guides/guide-catalog";
import type { GuideReviewRecord } from "@/features/guides/guide-review-schema";

export type GuideGovernance = {
  status: GuideReviewStatus;
  label: string;
  canVerify: boolean;
  authoritativeSources: number;
  blockers: string[];
  trustedApprovals: number;
};

export function evaluateGuideGovernance(
  guide: InstallationGuide,
  reviews: GuideReviewRecord[] = [],
): GuideGovernance {
  const authoritativeSources = guide.sources.filter(
    (source) =>
      (source.kind === "authoritative" || source.kind === "manufacturer") &&
      Boolean(source.url && source.verifiedAt),
  ).length;
  const requiredSources = guide.sources.filter(
    (source) => source.kind === "required",
  );
  const blockers: string[] = [];
  if (requiredSources.length > 0)
    blockers.push(`${requiredSources.length} required sources are missing.`);
  if (authoritativeSources === 0)
    blockers.push("No dated authoritative source is attached.");
  if (guide.applicability.length === 0)
    blockers.push("Vehicle applicability is not defined.");

  const currentApprovals = reviews.filter(
    (review) =>
      review.guideSlug === guide.slug &&
      review.guideRevision === guide.revision &&
      review.outcome === "approved" &&
      review.sourceChecked &&
      review.applicabilityChecked &&
      review.safetyChecked &&
      review.evidenceState === "authenticated",
  );
  const trustedApprovals = currentApprovals.length;
  if (!currentApprovals.some((review) => review.reviewerRole === "mechanic"))
    blockers.push("An authenticated mechanic approval for this revision is missing.");
  if (!currentApprovals.some((review) => review.reviewerRole === "publisher"))
    blockers.push("An authenticated publisher approval for this revision is missing.");

  const canVerify = blockers.length === 0;
  const effectiveStatus =
    guide.reviewStatus === "verified" && !canVerify
      ? "reviewed"
      : guide.reviewStatus;
  return {
    status: effectiveStatus,
    label:
      effectiveStatus === "verified"
        ? "Verified procedure"
        : effectiveStatus === "reviewed"
          ? "Reviewed · verification pending"
          : "Draft demo · review pending",
    canVerify,
    authoritativeSources,
    trustedApprovals,
    blockers,
  };
}
