import Link from "@/components/i18n/public-link";
import type { ReactNode } from "react";

// Editorial text only: React escapes content; no HTML or executable Markdown.
function inline(text: string): ReactNode[] {
  return text
    .split(
      /(\*\*[^*]+\*\*|\[[^\]]+\]\((?:https:\/\/[^\s)]+|\/(?!\/)[a-zA-Z0-9/?=&%#._-]*)\))/g,
    )
    .map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-foreground font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      const link = part.match(
        /^\[([^\]]+)\]\(((?:https:\/\/[^\s)]+|\/(?!\/)[a-zA-Z0-9/?=&%#._-]*))\)$/,
      );
      if (link?.[2].startsWith("/"))
        return (
          <Link
            key={i}
            href={link[2]}
            className="decoration-primary/60 hover:text-primary underline underline-offset-4"
          >
            {link[1]}
          </Link>
        );
      return link ? (
        <a
          key={i}
          href={link[2]}
          className="decoration-primary/60 hover:text-primary underline underline-offset-4"
        >
          {link[1]}
        </a>
      ) : (
        part
      );
    });
}

export function JournalContent({ text }: { text: string }) {
  return (
    <div className="text-foreground/80 space-y-6 text-base leading-8 sm:text-lg">
      {text.split(/\n\s*\n/).map((block, index) => {
        if (block.startsWith("## "))
          return (
            <h2
              key={index}
              id={`section-${index}`}
              className="text-foreground scroll-mt-28 pt-6 text-2xl font-medium tracking-tight sm:text-3xl"
            >
              {block.slice(3)}
            </h2>
          );
        if (block.startsWith("|")) {
          const rows = block
            .split("\n")
            .filter((row) => row.startsWith("|") && !/^\|[\s:|-]+\|$/.test(row))
            .map((row) =>
              row
                .split("|")
                .slice(1, -1)
                .map((cell) => cell.trim()),
            );
          return (
            <div
              key={index}
              className="border-foreground/15 overflow-x-auto rounded-2xl border"
            >
              <table className="w-full min-w-[460px] text-left text-sm">
                <thead className="bg-card/5">
                  <tr>
                    {rows[0].map((cell, i) => (
                      <th
                        key={i}
                        scope="col"
                        className="px-5 py-3 font-semibold"
                      >
                        {inline(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(1).map((row, i) => (
                    <tr key={i} className="border-foreground/10 border-t">
                      {row.map((cell, j) => (
                        <td key={j} className="h-14 px-5 py-3">
                          {inline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return <p key={index}>{inline(block)}</p>;
      })}
    </div>
  );
}
