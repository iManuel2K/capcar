import Image from "next/image";
import { Check, Download, Flag, Play, Sparkles, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { downloadFile } from "@/features/export/download";
import type {
  ReviewFocus,
  ReviewFrame,
} from "@/features/driving-review/contracts";
import type { ReportSection } from "@/features/driving-review/report-image";
import { formatClipTime } from "@/features/driving-review/review-context";
import type { SavedDrivingReview } from "@/features/driving-review/storage";
import styles from "./driving-review.module.css";

export function DrivingReviewReport({
  item,
  actions,
  canDownload,
  onSeek,
  frames,
  onDismiss,
  onApprove,
  preferences,
}: {
  item: SavedDrivingReview;
  actions: ReactNode;
  canDownload: () => boolean;
  frames?: ReviewFrame[];
  onSeek?: (time: number) => void;
  onDismiss?: (index: number) => void;
  onApprove?: (focus: ReviewFocus) => void;
  preferences?: ReviewFocus[];
}) {
  const t = useTranslations("DrivingReview");
  const locale = useLocale();
  const [exportState, setExportState] = useState<"working" | "error">();
  const exportTask = useRef<AbortController | null>(null);
  useEffect(() => () => exportTask.current?.abort(), []);

  const coverage = [
    t("report.coverage", { count: item.frameTimes.length }),
    item.duration &&
      t("report.length", { time: formatClipTime(item.duration) }),
  ]
    .filter(Boolean)
    .join(" · ");
  const focusTime = item.context?.focusTime;
  const clipDuration = item.duration;
  const marked = item.review.markedMoment;
  const markedTimes = [marked?.frame, marked?.relatedFrame].flatMap((index) => {
    const time = index === undefined ? undefined : item.frameTimes[index - 1];
    return time === undefined ? [] : [time];
  });
  const markedHeading =
    focusTime === undefined
      ? undefined
      : t("moment.report", { time: formatClipTime(focusTime) });
  const markedText = marked?.observation ?? t("moment.unassessed");

  const findings = item.review.tips.map((tip, index) => {
    const times = [tip.frame, tip.relatedFrame].flatMap((frame) => {
      const time = frame === undefined ? undefined : item.frameTimes[frame - 1];
      return time === undefined ? [] : [time];
    });
    return {
      tip,
      index,
      times,
      confidence: t(`confidence.${tip.confidence}`),
      fields: [
        { label: t("observation"), text: tip.observation },
        ...(tip.explanation
          ? [{ label: t("report.explanation"), text: tip.explanation }]
          : []),
        { label: t("suggestion"), text: tip.suggestion },
      ],
    };
  });
  const legacyOnly =
    findings.length > 0 && findings.every(({ tip }) => !tip.kind);
  const groups = (["improvement", "strength", "legacy"] as const)
    .map((kind) => ({
      kind,
      heading: t(`report.${kind}`),
      findings: findings.filter(({ tip }) => (tip.kind ?? "legacy") === kind),
    }))
    .filter(({ kind, findings }) =>
      kind === "legacy" ? findings.length > 0 : !legacyOnly,
    );

  const context = item.context;
  const numberFormat = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  });
  const userDetails = [
    ...(context?.roadConditions
      ? [{ label: t("details.conditions"), text: context.roadConditions }]
      : []),
    ...(context?.moments ?? []).map(({ time, speed, note }) => ({
      label: formatClipTime(time),
      text:
        [
          speed &&
            t("report.reportedSpeed", {
              speed: numberFormat.format(speed.value),
              unit: speed.unit,
            }),
          note,
        ]
          .filter(Boolean)
          .join(" · ") || t("report.markedMoment"),
    })),
  ];
  const limits = [t("fixedLimit"), ...item.review.limitations];

  async function download() {
    if (exportTask.current || !canDownload()) return;
    const task = new AbortController();
    exportTask.current = task;
    setExportState("working");
    try {
      const sections: ReportSection[] = groups.map(
        ({ kind, heading, findings }) => ({
          heading,
          tone: kind === "legacy" ? undefined : kind,
          paragraphs: findings.length
            ? []
            : [
                t(
                  kind === "strength"
                    ? "report.noStrength"
                    : "report.noImprovement",
                ),
              ],
          entries: findings.map(({ times, confidence, fields }) => ({
            heading: [...times.map(formatClipTime), confidence].join(" · "),
            fields,
          })),
        }),
      );
      if (markedHeading) {
        sections.unshift({
          heading: markedHeading,
          tone: "moment",
          paragraphs: [markedText],
          entries: markedTimes.length
            ? [
                {
                  heading: markedTimes.map(formatClipTime).join(" · "),
                  fields: [],
                },
              ]
            : [],
        });
      }
      sections.push(
        {
          heading: t("report.userDetails"),
          paragraphs: [
            t(
              userDetails.length
                ? "report.userDetailsHelp"
                : "report.noContext",
            ),
          ],
          entries: userDetails.map(({ label, text }) => ({
            heading: label,
            fields: [{ label: "", text }],
          })),
        },
        { heading: t("limits"), paragraphs: limits },
      );
      const { createDrivingReportImage } =
        await import("@/features/driving-review/report-image");
      const blob = await createDrivingReportImage(
        {
          title: t("result"),
          coverage,
          summary: marked && markedHeading ? "" : item.review.summary,
          timeline: item.duration
            ? { duration: item.duration, times: item.frameTimes, focusTime }
            : undefined,
          sections,
          footer: t("parked"),
        },
        locale,
      );
      if (!task.signal.aborted && canDownload()) {
        downloadFile(
          `capcar-driving-review-${item.createdAt.slice(0, 10)}.png`,
          blob,
        );
      }
      if (!task.signal.aborted) setExportState(undefined);
    } catch {
      if (!task.signal.aborted) setExportState("error");
    } finally {
      exportTask.current = null;
    }
  }

  return (
    <div className={styles.report}>
      <div className={styles.reportOverview}>
        <p className={styles.note}>{coverage}</p>
        {clipDuration && (
          <div className={styles.timeline} aria-hidden="true">
            {item.frameTimes.map((time) => (
              <span
                key={time}
                style={{ left: `${(time / clipDuration) * 100}%` }}
              />
            ))}
            {focusTime !== undefined && (
              <span
                data-marker
                style={{ left: `${(focusTime / clipDuration) * 100}%` }}
              />
            )}
          </div>
        )}
        {!(marked && markedHeading) && (
          <p className={styles.lead}>{item.review.summary}</p>
        )}
      </div>
      {markedHeading && (
        <div className={styles.markedFinding}>
          <h3>
            <Flag size={18} aria-hidden="true" /> {markedHeading}
          </h3>
          <p>{markedText}</p>
          <Evidence times={markedTimes} frames={frames} onSeek={onSeek} />
        </div>
      )}
      {groups.map(({ kind, heading, findings }) => (
        <div key={kind} className={styles.findings}>
          <h3>{heading}</h3>
          {!findings.length && (
            <p className={styles.note}>
              {t(
                kind === "strength"
                  ? "report.noStrength"
                  : "report.noImprovement",
              )}
            </p>
          )}
          {findings.map(({ tip, index, times, confidence, fields }) => {
            const approved = preferences?.includes(tip.focus);
            return (
              <article className={styles.tip} data-kind={kind} key={index}>
                <div className={styles.tipMeta}>
                  <Evidence times={times} frames={frames} onSeek={onSeek} />
                  <span>{confidence}</span>
                </div>
                <dl className={styles.reportFields}>
                  {fields.map(({ label, text }) => (
                    <div
                      key={label}
                      data-practice={label === t("suggestion") || undefined}
                    >
                      <dt>{label}</dt>
                      <dd>{text}</dd>
                    </div>
                  ))}
                </dl>
                {(onApprove || onDismiss) && (
                  <div className={styles.actions}>
                    {onApprove && (
                      <button
                        type="button"
                        className={styles.quiet}
                        disabled={approved}
                        onClick={() => onApprove(tip.focus)}
                      >
                        {approved ? (
                          <Check size={16} aria-hidden="true" />
                        ) : (
                          <Sparkles size={16} aria-hidden="true" />
                        )}
                        {t(approved ? "approved" : "approve")} ·{" "}
                        {t(`focuses.${tip.focus}`)}
                      </button>
                    )}
                    {onDismiss && (
                      <button
                        type="button"
                        className={styles.quiet}
                        onClick={() => onDismiss(index)}
                      >
                        <X size={16} aria-hidden="true" /> {t("dismiss")}
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ))}
      <div className={styles.reportPanel}>
        <h3>{t("report.userDetails")}</h3>
        <p>
          {t(
            userDetails.length ? "report.userDetailsHelp" : "report.noContext",
          )}
        </p>
        {userDetails.length > 0 && (
          <dl className={styles.reportFields}>
            {userDetails.map(({ label, text }, index) => (
              <div key={index}>
                <dt>{label}</dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div className={styles.reportPanel}>
        <h3>{t("limits")}</h3>
        <p>{limits[0]}</p>
        <ul>
          {item.review.limitations.map((limit, index) => (
            <li key={index}>{limit}</li>
          ))}
        </ul>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={onDismiss ? styles.primary : styles.quiet}
          disabled={exportState === "working"}
          onClick={() => void download()}
        >
          <Download size={17} aria-hidden="true" />
          {t(
            exportState === "working" ? "report.exporting" : "report.download",
          )}
        </button>
        {actions}
      </div>
      {exportState === "error" && (
        <p role="alert" className={styles.error}>
          {t("report.exportError")}
        </p>
      )}
    </div>
  );
}

function Evidence({
  times,
  frames,
  onSeek,
}: {
  times: number[];
  frames?: ReviewFrame[];
  onSeek?: (time: number) => void;
}) {
  const t = useTranslations("DrivingReview.report");
  return (
    <div className={styles.timeLinks}>
      {times.map((time) => {
        const frame = frames?.find((frame) => frame.time === time);
        const label = formatClipTime(time);
        return onSeek ? (
          <button
            key={time}
            type="button"
            className={styles.timeLink}
            aria-label={t("jumpTo", { time: label })}
            onClick={() => onSeek(time)}
          >
            {frame && (
              <Image
                src={frame.image}
                alt=""
                width={112}
                height={63}
                unoptimized
              />
            )}
            <span>
              <Play size={13} aria-hidden="true" /> {label}
            </span>
          </button>
        ) : (
          <span key={time}>{label}</span>
        );
      })}
    </div>
  );
}
