"use client";
import { useLocale } from "next-intl";
import { resolveJournalLocale } from "@/features/journal/routes";
import { interactionCopy } from "@/features/ui/interaction-copy";
import { MotionLoader } from "./motion-loader";
export function LoadingIndicator() {
  const c = interactionCopy[resolveJournalLocale(useLocale())];
  return (
    <span role="status" className="inline-flex items-center gap-3 text-sm">
      <MotionLoader />
      {c.loading}
    </span>
  );
}
