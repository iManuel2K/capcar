import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef } from "react";
import {
  maxReviewMoments,
  maxReviewSpeed,
  speedUnits,
} from "@/features/driving-review/contracts";
import type {
  ContextDraft,
  ContextIssue,
  MomentDraft,
} from "@/features/driving-review/review-context";
import styles from "./driving-review.module.css";

export function ReviewContextFields({
  value,
  issue,
  disabled,
  onChange,
}: {
  value: ContextDraft;
  issue?: ContextIssue;
  disabled: boolean;
  onChange: (value: ContextDraft) => void;
}) {
  const t = useTranslations("DrivingReview.details");
  const disclosure = useRef<HTMLDetailsElement>(null);
  const issueId = useId();

  useEffect(() => {
    if (!issue || !disclosure.current) return;
    disclosure.current.open = true;
    disclosure.current
      .querySelector<HTMLInputElement>(
        `[data-field="${issue.field}-${issue.index}"]`,
      )
      ?.focus();
  }, [issue]);

  function updateMoment(id: string, change: Partial<MomentDraft>) {
    onChange({
      ...value,
      moments: value.moments.map((moment) =>
        moment.id === id ? { ...moment, ...change } : moment,
      ),
    });
  }

  return (
    <details ref={disclosure} className={styles.contextFields}>
      <summary>{t("title")}</summary>
      <p className={styles.note}>{t("help")}</p>
      <fieldset className={styles.contextInputs} disabled={disabled}>
        <legend className="sr-only">{t("title")}</legend>
        <label>
          {t("conditions")}
          <input
            type="text"
            value={value.roadConditions}
            maxLength={160}
            placeholder={t("conditionsExample")}
            onChange={(event) =>
              onChange({ ...value, roadConditions: event.target.value })
            }
          />
        </label>
        {value.moments.map((moment, index) => {
          const invalidTime = issue?.index === index && issue.field === "time";
          const invalidSpeed =
            issue?.index === index && issue.field === "speed";
          return (
            <fieldset key={moment.id} className={styles.momentFields}>
              <legend>{t("moment", { number: index + 1 })}</legend>
              <div className={styles.momentNumbers}>
                <label>
                  {t("time")}
                  <input
                    type="text"
                    inputMode="decimal"
                    maxLength={12}
                    data-field={`time-${index}`}
                    aria-invalid={invalidTime || undefined}
                    aria-describedby={invalidTime ? issueId : undefined}
                    value={moment.time}
                    onChange={(event) =>
                      updateMoment(moment.id, { time: event.target.value })
                    }
                  />
                </label>
                <label>
                  {t("speed")}
                  <input
                    type="text"
                    inputMode="decimal"
                    maxLength={12}
                    data-field={`speed-${index}`}
                    aria-invalid={invalidSpeed || undefined}
                    aria-describedby={invalidSpeed ? issueId : undefined}
                    value={moment.speed}
                    onChange={(event) =>
                      updateMoment(moment.id, { speed: event.target.value })
                    }
                  />
                </label>
                <label>
                  {t("unit")}
                  <select
                    value={moment.unit}
                    onChange={(event) =>
                      updateMoment(moment.id, {
                        unit: event.target.value === "mph" ? "mph" : "km/h",
                      })
                    }
                  >
                    {speedUnits.map((unit) => (
                      <option key={unit}>{unit}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                {t("note")}
                <input
                  type="text"
                  value={moment.note}
                  maxLength={200}
                  onChange={(event) =>
                    updateMoment(moment.id, { note: event.target.value })
                  }
                />
              </label>
              <button
                type="button"
                className={styles.quiet}
                onClick={() =>
                  onChange({
                    ...value,
                    moments: value.moments.filter(
                      (entry) => entry.id !== moment.id,
                    ),
                  })
                }
              >
                <X size={16} aria-hidden="true" />
                {t("removeMoment", { number: index + 1 })}
              </button>
            </fieldset>
          );
        })}
        {value.moments.length < maxReviewMoments && (
          <button
            type="button"
            className={styles.quiet}
            onClick={() =>
              onChange({
                ...value,
                moments: [
                  ...value.moments,
                  {
                    id: crypto.randomUUID(),
                    time: "",
                    speed: "",
                    unit: "km/h",
                    note: "",
                  },
                ],
              })
            }
          >
            <Plus size={16} aria-hidden="true" />
            {t("addMoment")}
          </button>
        )}
      </fieldset>
      {issue && (
        <p id={issueId} className={styles.error} role="alert">
          {issue.field === "time"
            ? t("invalidTime")
            : t("invalidSpeed", { max: maxReviewSpeed })}
        </p>
      )}
    </details>
  );
}
