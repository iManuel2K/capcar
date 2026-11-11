"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Film,
  ScanEye,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { MotionLoader } from "@/components/ui/motion-loader";
import {
  useGarageAccount,
  ACTIVE_GARAGE_USER_KEY,
} from "@/components/account/garage-account-boundary";
import { useVehicles } from "@/features/vehicles/use-vehicles";
import { trackAnalytics } from "@/features/analytics/client";
import {
  reviewFocuses,
  reviewResponseSchema,
  type ReviewFocus,
  type ReviewFrame,
} from "@/features/driving-review/contracts";
import { sampleDrivingClip, ClipError } from "@/features/driving-review/frames";
import {
  emptyContextDraft,
  parseContextDraft,
  type ContextDraft,
  type ContextIssue,
} from "@/features/driving-review/review-context";
import {
  DRIVING_REVIEW_KEY,
  DRIVING_REVIEW_EVENT,
  readDrivingProfiles,
  emptyDrivingProfile,
  saveDrivingProfile,
  saveDrivingResult,
  type DrivingProfile,
  type SavedDrivingReview,
} from "@/features/driving-review/storage";
import { DrivingReviewReport } from "./driving-review-report";
import { ReviewContextFields } from "./review-context-fields";
import styles from "./driving-review.module.css";

const subscribe = (listener: () => void) => {
  window.addEventListener("storage", listener);
  window.addEventListener(DRIVING_REVIEW_EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(DRIVING_REVIEW_EVENT, listener);
  };
};
const snapshot = () => {
  try {
    return localStorage.getItem(DRIVING_REVIEW_KEY) ?? "";
  } catch {
    return "";
  }
};
const serverSnapshot = () => "";
const providerNames = {
  gemini: "Gemini",
  openai: "OpenAI",
  anthropic: "Claude",
} as const;
const errorCodes = [
  "file",
  "duration",
  "decode",
  "account",
  "connection",
  "quota",
  "provider",
  "invalid_result",
  "unavailable",
  "invalid",
] as const;
type ErrorCode = (typeof errorCodes)[number];
const errorCode = (value: unknown): ErrorCode =>
  errorCodes.includes(value as ErrorCode)
    ? (value as ErrorCode)
    : "unavailable";

export function DrivingReviewWorkspace({ vehicleId }: { vehicleId?: string }) {
  const t = useTranslations("DrivingReview");
  const { userId } = useGarageAccount();
  const { vehicles } = useVehicles();
  const vehicle = vehicles.find((item) => item.id === vehicleId);
  if (!vehicle)
    return (
      <section className={styles.page}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h1>{t("chooseCar")}</h1>
        <p className={styles.lead}>{t("intro")}</p>
        <p className={styles.note}>{t("free")}</p>
        <div className={styles.cars}>
          {vehicles.map((item) => (
            <Link
              className={styles.carLink}
              key={item.id}
              href={`/garage/${item.id}/driving-review`}
            >
              <span>
                {item.productionYear} {item.make} {item.model}
              </span>
              <ArrowUpRight aria-hidden="true" size={20} />
            </Link>
          ))}
        </div>
        <Link className={styles.primary} href="/garage/new">
          {t("addCar")}
        </Link>
      </section>
    );
  return (
    <DrivingReviewSession
      key={`${userId}:${vehicle.id}`}
      vehicleId={vehicle.id}
      label={`${vehicle.productionYear} ${vehicle.make} ${vehicle.model}`}
    />
  );
}

