"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const recoveryCopy = {
  en: {
    title: "Capcar recovery",
    eyebrow: "Drive interrupted",
    heading: "Capcar could not finish that action.",
    message:
      "Try again first. Your browser-local records have not been intentionally deleted.",
    retry: "Try again",
    home: "Return home",
  },
  de: {
    title: "Capcar-Wiederherstellung",
    eyebrow: "Fahrt unterbrochen",
    heading: "Capcar konnte diese Aktion nicht abschließen.",
    message:
      "Versuche es zuerst erneut. Deine browserlokalen Daten wurden nicht absichtlich gelöscht.",
    retry: "Erneut versuchen",
    home: "Zur Startseite",
  },
  el: {
    title: "Ανάκτηση Capcar",
    eyebrow: "Η διαδρομή διακόπηκε",
    heading: "Το Capcar δεν μπόρεσε να ολοκληρώσει αυτή την ενέργεια.",
    message:
      "Δοκιμάστε ξανά πρώτα. Οι τοπικές εγγραφές του browser δεν διαγράφηκαν σκόπιμα.",
    retry: "Δοκιμή ξανά",
    home: "Επιστροφή στην αρχική",
  },
  sq: {
    title: "Rikuperimi i Capcar",
    eyebrow: "Udhëtimi u ndërpre",
    heading: "Capcar nuk mundi ta përfundonte këtë veprim.",
    message:
      "Provo përsëri fillimisht. Të dhënat lokale të shfletuesit nuk janë fshirë qëllimisht.",
    retry: "Provo përsëri",
    home: "Kthehu në krye",
  },
  ja: {
    title: "Capcar リカバリー",
    eyebrow: "操作が中断されました",
    heading: "Capcar はこの操作を完了できませんでした。",
    message:
      "まず再試行してください。ブラウザ内のローカル記録が意図的に削除されたわけではありません。",
    retry: "再試行",
    home: "ホームへ戻る",
  },
} as const;

type RecoveryLocale = keyof typeof recoveryCopy;

function readLocale(): RecoveryLocale {
  const selected = document.cookie
    .split(";")
    .map((value) => value.trim().split("="))
    .find(([key]) => key === "capcar_locale")?.[1];
  return selected && selected in recoveryCopy
    ? (selected as RecoveryLocale)
    : "en";
}

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useSyncExternalStore<RecoveryLocale>(
    () => () => undefined,
    readLocale,
    () => "en" as RecoveryLocale,
  );
  const copy = recoveryCopy[locale];
  return (
    <html lang={locale}>
      <body>
        <title>{copy.title}</title>
        <style>{`
          * { box-sizing: border-box; }
          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 3rem 1.25rem;
            background: #e8e6d7;
            color: #0e2d30;
            font-family: Arial, Helvetica, sans-serif;
            text-align: center;
          }
          main {
            width: 100%;
            max-width: 42rem;
            padding: clamp(1.75rem, 5vw, 3rem);
            border: 1px solid rgba(14, 45, 48, 0.1);
            border-radius: 2rem;
            background: rgba(255, 255, 255, 0.28);
          }
          .eyebrow {
            margin: 0;
            color: #9d5f4c;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.16em;
            text-transform: uppercase;
          }
          h1 {
            margin: 1rem 0 0;
            font-size: clamp(2.25rem, 8vw, 3.75rem);
            font-weight: 500;
            letter-spacing: -0.05em;
            line-height: 1;
          }
          .message {
            max-width: 32rem;
            margin: 1.25rem auto 0;
            color: rgba(14, 45, 48, 0.65);
            line-height: 1.75;
          }
          .actions {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 0.75rem;
            margin-top: 2rem;
          }
          button, a {
            min-height: 3rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.75rem 1.5rem;
            border-radius: 999px;
            font: inherit;
            font-size: 0.875rem;
            font-weight: 700;
            text-decoration: none;
            cursor: pointer;
          }
          button { border: 0; background: #6d0101; color: white; }
          a { border: 1px solid rgba(14, 45, 48, 0.18); color: #0e2d30; }
          button:focus-visible, a:focus-visible {
            outline: 3px solid #bf8269;
            outline-offset: 3px;
          }
          @media (max-width: 32rem) {
            .actions { flex-direction: column; }
          }
        `}</style>
        <main role="alert">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.heading}</h1>
          <p className="message">{copy.message}</p>
          <div className="actions">
            <button type="button" onClick={reset}>
              {copy.retry}
            </button>
            <Link href="/">{copy.home}</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
