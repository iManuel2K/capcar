"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowUp,
  Check,
  Headphones,
  Pause,
  Search,
  Share2,
  Upload,
  X,
} from "lucide-react";
import {
  AUDIO_ACCEPT,
  isSupportedAudio,
  pauseOtherStudioAudio,
} from "@/features/visualizer/audio-files";
import {
  soundCatalog,
  soundSource,
  type CatalogSound,
} from "@/features/visualizer/sound-catalog";
import { soundDeskCopy } from "@/features/visualizer/sound-desk-copy";
import { MasterVolume, StudioAudio } from "./studio-audio";
import styles from "./sound-desk.module.css";

type Side = "a" | "b";
type Choice =
  | { kind: "library"; id: string }
  | { kind: "file"; url: string; name: string }
  | { kind: "empty" };
const defaults: Record<Side, Choice> = {
  a: { kind: "library", id: "honda-f20c" },
  b: { kind: "library", id: "volvo-850-t5" },
};
const pageSize = 12;
const brands = [...new Set(soundCatalog.map((sound) => sound.make))].sort();

export function CuratedSounds() {
  const c = soundDeskCopy(useLocale());
  const t = useTranslations("SoundUi");
  const tracks = useTranslations("SoundTracks");
  const [search, setSearch] = useState("");
  const [make, setMake] = useState("");
  const [collection, setCollection] = useState("");
  const [cylinders, setCylinders] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState("honda-f20c");
  const [choices, setChoices] = useState<Record<Side, Choice>>(defaults);
  const [target, setTarget] = useState<Side>("b");
  const [offset, setOffset] = useState(0);
  const [message, setMessage] = useState("");
  const [active, setActive] = useState<Side | null>(null);
  const aRef = useRef<HTMLAudioElement>(null);
  const bRef = useRef<HTMLAudioElement>(null);
  const ownedUrls = useRef(new Set<string>());
  const libraryRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  const title = (sound: CatalogSound) =>
    sound.titleKey ? tracks(sound.titleKey) : sound.title;
  const matching = soundCatalog.filter(
    (sound) =>
      (!make || sound.make === make) &&
      (!collection || sound.category === collection) &&
      (!cylinders || sound.cylinders === (cylinders === -1 ? 0 : cylinders)) &&
      `${sound.title} ${sound.make} ${sound.cylinders || ""}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(matching.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = matching.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const selected =
    soundCatalog.find((sound) => sound.id === selectedId) ?? soundCatalog[0];

  useEffect(() => {
    const owned = ownedUrls.current;
    const params = new URLSearchParams(window.location.search);
    const initial = { ...defaults };
    for (const side of ["a", "b"] as const) {
      const id = params.get(side);
      if (id && soundCatalog.some((sound) => sound.id === id))
        initial[side] = { kind: "library", id };
      else if (id === "personal") initial[side] = { kind: "empty" };
    }
    if (
      initial.a.kind === "library" &&
      initial.b.kind === "library" &&
      initial.a.id === initial.b.id
    )
      initial.b = initial.a.id === "volvo-850-t5" ? defaults.a : defaults.b;
    const frame = requestAnimationFrame(() => setChoices(initial));
    return () => {
      cancelAnimationFrame(frame);
      owned.forEach((url) => URL.revokeObjectURL(url));
      owned.clear();
    };
  }, []);

  function replace(side: Side, choice: Choice) {
    const other = choices[side === "a" ? "b" : "a"];
    if (
      choice.kind === "library" &&
      other.kind === "library" &&
      choice.id === other.id
    ) {
      setMessage(c.duplicate);
      return;
    }
    pauseOtherStudioAudio();
    const current = choices[side];
    if (current.kind === "file") {
      URL.revokeObjectURL(current.url);
      ownedUrls.current.delete(current.url);
    }
    setChoices((previous) => ({ ...previous, [side]: choice }));
    setActive(null);
    setMessage(`${c.added} ${side.toUpperCase()}`);
  }
  function receive(side: Side, file: File) {
    if (!isSupportedAudio(file)) {
      setMessage(t("filePrompt"));
      return;
    }
    const url = URL.createObjectURL(file);
    ownedUrls.current.add(url);
    replace(side, { kind: "file", url, name: file.name });
  }
  async function listen(side: Side) {
    pauseOtherStudioAudio();
    const audio = (side === "a" ? aRef : bRef).current;
    if (!audio) return;
    try {
      const start = () => {
        audio.currentTime = Math.min(
          offset,
          Number.isFinite(audio.duration)
            ? Math.max(0, audio.duration - 0.1)
            : offset,
        );
      };
      if (audio.readyState >= 1) start();
      else audio.addEventListener("loadedmetadata", start, { once: true });
      await audio.play();
      setActive(side);
      setMessage("");
    } catch {
      setActive(null);
      setMessage(c.playbackError);
    }
  }
  function browse(side: Side) {
    setTarget(side);
    libraryRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
    libraryRef.current
      ?.querySelector<HTMLInputElement>('input[type="search"]')
      ?.focus({ preventScroll: true });
  }
  async function share() {
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "compare";
    for (const side of ["a", "b"] as const) {
      const choice = choices[side];
      url.searchParams.set(
        side,
        choice.kind === "library" ? choice.id : "personal",
      );
    }
    try {
      await navigator.clipboard.writeText(url.toString());
      setMessage(c.copied);
    } catch {
      setMessage(`${c.copyFailed} ${url.toString()}`);
    }
  }
  function clearFilters() {
    setSearch("");
    setMake("");
    setCollection("");
    setCylinders(0);
    setPage(1);
  }
  function reset() {
    pauseOtherStudioAudio();
    ownedUrls.current.forEach((url) => URL.revokeObjectURL(url));
    ownedUrls.current.clear();
    setChoices(defaults);
    setOffset(0);
    setActive(null);
    setMessage("");
  }
  return (
    <div className={styles.workbench}>
      <section
        id="compare"
        aria-labelledby="sound-comparison-title"
        className={styles.console}
      >
        <div className={styles.consoleHeader}>
          <div>
            <p className={styles.eyebrow}>01 / A ↔ B</p>
            <h2 id="sound-comparison-title">{c.compare}</h2>
            <p>{c.compareIntro}</p>
          </div>
          <button
            type="button"
            className={styles.outlineButton}
            onClick={share}
          >
            <Share2 size={16} aria-hidden="true" />
            {c.share}
          </button>
        </div>
        <div className={styles.slots}>
          {(["a", "b"] as const).map((side) => {
            const choice = choices[side];
            const sound =
              choice.kind === "library"
                ? soundCatalog.find((item) => item.id === choice.id)!
                : undefined;
            return (
              <div
                key={side}
                className={`${styles.slot} ${side === "b" ? styles.slotB : ""}`}
                data-active={active === side}
              >
                <div className={styles.slotHeading}>
                  <span className={styles.channel}>{side.toUpperCase()}</span>
                  <p>{side === "a" ? c.stock : c.alternative}</p>
                  <span className={styles.signal} aria-hidden="true" />
                </div>
                <h3>
                  {sound
                    ? title(sound)
                    : choice.kind === "file"
                      ? choice.name
                      : c.empty}
                </h3>
                <p className={styles.sourceKind}>
                  {sound
                    ? c.recorded
                    : choice.kind === "file"
                      ? c.personal
                      : c.shareNote}
                </p>
                {choice.kind !== "empty" && (
                  <StudioAudio
                    src={
                      sound
                        ? `/sounds/${sound.audio}`
                        : choice.kind === "file"
                          ? choice.url
                          : ""
                    }
                    fallback={
                      sound?.fallback ? `/sounds/${sound.fallback}` : undefined
                    }
                    label={side === "a" ? c.aLabel : c.bLabel}
                    audioRef={side === "a" ? aRef : bRef}
                    onPlaybackChange={(playing) =>
                      setActive((current) =>
                        playing ? side : current === side ? null : current,
                      )
                    }
                  />
                )}
                {sound && (
                  <details className={styles.credits}>
                    <summary>{c.rights}</summary>
                    <p>
                      {sound.author} ·{" "}
                      <a
                        href={sound.licenseUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {sound.license}
                      </a>
                    </p>
                    <a
                      href={soundSource(sound)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {c.original} ↗
                    </a>
                  </details>
                )}
                <div className={styles.slotActions}>
                  <button type="button" onClick={() => browse(side)}>
                    <Search size={15} aria-hidden="true" />
                    {c.choose}
                  </button>
                  <label>
                    <Upload size={15} aria-hidden="true" />
                    {c.upload}
                    <input
                      type="file"
                      className="sr-only"
                      accept={AUDIO_ACCEPT}
                      aria-label={
                        side === "a"
                          ? t("stockRecording")
                          : t("modifiedRecording")
                      }
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) receive(side, file);
                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>
                {choice.kind === "file" && (
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => replace(side, { kind: "empty" })}
                  >
                    <X size={14} aria-hidden="true" />
                    {c.clearFile}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className={styles.transport}>
          <div className={styles.quickSwitch}>
            <button
              type="button"
              aria-pressed={active === "a"}
              disabled={choices.a.kind === "empty"}
              onClick={() => void listen("a")}
            >
              {c.switchA}
            </button>
            <button
              type="button"
              aria-pressed={active === "b"}
              disabled={choices.b.kind === "empty"}
              onClick={() => void listen("b")}
            >
              {c.switchB}
            </button>
            <button
              type="button"
              aria-label={c.stop}
              onClick={() => {
                pauseOtherStudioAudio();
                setActive(null);
              }}
            >
              <Pause size={18} aria-hidden="true" />
            </button>
          </div>
          <label className={styles.offset}>
            {c.sameMoment}
            <input
              type="number"
              min="0"
              max="120"
              step="1"
              value={offset}
              onChange={(event) =>
                setOffset(
                  Math.max(0, Math.min(120, Number(event.target.value) || 0)),
                )
              }
            />
            {c.seconds}
          </label>
          <button type="button" className={styles.textButton} onClick={reset}>
            {c.reset}
          </button>
        </div>
        <p className={styles.note}>
          {c.seekNote} {c.local}
        </p>
        <div className={styles.master}>
          <MasterVolume />
        </div>
        <p role="status" aria-live="polite" className={styles.status}>
          {message}
        </p>
        <p className={styles.note}>{c.notice}</p>
        <p className={styles.note}>{c.shareNote}</p>
      </section>

      <section
        id="listen"
        ref={libraryRef}
        aria-labelledby="sound-collection-heading"
        className={styles.directory}
      >
        <div className={styles.directoryHeader}>
          <div>
            <p className={styles.eyebrow}>02 / DISCOVER</p>
            <h2 id="sound-collection-heading">{c.library}</h2>
            <p>{c.libraryIntro}</p>
          </div>
          <span className={styles.count}>
            {soundCatalog.length} {c.results}
          </span>
        </div>
        <div className={styles.filters}>
          <label className={styles.search}>
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              maxLength={100}
              aria-label={c.search}
              placeholder={c.search}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </label>
          <label>
            {c.make}
            <select
              value={make}
              onChange={(event) => {
                setMake(event.target.value);
                setPage(1);
              }}
            >
              <option value="">{c.allMakes}</option>
              {brands.map((brand) => (
                <option key={brand}>{brand}</option>
              ))}
            </select>
          </label>
          <label>
            {c.type}
            <select
              value={collection}
              onChange={(event) => {
                setCollection(event.target.value);
                setPage(1);
              }}
            >
              <option value="">{c.allTypes}</option>
              <option value="road">{c.road}</option>
              <option value="motorsport">{c.motorsport}</option>
            </select>
          </label>
          <label>
            {c.cylinders}
            <select
              value={cylinders}
              onChange={(event) => {
                setCylinders(Number(event.target.value));
                setPage(1);
              }}
            >
              <option value="0">{c.allEngines}</option>
              <option value="-1">{c.unknown}</option>
              {[2, 3, 4, 5, 6, 8, 10, 12, 16].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.resultsBar}>
          <p>
            {matching.length} {c.results} · {c.noAutoplay}
          </p>
          <button type="button" onClick={clearFilters}>
            {c.clear}
          </button>
        </div>
        <div className={styles.browser}>
          <aside
            ref={previewRef}
            className={styles.preview}
            aria-label={c.preview}
          >
            <div className={styles.previewIcon}>
              <Headphones size={28} strokeWidth={1.3} aria-hidden="true" />
              <span>{selected.make}</span>
            </div>
            <p className={styles.eyebrow}>{c.preview}</p>
            <h3 tabIndex={-1}>{title(selected)}</h3>
            <p>
              {selected.category === "motorsport" ? c.motorsport : c.road} ·{" "}
              {selected.duration}
            </p>
            <StudioAudio
              src={`/sounds/${selected.audio}`}
              fallback={
                selected.fallback ? `/sounds/${selected.fallback}` : undefined
              }
              label={title(selected)}
            />
            <div className={styles.assignButtons}>
              <button
                type="button"
                onClick={() =>
                  replace("a", { kind: "library", id: selected.id })
                }
              >
                {c.addA}
              </button>
              <button
                type="button"
                onClick={() =>
                  replace("b", { kind: "library", id: selected.id })
                }
              >
                {c.addB}
              </button>
            </div>
            <a href="#compare" className={styles.backLink}>
              <ArrowUp size={15} aria-hidden="true" />
              {c.backTo}
            </a>
            <details className={styles.credits}>
              <summary>{c.rights}</summary>
              <p>
                {selected.author} ·{" "}
                <a href={selected.licenseUrl} target="_blank" rel="noreferrer">
                  {selected.license}
                </a>
              </p>
              <p>{c.unmodified}</p>
              <a href={soundSource(selected)} target="_blank" rel="noreferrer">
                {c.original} ↗
              </a>
            </details>
          </aside>
          <div className={styles.results}>
            <div className={styles.target}>
              <span>{c.added}</span>
              {(["a", "b"] as const).map((side) => (
                <button
                  type="button"
                  key={side}
                  aria-pressed={target === side}
                  onClick={() => setTarget(side)}
                >
                  {side.toUpperCase()}
                </button>
              ))}
            </div>
            {visible.length ? (
              <ul className={styles.soundList}>
                {visible.map((sound) => (
                  <li key={sound.id} data-selected={selected.id === sound.id}>
                    <button
                      type="button"
                      className={styles.soundRow}
                      aria-pressed={selected.id === sound.id}
                      onClick={() => {
                        pauseOtherStudioAudio();
                        setActive(null);
                        setSelectedId(sound.id);
                        if (window.matchMedia?.("(max-width: 760px)").matches) {
                          previewRef.current?.scrollIntoView({
                            behavior: "auto",
                            block: "start",
                          });
                          previewRef.current
                            ?.querySelector("h3")
                            ?.focus({ preventScroll: true });
                        }
                      }}
                    >
                      <span className={styles.rowMark} aria-hidden="true">
                        {sound.make.slice(0, 2).toUpperCase()}
                      </span>
                      <span>
                        <strong>{title(sound)}</strong>
                        <small>
                          {sound.category === "motorsport"
                            ? c.motorsport
                            : c.road}
                          {sound.cylinders ? ` · ${sound.cylinders} cyl` : ""} ·{" "}
                          {sound.duration}
                        </small>
                      </span>
                    </button>
                    <button
                      type="button"
                      className={styles.addButton}
                      aria-label={`${target === "a" ? c.addA : c.addB}: ${title(sound)}`}
                      onClick={() =>
                        replace(target, { kind: "library", id: sound.id })
                      }
                    >
                      {choices[target].kind === "library" &&
                      choices[target].id === sound.id ? (
                        <Check size={16} aria-hidden="true" />
                      ) : (
                        `+ ${target.toUpperCase()}`
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>{c.noResults}</p>
            )}
            <nav aria-label="Recording pages" className={styles.pagination}>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                {c.previous}
              </button>
              <span>
                {c.page} {currentPage} {c.of} {pages}
              </span>
              <button
                type="button"
                disabled={currentPage === pages}
                onClick={() => setPage(currentPage + 1)}
              >
                {c.next}
              </button>
            </nav>
          </div>
        </div>
        <a className={styles.mobileBack} href="#compare">
          <ArrowUp size={16} aria-hidden="true" />
          {c.backTo}
        </a>
      </section>
    </div>
  );
}
