import { trackAnalytics } from "@/features/analytics/client";
import { readBuildState } from "./build-storage";
export function trackBuildProgress(buildId: string) {
  const items = readBuildState(localStorage).items.filter(
    (item) => item.buildId === buildId,
  );
  const percentage = items.length
    ? (items.filter((item) => item.status === "installed").length /
        items.length) *
      100
    : 0;
  // An aggregate bucket, never a build/vehicle identifier or task content.
  trackAnalytics("build_progress_updated", {
    progress_bucket: String(Math.floor(percentage / 25) * 25),
  });
}
