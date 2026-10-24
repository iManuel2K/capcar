"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { HomepageCopy } from "@/features/marketing/homepage-copy";

export function BuildProgressPreview({ copy }: { copy: HomepageCopy }) {
  const [complete, setComplete] = useState([true, false, false]);
  const done = complete.filter(Boolean).length;
  const progress = copy.buildProgress.replace("{done}", String(done));
  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span aria-live="polite">{progress}</span>
        <strong className="text-primary tabular-nums">
          {Math.round((done / 3) * 100)}%
        </strong>
      </div>
      <progress
        value={done}
        max={3}
        aria-label={copy.build}
        className="build-preview-progress mt-3 h-2 w-full overflow-hidden rounded-full"
      />
      <ol className="mt-4 space-y-2">
        {[copy.buildTaskOne, copy.buildTaskTwo, copy.buildTaskThree].map(
          (task, index) => (
            <li key={task}>
              <label
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors ${complete[index] ? "border-primary/35 bg-primary/10" : "border-border bg-card"}`}
              >
                <input
                  type="checkbox"
                  checked={complete[index]}
                  onChange={() =>
                    setComplete((previous) =>
                      previous.map((value, i) =>
                        i === index ? !value : value,
                      ),
                    )
                  }
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="text-primary border-primary/40 grid size-8 shrink-0 place-items-center rounded-full border font-mono peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4"
                >
                  {complete[index] ? (
                    <Check size={17} />
                  ) : (
                    String(index + 1).padStart(2, "0")
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-muted-foreground mr-2 font-mono text-xs">
                    0{index + 1}
                  </span>
                  {task}
                </span>
              </label>
            </li>
          ),
        )}
      </ol>
    </div>
  );
}
