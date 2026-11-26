import { getTranslations } from "next-intl/server";
import { formatClipTime } from "@/features/driving-review/review-context";
import styles from "./driving-review.module.css";

const duration = 12;
const frameTimes = [2, 5, 8, 11];

export async function DrivingReviewSample() {
  const t = await getTranslations("DrivingReview");

  return (
    <section
      id="sample-report"
      aria-labelledby="sample-report-title"
      className="mt-10 scroll-mt-28"
    >
      <h2 id="sample-report-title">{t("sample.heading")}</h2>
      <p className={styles.note}>{t("sample.disclosure")}</p>
      <div className={styles.report}>
        <div className={styles.reportOverview}>
          <p className={styles.note}>
            {t("report.coverage", { count: frameTimes.length })} ·{" "}
            {t("report.length", { time: formatClipTime(duration) })}
          </p>
          <div className={styles.timeline} aria-hidden="true">
            {frameTimes.map((time) => (
              <span
                key={time}
                style={{ left: `${(time / duration) * 100}%` }}
              />
            ))}
          </div>
          <p className={styles.note}>
            {frameTimes.map(formatClipTime).join(" · ")}
          </p>
          <p className={styles.lead}>{t("sample.summary")}</p>
        </div>
        {(["strength", "improvement"] as const).map((kind) => (
          <div key={kind} className={styles.findings}>
            <h3>{t(`report.${kind}`)}</h3>
            <div className={styles.tip} data-kind={kind}>
              <dl className={styles.reportFields}>
                <div>
                  <dt>{t("observation")}</dt>
                  <dd>{t(`sample.${kind}`)}</dd>
                </div>
                <div data-practice>
                  <dt>{t("suggestion")}</dt>
                  <dd>
                    {t(
                      kind === "strength"
                        ? "sample.practiceStrength"
                        : "sample.practiceImprovement",
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        ))}
        <div className={styles.reportPanel}>
          <h3>{t("report.userDetails")}</h3>
          <p>{t("sample.supplied")}</p>
        </div>
        <div className={styles.reportPanel}>
          <h3>{t("limits")}</h3>
          <p>{t("fixedLimit")}</p>
        </div>
      </div>
    </section>
  );
}
