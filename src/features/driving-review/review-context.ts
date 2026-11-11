import { maxReviewSpeed, speedUnits, type ReviewContext } from "./contracts";

export type MomentDraft = {
  id: string;
  time: string;
  speed: string;
  unit: (typeof speedUnits)[number];
  note: string;
};
export type ContextDraft = { roadConditions: string; moments: MomentDraft[] };
export type ContextIssue = { index: number; field: "time" | "speed" };
export const emptyContextDraft: ContextDraft = {
  roadConditions: "",
  moments: [],
};

function readDecimal(text: string) {
  const clean = text.trim();
  return /^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(clean)
    ? Number(clean.replace(",", "."))
    : NaN;
}

export function parseContextDraft(
  draft: ContextDraft,
  duration: number,
): { context?: ReviewContext; issue?: ContextIssue } {
  const roadConditions = draft.roadConditions.trim() || undefined;
  const moments: ReviewContext["moments"] = [];
  for (const [index, moment] of draft.moments.entries()) {
    const note = moment.note.trim() || undefined;
    const hasSpeed = moment.speed.trim() !== "";
    if (!moment.time.trim() && !hasSpeed && !note) continue;
    const time = readDecimal(moment.time);
    if (!Number.isFinite(time) || time > duration)
      return { issue: { index, field: "time" } };
    const speed = hasSpeed ? readDecimal(moment.speed) : undefined;
    if (
      speed !== undefined &&
      (!Number.isFinite(speed) || speed > maxReviewSpeed)
    )
      return { issue: { index, field: "speed" } };
    moments.push({
      time,
      speed:
        speed === undefined ? undefined : { value: speed, unit: moment.unit },
      note,
    });
  }
  if (!roadConditions && !moments.length) return {};
  return {
    context: {
      roadConditions,
      moments: moments.sort((a, b) => a.time - b.time),
    },
  };
}

export function formatClipTime(seconds: number) {
  const tenths = Math.round(seconds * 10);
  const minutes = String(Math.floor(tenths / 600)).padStart(2, "0");
  const remainder = String(Math.floor((tenths % 600) / 10)).padStart(2, "0");
  return `${minutes}:${remainder}.${tenths % 10}`;
}
