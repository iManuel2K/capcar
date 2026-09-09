"use client";

import { useState } from "react";

const sounds = [
  {
    id: "honda-f20c",
    title: "Honda F20C · Engine-bay recording",
    author: "Tyler Riddle",
    file: "2002-Honda-F20C.ogg",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    detail: "2002 engine, recorded in the engine bay. 2 min 17 s.",
  },
  {
    id: "volvo-850-t5",
    title: "Volvo 850 T5 · Five-cylinder turbo",
    author: "Jonas Tittmann",
    file: "5_cylinder_engine_sound.ogg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    detail: "Five-cylinder inline turbo engine recording. 33 s.",
  },
];

export function CuratedSounds() {
  const [errors, setErrors] = useState<string[]>([]);
  return (
    <section
      aria-label="Included engine recordings"
      className="mb-10 rounded-3xl bg-[#0e2d30] p-5 text-[#e8e6d7] sm:p-8"
    >
      <p className="text-xs tracking-widest uppercase">
        Capcar listening collection / 01—02
      </p>
      <h2 className="mt-3 text-3xl">Real engines. Ready to play.</h2>
      <p className="mt-3 text-sm leading-6">
        Start at a low volume. Recording equipment and conditions differ; these
        are not controlled stock-versus-modified comparisons. Modification
        status is not verified.
      </p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {sounds.map((sound) => (
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
                Audio could not load. Reload the page or use the source below.
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
                Source and credits
              </a>
              . Original Ogg unchanged; MP3 converted by Capcar under the same
              license. No endorsement implied.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
