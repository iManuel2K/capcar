import { addMonthsToDate } from "@/features/maintenance/maintenance-status";

import {
  SERVICE_REVIEW_MAX_MILEAGE,
  type ServiceEvidence,
  type ServiceReviewRequest,
  type ServiceReviewResult,
} from "./service-review-schema";

type Completion = {
  date: string | null;
  mileage: number | null;
  source: "photo" | "garage";
  photoIndex: number | null;
};

function validDate(value: string | null | undefined, today: string) {
  if (
    !value ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value < "1886-01-01" ||
    value > today
  )
    return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
    ? value
    : null;
}

function validMileage(value: number | null | undefined) {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= SERVICE_REVIEW_MAX_MILEAGE
    ? value
    : null;
}

function reversedMileage(
  a: Pick<Completion, "date" | "mileage">,
  b: Pick<Completion, "date" | "mileage">,
) {
  if (
    a.date === null ||
    b.date === null ||
    a.mileage === null ||
    b.mileage === null
  )
    return false;
  return (
    (a.date < b.date && a.mileage > b.mileage) ||
    (b.date < a.date && b.mileage > a.mileage)
  );
}

function latestCompletion(entries: Completion[], mileageTrustworthy: boolean) {
  const dated = entries
    .filter((entry) => entry.date !== null)
    .sort((a, b) => {
      const byDate = (b.date ?? "").localeCompare(a.date ?? "");
      if (byDate) return byDate;
      return (
        (b.mileage ?? -1) - (a.mileage ?? -1) ||
        Number(b.source === "garage") - Number(a.source === "garage")
      );
    })[0];
  const undated = entries
    .filter((entry) => entry.date === null && entry.mileage !== null)
    .sort((a, b) => (b.mileage ?? -1) - (a.mileage ?? -1))[0];

  // Mileage can put an undated entry after a dated one, but only if both
  // observations have comparable readings and the timeline is consistent.
  if (
    dated &&
    undated &&
    mileageTrustworthy &&
    dated.mileage !== null &&
    undated.mileage !== null &&
    undated.mileage > dated.mileage
  )
    return undated;
  return dated ?? undated ?? null;
}

/** Reconcile documented work with CapCar planning intervals, never infer that a missing record is a missed service. */
export function buildServiceReview(
  input: ServiceReviewRequest,
  evidence: ServiceEvidence[],
  today = new Date().toISOString().slice(0, 10),
): ServiceReviewResult {
  const warnings = new Set<ServiceReviewResult["warnings"][number]>();
  const currentMileage = validMileage(input.vehicle.mileage);
  const tasks = new Map(input.tasks.map((task) => [task.key, task]));
  const byTask = new Map<string, Completion[]>();
  const observations: Completion[] = [];
  const seenPhotos = new Set<number>();

  const addCompletion = (completion: Completion, key: string | null) => {
    observations.push(completion);
    if (key !== null) {
      const existing = byTask.get(key) ?? [];
      existing.push(completion);
      byTask.set(key, existing);
    }
  };

  const reviewedEvidence: ServiceEvidence[] = [];
  for (const entry of evidence) {
    if (
      !Number.isInteger(entry.photoIndex) ||
      entry.photoIndex < 0 ||
      entry.photoIndex >= input.photos.length
    )
      continue;
    seenPhotos.add(entry.photoIndex);
    const taskKey =
      entry.taskKey !== null && tasks.has(entry.taskKey) ? entry.taskKey : null;
    const date = validDate(entry.date, today);
    if (date === null) warnings.add("uncertain-service-dates");
    // An impossible or future date calls the entire observation into question.
    const mileage =
      entry.date === null || date !== null ? validMileage(entry.mileage) : null;
    reviewedEvidence.push({ ...entry, taskKey, date, mileage });
    addCompletion(
      { date, mileage, source: "photo", photoIndex: entry.photoIndex },
      taskKey,
    );
  }

  if (seenPhotos.size < input.photos.length) warnings.add("unreadable-photos");

  for (const task of tasks.values()) {
    if (!task.record) continue;
    const date = validDate(task.record.date, today);
    if (!date) {
      warnings.add("uncertain-service-dates");
      continue;
    }
    addCompletion(
      {
        date,
        mileage: validMileage(task.record.mileage),
        source: "garage",
        photoIndex: null,
      },
      task.key,
    );
  }

  const serviceConflict = observations.some(
    (entry, i) =>
      (currentMileage !== null &&
        entry.mileage !== null &&
        entry.mileage > currentMileage) ||
      observations.slice(i + 1).some((other) => reversedMileage(entry, other)),
  );
  if (serviceConflict) warnings.add("service-mileage-conflict");

  const report = input.history
    ? {
        date: validDate(input.history.date, today),
        mileage: validMileage(input.history.mileage),
      }
    : null;
  const historyConflict =
    report !== null &&
    report.date !== null &&
    report.mileage !== null &&
    ((currentMileage !== null && report.mileage > currentMileage) ||
      observations.some((entry) => reversedMileage(entry, report)));
  if (historyConflict) warnings.add("history-mileage-conflict");

  const mileageTrustworthy = !serviceConflict && !historyConflict;

  const items: ServiceReviewResult["items"] = Array.from(
    tasks.values(),
    (task) => {
      const entries = byTask.get(task.key) ?? [];
      const completion = latestCompletion(entries, mileageTrustworthy);
      const date = completion?.date ?? null;
      const mileage = completion?.mileage ?? null;
      // An undated entry without an ordering comparator could be the latest work.
      // Don’t present a due status derived solely from a potentially older entry.
      const ambiguousLatest =
        completion !== null &&
        date !== null &&
        entries.some(
          (entry) =>
            entry.date === null &&
            (entry.mileage === null || mileage === null || !mileageTrustworthy),
        );
      const nextDueDate =
        date !== null && task.intervalMonths && !ambiguousLatest
          ? addMonthsToDate(date, task.intervalMonths)
          : null;
      const nextDueMileage =
        mileage !== null &&
        task.intervalMileage &&
        mileageTrustworthy &&
        !ambiguousLatest
          ? mileage + task.intervalMileage
          : null;
      const documented =
        completion !== null &&
        !ambiguousLatest &&
        (date !== null || (nextDueMileage !== null && currentMileage !== null));
      const due =
        (nextDueDate !== null && nextDueDate <= today) ||
        (currentMileage !== null &&
          nextDueMileage !== null &&
          nextDueMileage <= currentMileage);

      return {
        taskKey: task.key,
        title: task.title,
        status: documented ? (due ? "due" : "documented") : "unconfirmed",
        date,
        mileage,
        nextDueDate,
        nextDueMileage,
        source: completion?.source ?? null,
        photoIndex: completion?.photoIndex ?? null,
      };
    },
  );

  return { evidence: reviewedEvidence, items, warnings: [...warnings] };
}