function DrivingReviewSession({
  vehicleId,
  label,
}: {
  vehicleId: string;
  label: string;
}) {
  const t = useTranslations("DrivingReview");
  const locale = useLocale();
  const { userId, configured } = useGarageAccount();
  const ownerSnapshot = useCallback(() => {
    try {
      return localStorage.getItem(ACTIVE_GARAGE_USER_KEY) ?? "";
    } catch {
      return "";
    }
  }, []);
  const activeOwner = useSyncExternalStore(
    subscribe,
    ownerSnapshot,
    serverSnapshot,
  );
  const ownerMismatch = configured && (!userId || activeOwner !== userId);
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const profile =
    readDrivingProfiles({ getItem: () => raw }).find(
      (item) => item.vehicleId === vehicleId,
    ) ?? emptyDrivingProfile(vehicleId);
  const [connection, setConnection] = useState<{
    connected: boolean;
    provider?: keyof typeof providerNames;
  }>();
  const [frames, setFrames] = useState<ReviewFrame[]>([]);
  const [clipUrl, setClipUrl] = useState("");
  const [excluded, setExcluded] = useState<number[]>([]);
  const [duration, setDuration] = useState(0);
  const [contextDraft, setContextDraft] = useState(emptyContextDraft);
  const [contextIssue, setContextIssue] = useState<ContextIssue>();
  const [focus, setFocus] = useState<ReviewFocus>("awareness");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState<"prepare" | "review" | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState<SavedDrivingReview>();
  const [confirmation, setConfirmation] = useState<
    "reset" | SavedDrivingReview
  >();
  const dialog = useRef<HTMLDialogElement>(null);
  const controller = useRef<AbortController | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const clipPlayer = useRef<HTMLVideoElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const returnTo = `/garage/${vehicleId}/driving-review`;
  const connectionHref = `/account/connections?next=${encodeURIComponent(returnTo)}`;
  const selected = frames.filter((_, i) => !excluded.includes(i));
  const isSaved = Boolean(
    result && profile.reviews.some((item) => item.id === result.id),
  );

  useEffect(() => {
    if (clipUrl) return () => URL.revokeObjectURL(clipUrl);
  }, [clipUrl]);

  useEffect(() => {
    const abort = new AbortController();
    fetch("/api/connections/ai", { cache: "no-store", signal: abort.signal })
      .then((response) => response.json())
      .then((data) => {
        if (!abort.signal.aborted)
          setConnection({
            connected: data.connected === true,
            provider: data.provider,
          });
      })
      .catch(() => {
        if (!abort.signal.aborted) setConnection({ connected: false });
      });
    return () => {
      abort.abort();
      controller.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (confirmation) dialog.current?.showModal();
    else dialog.current?.close();
  }, [confirmation]);

  useEffect(() => {
    if (ownerMismatch) controller.current?.abort();
  }, [ownerMismatch]);

  const isCurrentOwner = useCallback(() => {
    try {
      return (
        !configured ||
        Boolean(
          userId && localStorage.getItem(ACTIVE_GARAGE_USER_KEY) === userId,
        )
      );
    } catch {
      return false;
    }
  }, [configured, userId]);

  const write = useCallback(
    (next: DrivingProfile) => {
      try {
        if (!isCurrentOwner()) throw new Error("Account changed");
        saveDrivingProfile(next, localStorage);
        window.dispatchEvent(new Event(DRIVING_REVIEW_EVENT));
        setError("");
        return true;
      } catch {
        setError(t("saveError"));
        return false;
      }
    },
    [isCurrentOwner, t],
  );

  function invalidate() {
    setResult(undefined);
    setConsent(false);
    setNotice("");
  }
  function clear() {
    controller.current?.abort();
    controller.current = null;
    setBusy(null);
    setClipUrl("");
    setFrames([]);
    setExcluded([]);
    setDuration(0);
    setContextDraft(emptyContextDraft);
    setContextIssue(undefined);
    invalidate();
    if (input.current) input.current.value = "";
  }
  async function choose(file?: File) {
    clear();
    setError("");
    if (!file) return;
    const task = new AbortController();
    controller.current = task;
    setBusy("prepare");
    setProgress(0);
    try {
      const sampled = await sampleDrivingClip(file, task.signal, setProgress);
      if (!task.signal.aborted) {
        setClipUrl(URL.createObjectURL(file));
        setFrames(sampled.frames);
        setDuration(sampled.duration);
        trackAnalytics("driving_clip_prepared");
      }
    } catch (caught) {
      if (!task.signal.aborted)
        setError(
          t(
            `errors.${errorCode(caught instanceof ClipError ? caught.message : "decode")}`,
          ),
        );
    } finally {
      if (controller.current === task) {
        setBusy(null);
        controller.current = null;
      }
    }
  }
  function changeContext(value: ContextDraft) {
    setContextDraft(value);
    setContextIssue(undefined);
    invalidate();
  }
  function seekToFrame(time: number) {
    const player = clipPlayer.current;
    if (!player) return;
    player.pause();
    player.currentTime = time;
    player.focus({ preventScroll: true });
    player.scrollIntoView({ block: "center" });
  }
  async function review() {
    if (!isCurrentOwner()) {
      clear();
      setError(t("errors.account"));
      return;
    }
    if (
      !consent ||
      selected.length < 2 ||
      controller.current ||
      !connection?.connected
    )
      return;
    const { context, issue } = parseContextDraft(contextDraft, duration);
    if (issue) {
      setContextIssue(issue);
      return;
    }
    const task = new AbortController();
    controller.current = task;
    setBusy("review");
    setError("");
    setNotice("");
    setResult(undefined);
    trackAnalytics("driving_review_started");
    try {
      const response = await fetch("/api/ai/driving-review", {
        method: "POST",
        signal: task.signal,
        headers: {
          "Content-Type": "application/json",
          "x-capcar-owner": userId,
        },
        body: JSON.stringify({
          consent: true,
          locale,
          duration,
          frames: selected,
          focus,
          preferences: profile.learning ? profile.preferences : [],
          context,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          response.status === 429
            ? "quota"
            : response.status === 401
              ? "account"
              : data.code,
        );
      const valid = reviewResponseSchema.parse(data);
      if (task.signal.aborted) return;
      if (!isCurrentOwner()) {
        clear();
        setError(t("errors.account"));
        return;
      }
      setResult({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        provider: valid.provider,
        frameTimes: selected.map((frame) => frame.time),
        duration,
        context,
        review: valid.review,
      });
      trackAnalytics("driving_review_completed");
      requestAnimationFrame(() => resultHeading.current?.focus());
    } catch (caught) {
      if (!task.signal.aborted)
        setError(
          t(
            `errors.${errorCode(caught instanceof Error ? caught.message : "unavailable")}`,
          ),
        );
    } finally {
      if (controller.current === task) {
        setBusy(null);
        controller.current = null;
      }
    }
  }
  function save() {
    if (!result) return;
    if (write(saveDrivingResult(profile, result))) {
      setNotice(t("saved"));
      trackAnalytics("driving_review_saved");
    }
  }
  function approve(topic: ReviewFocus) {
    if (!profile.learning || profile.preferences.includes(topic)) return;
    if (write({ ...profile, preferences: [...profile.preferences, topic] }))
      trackAnalytics("driving_preference_approved");
  }
  function confirm() {
    if (!confirmation) return;
    const next =
      confirmation === "reset"
        ? { ...profile, learning: false, preferences: [] }
        : {
            ...profile,
            reviews: profile.reviews.filter(
              (item) => item.id !== confirmation.id,
            ),
          };
    if (write(next)) {
      if (confirmation === "reset") {
        setNotice(t("resetDone"));
        trackAnalytics("driving_learning_reset");
      } else if (result?.id === confirmation.id) setResult(undefined);
      setConfirmation(undefined);
    }
  }
  function dismiss(index: number) {
    if (!result) return;
    const updated = {
      ...result,
      review: {
        ...result.review,
        tips: result.review.tips.filter((_, i) => i !== index),
      },
    };
    if (isSaved && !write(saveDrivingResult(profile, updated))) return;
    setResult(updated);
  }
  if (ownerMismatch)
    return (
      <div className={styles.page}>
        <p role="alert">{t("errors.account")}</p>
        <Link
          href={`/login?next=${encodeURIComponent(returnTo)}`}
          className={styles.primary}
        >
          {t("open")}
        </Link>
      </div>
    );
  return (
    <div className={styles.page}>
      <Link href={`/garage/${vehicleId}`} className={styles.back}>
        <ArrowLeft size={16} aria-hidden="true" />
        {t("back")}
      </Link>
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          {label} / {t("beta")}
        </p>
        <h1>{t("title")}</h1>
        <p className={styles.lead}>{t("intro")}</p>
        <p className={styles.note}>{t("free")}</p>
      </header>
      <p className={styles.safety}>
        <ShieldCheck size={21} aria-hidden="true" />
        {t("parked")}
      </p>
      <div className={styles.layout}>
        <div className={styles.main}>
          <section className={styles.section} aria-labelledby="clip-title">
            <p className={styles.eyebrow}>{t("step1")}</p>
            <h2 id="clip-title">{t("upload")}</h2>
            <p className={styles.note}>{t("local")}</p>
            <div className={styles.connection}>
              <ScanEye aria-hidden="true" size={22} />
              <div>
                <p>
                  {connection?.connected && connection.provider
                    ? t("connected", {
                        provider: providerNames[connection.provider],
                      })
                    : t("connect")}
                </p>
                {!connection?.connected && (
                  <>
                    <p className={styles.note}>{t("connectionHelp")}</p>
                    <Link className={styles.textLink} href={connectionHref}>
                      {t("connect")} <ArrowUpRight size={16} />
                    </Link>
                  </>
                )}
              </div>
            </div>
            <label className={styles.upload}>
              <Film size={28} aria-hidden="true" />
              <span>{t("upload")}</span>
              <input
                ref={input}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                aria-describedby="clip-help"
                disabled={Boolean(busy)}
                onChange={(event) => void choose(event.target.files?.[0])}
              />
            </label>
            <p id="clip-help" className={styles.note}>
              {t("uploadHelp")}
            </p>
            {busy === "prepare" && (
              <div role="status" className={styles.loading}>
                <MotionLoader className="size-5" />
                {t("prepare")} · {progress}%
                <button type="button" className={styles.quiet} onClick={clear}>
                  {t("cancel")}
                </button>
              </div>
            )}
          </section>
          {frames.length > 0 && (
            <section className={styles.section} aria-labelledby="frames-title">
              <p className={styles.eyebrow}>{t("step2")}</p>
              <div className={styles.sectionTitle}>
                <h2 id="frames-title">
                  {t("frames", { count: selected.length })}
                </h2>
                <button type="button" className={styles.quiet} onClick={clear}>
                  {t("removeClip")}
                </button>
              </div>
              <video
                ref={clipPlayer}
                src={clipUrl}
                className={styles.clipPlayer}
                aria-label={t("report.preview")}
                controls
                playsInline
                preload="metadata"
                tabIndex={0}
              />
              <p className={styles.note}>{t("frameHelp")}</p>
              <p className={styles.note}>{t("privacy")}</p>
              <fieldset className={styles.frames} disabled={Boolean(busy)}>
                <legend className="sr-only">{t("step2")}</legend>
                {frames.map((frame, index) => (
                  <label
                    className={styles.frame}
                    data-selected={!excluded.includes(index)}
                    key={frame.time}
                  >
                    <Image
                      src={frame.image}
                      alt={t("frame", {
                        number: index + 1,
                        time: frame.time.toFixed(1),
                      })}
                      width={640}
                      height={360}
                      unoptimized
                    />
                    <span>
                      <input
                        type="checkbox"
                        checked={!excluded.includes(index)}
                        aria-label={t("keepFrame", { number: index + 1 })}
                        onChange={() => {
                          invalidate();
                          setExcluded(
                            excluded.includes(index)
                              ? excluded.filter((i) => i !== index)
                              : [...excluded, index],
                          );
                        }}
                      />
                      {frame.time.toFixed(1)}s
                    </span>
                  </label>
                ))}
              </fieldset>
              <fieldset className={styles.focus} disabled={Boolean(busy)}>
                <legend>{t("focus")}</legend>
                {reviewFocuses.map((topic) => (
                  <label key={topic}>
                    <input
                      type="radio"
                      name="review-focus"
                      value={topic}
                      checked={focus === topic}
                      onChange={() => {
                        setFocus(topic);
                        invalidate();
                      }}
                    />
                    {t(`focuses.${topic}`)}
                  </label>
                ))}
              </fieldset>
              <ReviewContextFields
                value={contextDraft}
                issue={contextIssue}
                disabled={Boolean(busy)}
                onChange={changeContext}
              />
              <label className={styles.consent}>
                <input
                  type="checkbox"
                  checked={consent}
                  disabled={Boolean(busy)}
                  onChange={(event) => setConsent(event.target.checked)}
                />
                <span>{t("consent")}</span>
              </label>
              <div className={styles.actions}>
                <button
                  className={styles.primary}
                  type="button"
                  disabled={
                    !consent ||
                    selected.length < 2 ||
                    !connection?.connected ||
                    Boolean(busy)
                  }
                  onClick={() => void review()}
                >
                  {busy === "review" && <MotionLoader className="size-4" />}
                  {t("review")}
                </button>
                {busy === "review" && (
                  <button
                    className={styles.quiet}
                    type="button"
                    onClick={() => {
                      controller.current?.abort();
                      controller.current = null;
                      setBusy(null);
                    }}
                  >
                    {t("cancel")}
                  </button>
                )}
              </div>
              {busy === "review" && (
                <p role="status" className={styles.note}>
                  {t("reviewing")}
                </p>
              )}
            </section>
          )}
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className={styles.notice}>
              {notice}
            </p>
          )}
          {result && (
            <section
              className={styles.section}
              aria-labelledby="reflection-title"
            >
              <p className={styles.eyebrow}>{t("step3")}</p>
              <h2 id="reflection-title" tabIndex={-1} ref={resultHeading}>
                {t("result")}
              </h2>
              <DrivingReviewReport
                key={result.id}
                item={result}
                canDownload={isCurrentOwner}
                onSeek={seekToFrame}
                onDismiss={dismiss}
                onApprove={profile.learning ? approve : undefined}
                preferences={profile.preferences}
                actions={
                  <button
                    type="button"
                    className={styles.quiet}
                    disabled={isSaved}
                    onClick={save}
                  >
                    {t(isSaved ? "saved" : "save")}
                  </button>
                }
              />
            </section>
          )}
          <section className={styles.section}>
            <h2>{t("history")}</h2>
            <p className={styles.note}>{t("historyHelp")}</p>
            {!profile.reviews.length && (
              <p className={styles.empty}>{t("empty")}</p>
            )}
            {profile.reviews.map((item) => (
              <details key={item.id} className={styles.history}>
                <summary>
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(item.createdAt))}{" "}
                  · {providerNames[item.provider]}
                </summary>
                <DrivingReviewReport
                  item={item}
                  canDownload={isCurrentOwner}
                  actions={
                    <button
                      type="button"
                      className={styles.quiet}
                      onClick={() => setConfirmation(item)}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      {t("delete")}
                    </button>
                  }
                />
              </details>
            ))}
          </section>
        </div>
        <aside className={styles.learning} aria-labelledby="learning-title">
          <Sparkles aria-hidden="true" className={styles.accent} />
          <h2 id="learning-title">{t("learning")}</h2>
          <p className={styles.note}>{t("learningHelp")}</p>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              role="switch"
              checked={profile.learning}
              onChange={(event) => {
                if (write({ ...profile, learning: event.target.checked }))
                  trackAnalytics("driving_learning_changed");
              }}
            />
            {t("learning")}
          </label>
          <h3>{t("preferences")}</h3>
          {!profile.preferences.length && (
            <p className={styles.note}>{t("noPreferences")}</p>
          )}
          <ul className={styles.preferences}>
            {profile.preferences.map((topic) => (
              <li key={topic}>
                <span>{t(`focuses.${topic}`)}</span>
                <button
                  type="button"
                  aria-label={t("forget", { topic: t(`focuses.${topic}`) })}
                  onClick={() =>
                    write({
                      ...profile,
                      preferences: profile.preferences.filter(
                        (value) => value !== topic,
                      ),
                    })
                  }
                >
                  <X aria-hidden="true" size={18} />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={styles.quiet}
            disabled={!profile.learning && !profile.preferences.length}
            onClick={() => setConfirmation("reset")}
          >
            {t("reset")}
          </button>
        </aside>
      </div>
      <dialog
        ref={dialog}
        className={styles.dialog}
        onCancel={() => setConfirmation(undefined)}
        aria-labelledby="driving-confirm-title"
      >
        <h2 id="driving-confirm-title">
          {t(confirmation === "reset" ? "reset" : "delete")}
        </h2>
        <p>{t(confirmation === "reset" ? "resetHelp" : "deleteHelp")}</p>
        <div className={styles.actions}>
          <button
            autoFocus
            type="button"
            className={styles.quiet}
            onClick={() => setConfirmation(undefined)}
          >
            {t("close")}
          </button>
          <button type="button" className={styles.primary} onClick={confirm}>
            {t("confirm")}
          </button>
        </div>
      </dialog>
    </div>
  );
}
