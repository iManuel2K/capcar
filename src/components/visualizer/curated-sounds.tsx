"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { licensedSounds } from "@/features/visualizer/licensed-sounds";

const sounds = [
  {
    id: "honda-f20c",
    cylinders: 4,
    titleKey: "hondaTitle",
    author: "Tyler Riddle",
    file: "2002-Honda-F20C.ogg",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    detailKey: "hondaDetail",
  },
  {
    id: "volvo-850-t5",
    cylinders: 5,
    titleKey: "volvoTitle",
    author: "Jonas Tittmann",
    file: "5_cylinder_engine_sound.ogg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    detailKey: "volvoDetail",
  },
];

export function CuratedSounds() {
  const t = useTranslations("SoundUi");
  const expansion = useTranslations("Expansion");
  const playing = useRef<HTMLAudioElement | null>(null);
  const [filter, setFilter] = useState("");
  const [comparison, setComparison] = useState(["honda-f20c", "volvo-850-t5"]);
  const tracks = useTranslations("SoundTracks");
  const [errors, setErrors] = useState<string[]>([]);
  const catalog = [
    ...sounds.map((sound) => ({
      ...sound,
      title: tracks(sound.titleKey),
      detail: tracks(sound.detailKey),
      src: `/sounds/${sound.id}.mp3`,
      fallback: `/sounds/${sound.id}.ogg`,
      local: true,
    })),
    ...licensedSounds.map((sound) => ({
      ...sound,
      title: sound.title,
      detail: expansion("soundSetup"),
      src: `/api/sounds/${sound.id}`,
      fallback: "",
      local: false,
    })),
  ];
  const matching = catalog.filter((sound) =>
    `${sound.title} ${sound.cylinders}`
      .toLowerCase()
      .includes(filter.toLowerCase()),
  );
  const pauseOther = (audio: HTMLAudioElement) => {
    if (playing.current && playing.current !== audio) playing.current.pause();
    playing.current = audio;
  };
  return (
    <section
      aria-label={t("includedLabel")}
      className="mb-10 rounded-3xl bg-[#0e2d30] p-5 text-[#e8e6d7] sm:p-8"
    >
      <p className="text-xs tracking-widest uppercase">{t("collection")}</p>
      <h2 className="mt-3 text-3xl">{t("realEngines")}</h2>
      <p className="mt-3 text-sm leading-6">{t("curatedNotice")}</p>
      <label className="mt-6 block text-sm">
        {expansion("soundFilter")}
        <input
          type="search"
          maxLength={100}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="mt-2 min-h-11 w-full rounded-xl border border-white/30 bg-[#152421] px-4 text-white"
        />
      </label>
      <details className="mt-5 rounded-2xl border border-white/20 p-4">
        <summary className="min-h-11 cursor-pointer py-2">
          {expansion("soundCompare")}
        </summary>
        <p className="my-3 text-sm leading-6">{expansion("soundNote")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {comparison.map((id, index) => {
            const sound = catalog.find((item) => item.id === id)!;
            return (
              <div key={index}>
                <label className="block text-sm">
                  {expansion("recording")} {index === 0 ? "A" : "B"}
                  <select
                    className="my-3 min-h-11 w-full rounded-xl border border-white/30 bg-[#152421] p-2"
                    value={id}
                    onChange={(event) => {
                      playing.current?.pause();
                      setComparison((previous) =>
                        previous.map((value, i) =>
                          i === index ? event.target.value : value,
                        ),
                      );
                    }}
                  >
                    {catalog.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>
                <audio
                  key={id}
                  aria-label={`${index === 0 ? "A" : "B"}: ${sound.title}`}
                  controls
                  preload="none"
                  className="w-full"
                  onPlay={(event) => pauseOther(event.currentTarget)}
                  onError={() =>
                    setErrors((previous) =>
                      previous.includes(id) ? previous : [...previous, id],
                    )
                  }
                >
                  <source
                    src={sound.src}
                    type={sound.local ? "audio/mpeg" : "audio/ogg"}
                  />
                  {sound.fallback && (
                    <source src={sound.fallback} type="audio/ogg" />
                  )}
                </audio>
                {errors.includes(id) && (
                  <p role="alert" className="mt-2 text-sm">
                    {t("audioError")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </details>
      {!matching.length && (
        <p role="status" className="mt-4">
          {expansion("noSounds")}
        </p>
      )}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {matching.map((sound) => (
          <article
            key={sound.id}
            className="min-w-0 rounded-2xl border border-white/20 p-5"
          >
            <h3 className="text-xl">{sound.title}</h3>
            <p className="my-3 text-sm">{sound.detail}</p>
            <audio
              aria-label={sound.title}
              controls
              preload="none"
              className="w-full"
              onPlay={(event) => pauseOther(event.currentTarget)}
              onError={() =>
                setErrors((items) =>
                  items.includes(sound.id) ? items : [...items, sound.id],
                )
              }
            >
              <source
                src={sound.src}
                type={sound.local ? "audio/mpeg" : "audio/ogg"}
              />
              {sound.fallback && (
                <source src={sound.fallback} type="audio/ogg" />
              )}
            </audio>
            {errors.includes(sound.id) && (
              <p role="alert" className="mt-3">
                {t("audioError")}
              </p>
            )}
            <p className="mt-4 text-xs leading-6">
              {sound.author}
              {" · "}
              <a className="underline" href={sound.licenseUrl}>
                {sound.license}
              </a>
              {" · "}
              <a
                className="underline"
                href={`https://commons.wikimedia.org/wiki/File:${sound.file}`}
              >
                {t("credits")}
              </a>
              . {sound.local ? t("converted") : expansion("sourceRecording")}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
