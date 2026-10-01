export type PriceWatchRunSummary = {
  status: "completed" | "partial";
  checked: number;
  updated: number;
  errors: number;
};

export function successfulRunLog(
  summary: PriceWatchRunSummary,
  startedAt: number,
  finishedAt = Date.now(),
) {
  return {
    event: "price_watch_run_completed",
    worker: "price-watch-refresh-background",
    workerVersion: 1,
    status: summary.status,
    watchesChecked: summary.checked,
    resultsUpdated: summary.updated,
    errorCount: summary.errors,
    durationMs: Math.max(0, finishedAt - startedAt),
  } as const;
}

export function failedRunLog(
  error: unknown,
  startedAt: number,
  finishedAt = Date.now(),
) {
  return {
    event: "price_watch_run_failed",
    worker: "price-watch-refresh-background",
    workerVersion: 1,
    status: "failed",
    errorName: error instanceof Error ? error.name.slice(0, 80) : "Error",
    errorMessage:
      error instanceof Error
        ? error.message.slice(0, 200)
        : "Unknown worker failure",
    durationMs: Math.max(0, finishedAt - startedAt),
  } as const;
}
