"use client";

import { useState } from "react";
import { Headphones, Music2, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { soundCatalog } from "@/features/visualizer/sound-catalog";
import { pauseOtherStudioAudio } from "@/features/visualizer/audio-files";
import { MasterVolume, StudioAudio } from "./studio-audio";

export function CuratedSounds() {
  const t = useTranslations("SoundUi");
  const s = useTranslations("StudioPolish");
  const expansion = useTranslations("Expansion");
  const tracks = useTranslations("SoundTracks");
  const [filter, setFilter] = useState("");
  const [cylinders, setCylinders] = useState(0);
  const [selectedId, setSelectedId] = useState("honda-f20c");
  const [comparison, setComparison] = useState(["honda-f20c", "volvo-850-t5"]);
  const catalog = soundCatalog.map((sound) => ({
    ...sound,
    title: sound.titleKey ? tracks(sound.titleKey) : sound.title,
    detail: sound.detailKey ? tracks(sound.detailKey) : expansion("soundSetup"),
  }));
  const matching = catalog.filter(
    (sound) =>
      (!cylinders || sound.cylinders === cylinders) &&
      `${sound.title} ${sound.cylinders} ${sound.author}`
        .toLowerCase()
        .includes(filter.trim().toLowerCase()),
  );
  const selected =
    matching.find((sound) => sound.id === selectedId) ?? matching[0];

  return (
    <section
      id="listen"
      aria-labelledby="sound-collection-heading"
      className="scroll-mt-28 overflow-hidden rounded-[2rem] border border-[#0e2d30]/15 bg-[#0e2d30] text-[#e8e6d7] shadow-[0_24px_70px_rgba(14,45,48,.10)]"
    >
      <div className="border-b border-white/10 p-5 sm:p-8">
        <p className="text-xs font-medium tracking-[.18em] text-[#cfaa96] uppercase">
          01 / {s("listen")}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <h2
            id="sound-collection-heading"
            className="text-3xl font-medium tracking-tight sm:text-4xl"
          >
            {t("realEngines")}
          </h2>
          <span className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-[#e8e6d7]/70">
            {s("recordingsCount", { count: catalog.length })}
          </span>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-[#e8e6d7]/70">
          {t("curatedNotice")}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">{expansion("soundFilter")}</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-3.5 left-4 size-4 text-[#e8e6d7]/50"
            />
            <input
              type="search"
              maxLength={100}
              value={filter}
              onChange={(event) => {
                pauseOtherStudioAudio();
                setFilter(event.target.value);
              }}
              placeholder={s("searchHint")}
              className="min-h-11 w-full rounded-xl border border-white/15 bg-[#0b2326] pr-4 pl-11 text-sm outline-offset-4 placeholder:text-[#e8e6d7]/50"
            />
          </label>
          <div className="flex flex-wrap gap-2" aria-label={s("engineFilter")}>
            {[0, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((count) => (
              <button
                type="button"
                key={count}
                aria-pressed={cylinders === count}
                onClick={() => {
                  pauseOtherStudioAudio();
                  setCylinders(count);
                }}
                className={`min-h-11 rounded-xl border px-4 text-sm transition motion-reduce:transition-none ${cylinders === count ? "border-[#e8e6d7] bg-[#e8e6d7] text-[#0e2d30]" : "border-white/15 hover:bg-white/5"}`}
              >
                {count ? s("cylinders", { count }) : s("allEngines")}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="border-b border-white/10 p-4 sm:p-6">
        <MasterVolume />
      </div>
      {selected ? (
        <div className="grid lg:grid-cols-[.9fr_1.1fr]">
          <div
            className="max-h-[42rem] space-y-2 overflow-y-auto border-b border-white/10 p-4 sm:p-6 lg:border-r lg:border-b-0"
            aria-label={t("includedLabel")}
          >
            {matching.map((sound, index) => (
              <button
                key={sound.id}
                type="button"
                aria-pressed={selected.id === sound.id}
                onClick={() => {
                  pauseOtherStudioAudio();
                  setSelectedId(sound.id);
                }}
                className={`flex min-h-20 w-full items-center gap-4 rounded-2xl border p-4 text-left transition motion-reduce:transition-none ${selected.id === sound.id ? "border-[#cfaa96]/35 bg-[#1c4143]" : "border-transparent hover:border-white/10 hover:bg-white/5"}`}
              >
                <span
                  aria-hidden="true"
                  className={`grid size-10 shrink-0 place-items-center rounded-full ${selected.id === sound.id ? "bg-[#cfaa96] text-[#0e2d30]" : "bg-white/5 text-[#e8e6d7]/50"}`}
                >
                  {selected.id === sound.id ? (
                    <Headphones className="size-4" />
                  ) : (
                    String(index + 1).padStart(2, "0")
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">
                    {sound.title}
                  </span>
                  <span className="mt-1 block text-xs text-[#e8e6d7]/60">
                    {s("cylinders", { count: sound.cylinders })} ·{" "}
                    {sound.duration}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <article className="flex min-w-0 flex-col justify-center p-5 sm:p-8 lg:sticky lg:top-24 lg:self-start">
            <div
              aria-hidden="true"
              className="mb-6 flex h-28 items-center justify-center rounded-2xl border border-white/8 bg-[#0b2326]"
            >
              <Music2 className="size-12 stroke-1 text-[#cfaa96]" />
            </div>
            <p className="text-xs tracking-widest text-[#cfaa96] uppercase">
              {s("selectedRecording")}
            </p>
            <h3 className="mt-3 text-2xl font-medium tracking-tight">
              {selected.title}
            </h3>
            <p className="mt-3 mb-5 text-sm leading-6 text-[#e8e6d7]/65">
              {selected.detail}
            </p>
            <StudioAudio
              src={`/sounds/${selected.audio}`}
              fallback={
                selected.fallback ? `/sounds/${selected.fallback}` : undefined
              }
              label={selected.title}
            />
            <p className="mt-3 text-xs text-[#e8e6d7]/65">{s("lowVolume")}</p>
            <details className="mt-5 border-t border-white/10 pt-2 text-xs leading-6 text-[#e8e6d7]/70">
              <summary className="min-h-11 cursor-pointer py-3 text-sm">
                {t("credits")}
              </summary>
              <p>
                {selected.author} ·{" "}
                <a
                  className="underline"
                  href={selected.licenseUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {selected.license}
                </a>
              </p>
              <p>{t("converted")}</p>
              <a
                className="inline-flex min-h-11 items-center underline"
                target="_blank"
                rel="noreferrer"
                href={`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(selected.file)}`}
              >
                {s("openSource")} ↗
              </a>
            </details>
          </article>
        </div>
      ) : (
        <div className="p-8 text-center">
          <p role="status">{expansion("noSounds")}</p>
          <button
            type="button"
            onClick={() => {
              setFilter("");
              setCylinders(0);
            }}
            className="mt-3 min-h-11 underline"
          >
            {s("clearFilter")}
          </button>
        </div>
      )}
      <details
        className="border-t border-white/10 p-5 sm:px-8"
        onToggle={(event) => {
          if (!event.currentTarget.open) {
            event.currentTarget
              .querySelectorAll<HTMLAudioElement>("audio[data-capcar-audio]")
              .forEach((audio) => audio.pause());
          }
        }}
      >
        <summary className="min-h-11 cursor-pointer py-3 font-medium">
          {expansion("soundCompare")}
        </summary>
        <p className="my-3 max-w-3xl text-sm leading-6 text-[#e8e6d7]/70">
          {expansion("soundNote")}
        </p>
        <div className="grid gap-5 pb-4 sm:grid-cols-2">
          {comparison.map((id, index) => {
            const sound = catalog.find((item) => item.id === id)!;
            return (
              <div
                key={index}
                className="min-w-0 rounded-2xl border border-white/10 bg-[#0b2326] p-4"
              >
                <label className="block text-sm">
                  {expansion("recording")} {index === 0 ? "A" : "B"}
                  <select
                    className="my-3 min-h-11 w-full rounded-xl border border-white/20 bg-[#0e2d30] px-3"
                    value={id}
                    onChange={(event) => {
                      pauseOtherStudioAudio();
                      setComparison((previous) =>
                        previous.map((value, i) =>
                          i === index ? event.target.value : value,
                        ),
                      );
                    }}
                  >
                    {catalog
                      .filter(
                        (item) => item.id !== comparison[index === 0 ? 1 : 0],
                      )
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title}
                        </option>
                      ))}
                  </select>
                </label>
                <StudioAudio
                  src={`/sounds/${sound.audio}`}
                  fallback={
                    sound.fallback ? `/sounds/${sound.fallback}` : undefined
                  }
                  label={`${index === 0 ? "A" : "B"}: ${sound.title}`}
                />
                <p className="mt-3 text-xs leading-5 text-[#e8e6d7]/60">
                  {sound.author} ·{" "}
                  <a
                    href={sound.licenseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    {sound.license}
                  </a>
                </p>
              </div>
            );
          })}
        </div>
      </details>
    </section>
  );
}
