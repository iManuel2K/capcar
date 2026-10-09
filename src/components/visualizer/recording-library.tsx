"use client";

import { useEffect, useRef, useState } from "react";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { downloadTextFile } from "@/features/export/download";
import {
  recordingStore,
  saveRecording,
  RecordingLimitError,
  type Recording,
} from "@/features/visualizer/recording-library";
import { useTranslations } from "next-intl";
import {
  AUDIO_ACCEPT,
  isSupportedAudio,
  pauseOtherStudioAudio,
} from "@/features/visualizer/audio-files";

const field =
  "min-h-11 w-full rounded-xl border border-white/25 bg-[#152421] px-3 text-white";
export function RecordingLibrary() {
  const t = useTranslations("SoundUi");
  const s = useTranslations("StudioPolish");
  const unavailableMessage = t("storageUnavailable");
  const enums = useTranslations("SoundEnums");
  const [records, setRecords] = useState<Recording[]>([]);
  const [vehicle, setVehicle] = useState("");
  const [category, setCategory] = useState<Recording["category"]>("exhaust");
  const [setup, setSetup] = useState<Recording["setup"]>("stock");
  const [rights, setRights] = useState<Recording["rights"]>("owned");
  const [confirmed, setConfirmed] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [storageFailed, setStorageFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [comparison, setComparison] = useState<[string, string]>(["", ""]);
  const lock = useRef(false);
  useEffect(() => {
    let alive = true;
    recordingStore<Recording[]>((store) => store.getAll())
      .then((items) => {
        if (alive) {
          setRecords(
            items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
          );
          setReady(true);
          setStorageFailed(false);
        }
      })
      .catch(() => {
        if (alive) {
          setMessage(unavailableMessage);
          setStorageFailed(true);
        }
      });
    return () => {
      alive = false;
    };
  }, [unavailableMessage, loadAttempt]);
  async function receive(file: File) {
    if (lock.current || !ready || !confirmed || !vehicle.trim()) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      if (!isSupportedAudio(file)) throw new Error(t("invalidFile"));
      if (records.length >= 20) throw new Error(t("limit"));
      const record: Recording = {
        id: crypto.randomUUID(),
        name: file.name,
        vehicle: vehicle.trim(),
        category,
        setup,
        rights,
        createdAt: new Date().toISOString(),
        file,
      };
      await saveRecording(record);
      setRecords((items) => [record, ...items]);
      setMessage(t("saved"));
    } catch (error) {
      setMessage(
        error instanceof RecordingLimitError
          ? t("limit")
          : error instanceof Error
            ? error.message
            : t("saveFailed"),
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function remove(id: string) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      await recordingStore((store) => store.delete(id), true);
      setRecords((items) => items.filter((item) => item.id !== id));
      setComparison(([a, b]) => [a === id ? "" : a, b === id ? "" : b]);
      setMessage(t("removed"));
    } catch {
      setMessage(t("removeFailed"));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const matching = records.filter(
    (item) =>
      (filter === "all" || item.category === filter) &&
      `${item.name} ${item.vehicle}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  return (
    <section
      id="archive"
      className="scroll-mt-28 rounded-[2rem] border border-white/10 bg-[#0e2d30] p-5 text-[#e8e6d7] sm:p-8"
      aria-labelledby="recording-library-title"
    >
      <p className="text-xs font-medium tracking-[.18em] text-[#cfaa96] uppercase">
        03 / {t("archive")}
      </p>
      <h2 id="recording-library-title" className="mt-3 text-3xl font-medium">
        {t("keep")}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#e8e6d7]/70">
        {t("archiveDescription")}
      </p>
      <p className="mt-3 text-xs text-[#cfaa96]">
        {s("archiveCount", {
          count: records.length,
          size: (
            records.reduce((total, item) => total + item.file.size, 0) /
            1024 /
            1024
          ).toFixed(1),
        })}
      </p>
      <div className="my-6 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">
          {t("context")}
          <input
            className={field}
            maxLength={160}
            value={vehicle}
            onChange={(event) => setVehicle(event.target.value)}
            placeholder={t("contextPlaceholder")}
          />
        </label>
        <label className="grid gap-2 text-sm">
          {t("category")}
          <select
            className={field}
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as Recording["category"])
            }
          >
            {["engine", "exhaust", "intake", "cold-start"].map((item) => (
              <option key={item} value={item}>
                {enums(item)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          {t("setup")}
          <select
            className={field}
            value={setup}
            onChange={(event) =>
              setSetup(event.target.value as Recording["setup"])
            }
          >
            <option value="stock">{enums("stock")}</option>
            <option value="modified">{enums("modified")}</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          {t("permission")}
          <select
            className={field}
            value={rights}
            onChange={(event) =>
              setRights(event.target.value as Recording["rights"])
            }
          >
            <option value="owned">{t("owned")}</option>
            <option value="permission">{t("personal")}</option>
          </select>
        </label>
      </div>
      <label className="mb-5 flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          className="size-5"
        />
        {t("confirmRights")}
      </label>
      {records.length >= 2 && (
        <section
          aria-label={t("compareSavedLabel")}
          className="mt-6 rounded-2xl border border-white/25 p-4 sm:p-5"
        >
          <h3 className="text-xl font-medium">{t("compareSaved")}</h3>
          <p className="mt-2 text-sm leading-6">
            {t("compareSavedDescription")}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {([0, 1] as const).map((slot) => {
              const selected = records.find(
                (record) => record.id === comparison[slot],
              );
              return (
                <div key={slot} className="min-w-0 space-y-3">
                  <label className="grid gap-2 text-sm">
                    {t("take", { slot: slot === 0 ? "A" : "B" })}
                    <select
                      className={field}
                      value={comparison[slot]}
                      onChange={(event) =>
                        setComparison((previous) =>
                          slot === 0
                            ? [event.target.value, previous[1]]
                            : [previous[0], event.target.value],
                        )
                      }
                    >
                      <option value="">{t("chooseRecording")}</option>
                      {records
                        .filter(
                          (record) =>
                            record.id !== comparison[slot === 0 ? 1 : 0],
                        )
                        .map((record) => (
                          <option key={record.id} value={record.id}>
                            {record.vehicle} · {enums(record.setup)} ·{" "}
                            {record.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  {selected && (
                    <RecordingCard key={selected.id} item={selected} />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
      <FileDropzone
        accept={AUDIO_ACCEPT}
        tone="studio"
        label={t("add")}
        description={t("addDescription")}
        disabled={
          !ready ||
          busy ||
          !confirmed ||
          !vehicle.trim() ||
          records.length >= 20
        }
        onFile={receive}
      />
      {!ready && !storageFailed && (
        <p role="status" className="mt-3 text-sm">
          {s("loadingArchive")}
        </p>
      )}
      {storageFailed && (
        <button
          type="button"
          className="mt-3 min-h-11 underline"
          onClick={() => {
            setStorageFailed(false);
            setMessage("");
            setLoadAttempt((value) => value + 1);
          }}
        >
          {s("retryStorage")}
        </button>
      )}
      {ready && (!confirmed || !vehicle.trim()) && (
        <p className="mt-3 text-xs text-[#e8e6d7]/65">{s("addHint")}</p>
      )}
      {records.length >= 20 && <p className="mt-3 text-sm">{t("limit")}</p>}
      <p role="status" className="my-4 text-sm">
        {busy ? t("saving") : message}
      </p>
      <label className="flex flex-wrap items-center gap-3 text-sm">
        {t("filter")}
        <select
          className={field + " max-w-48"}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          {["all", "engine", "exhaust", "intake", "cold-start"].map((item) => (
            <option key={item} value={item}>
              {enums(item)}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-4 block text-sm">
        {s("searchArchive")}
        <input
          type="search"
          maxLength={160}
          className={field + " mt-2"}
          value={search}
          onChange={(event) => {
            pauseOtherStudioAudio();
            setSearch(event.target.value);
          }}
        />
      </label>
      {ready && !matching.length && (
        <p className="mt-5 text-sm">
          {records.length ? s("noArchiveMatches") : t("empty")}
        </p>
      )}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {matching.map((item) => (
          <RecordingCard
            key={item.id}
            item={item}
            onRemove={busy ? undefined : () => void remove(item.id)}
          />
        ))}
      </div>
    </section>
  );
}
function RecordingCard({
  item,
  onRemove,
}: {
  item: Recording;
  onRemove?: () => void;
}) {
  const t = useTranslations("SoundUi");
  const enums = useTranslations("SoundEnums");
  const player = useRef<HTMLAudioElement>(null);
  const [failed, setFailed] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(item.file);
    if (player.current) {
      player.current.src = objectUrl;
      player.current.volume = 0.25;
    }
    const audio = player.current;
    return () => {
      audio?.pause();
      URL.revokeObjectURL(objectUrl);
    };
  }, [item.file]);
  return (
    <article className="min-w-0 rounded-2xl border border-white/20 p-4">
      <h3 className="truncate font-medium">{item.name}</h3>
      <p className="mt-2 text-sm">{item.vehicle}</p>
      <p className="my-3 text-xs">
        {enums(item.category)} / {enums(item.setup)} /{" "}
        {item.rights === "owned" ? t("ownerDeclared") : t("permissionDeclared")}{" "}
        · {t("unverified")}
      </p>
      <audio
        data-capcar-audio
        ref={player}
        controls
        preload="none"
        aria-label={item.name}
        className="h-11 w-full min-w-0 [color-scheme:dark]"
        onError={() => setFailed(true)}
        onPlay={(event) => pauseOtherStudioAudio(event.currentTarget)}
      />
      {failed && (
        <p role="alert" className="mt-3 text-sm">
          {t("playFailed")}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <button
          type="button"
          className="min-h-11 underline"
          onClick={() => {
            const url = URL.createObjectURL(item.file);
            const link = document.createElement("a");
            link.href = url;
            link.download = item.name;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >
          {t("downloadAudio")}
        </button>
        <button
          type="button"
          className="min-h-11 underline"
          onClick={() => {
            downloadTextFile(
              `capcar-recording-${item.id}.json`,
              JSON.stringify(
                {
                  id: item.id,
                  name: item.name,
                  vehicle: item.vehicle,
                  category: item.category,
                  setup: item.setup,
                  rights: item.rights,
                  createdAt: item.createdAt,
                  bytes: item.file.size,
                  mimeType: item.file.type,
                  rightsNotice:
                    "Source permission is owner-declared and unverified. This export does not grant redistribution rights.",
                },
                null,
                2,
              ),
            );
          }}
        >
          {t("downloadNotes")}
        </button>
        {onRemove &&
          (confirmRemove ? (
            <>
              <span className="self-center">{t("deleteQuestion")}</span>
              <button
                type="button"
                className="min-h-11 underline"
                onClick={() => {
                  onRemove();
                  setConfirmRemove(false);
                }}
              >
                {t("confirmRemoval")}
              </button>
              <button
                type="button"
                className="min-h-11 underline"
                onClick={() => setConfirmRemove(false)}
              >
                {t("cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="min-h-11 underline"
              onClick={() => setConfirmRemove(true)}
            >
              {t("remove")}
            </button>
          ))}
      </div>
    </article>
  );
}
