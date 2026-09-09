"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <title>Capcar recovery</title>
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
          <p className="eyebrow">Drive interrupted</p>
          <h1>Capcar could not finish that action.</h1>
          <p className="message">
            Try again first. Your browser-local records have not been
            intentionally deleted.
          </p>
          <div className="actions">
            <button type="button" onClick={reset}>
              Try again
            </button>
            <Link href="/">Return home</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
