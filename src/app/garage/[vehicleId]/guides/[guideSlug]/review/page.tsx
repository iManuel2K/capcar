import type { Metadata } from "next";

import { GuideReviewWorkspace } from "@/components/guides/guide-review-workspace";

export const metadata: Metadata = { title: "Guide review" };

export default async function GuideReviewPage({ params }: { params: Promise<{ vehicleId: string; guideSlug: string }> }) {
  const { vehicleId, guideSlug } = await params;
  return <GuideReviewWorkspace vehicleId={vehicleId} guideSlug={guideSlug} />;
}
