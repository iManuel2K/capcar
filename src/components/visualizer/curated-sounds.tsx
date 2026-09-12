"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const sounds = [
  {
    id: "honda-f20c",
    titleKey: "hondaTitle",
    author: "Tyler Riddle",
    file: "2002-Honda-F20C.ogg",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    detailKey: "hondaDetail",
  },
  {
    id: "volvo-850-t5",
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
  const tracks = useTranslations("SoundTracks");
  const [errors, setErrors] = useState<string[]>([]);
  return (
    <section
      aria-label={t("includedLabel")}
      className="mb-10 rounded-3xl bg-[#0e2d30] p-5 text-[#e8e6d7] sm:p-8"
    >
      <p className="text-xs tracking-widest uppercase">{t("collection")}</p>
      <h2 className="mt-3 text-3xl">{t("realEngines")}</h2>
      <p className="mt-3 text-sm leading-6">{t("curatedNotice")}</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {sounds.map((sound) => (
          <article
            key={sound.id}
            className="min-w-0 rounded-2xl border border-white/20 p-5"
          >
            <h3 className="text-xl">{tracks(sound.titleKey)}</h3>
            <p className="my-3 text-sm">{tracks(sound.detailKey)}</p>
            <audio
              aria-label={tracks(sound.titleKey)}
              controls
              preload="none"
              className="w-full"
              onError={() =>
                setErrors((items) =>
                  items.includes(sound.id) ? items : [...items, sound.id],
                )
              }
            >
              <source src={`/sounds/${sound.id}.mp3`} type="audio/mpeg" />
              <source src={`/sounds/${sound.id}.ogg`} type="audio/ogg" />
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
              . {t("converted")}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
