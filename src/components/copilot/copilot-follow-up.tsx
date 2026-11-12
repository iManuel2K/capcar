"use client";
import type { CopilotResponse } from "@/features/copilot/copilot-schema";
import type { AppLocale } from "@/i18n/config";
const unknown = {
  en: "I don’t know — help me decide",
  de: "Ich weiß es nicht – hilf mir",
  el: "Δεν ξέρω — βοήθησέ με",
  sq: "Nuk e di — më ndihmo",
  ja: "分からないので相談したい",
};
export function CopilotFollowUp({
  followUp,
  locale,
  busy,
  onReply,
}: {
  followUp: CopilotResponse["followUp"];
  locale: AppLocale;
  busy: boolean;
  onReply: (answer: string) => void;
}) {
  if (!followUp) return null;
  const choices = [...new Set([...followUp.choices, unknown[locale]])];
  return (
    <div className="border-primary/30 bg-primary/5 mt-4 rounded-2xl border p-4">
      <p className="font-medium">{followUp.question}</p>
      <p className="text-muted-foreground mt-2 text-sm leading-6">
        {followUp.reason}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {choices.map((choice) => (
          <button
            type="button"
            key={choice}
            disabled={busy}
            onClick={() => onReply(choice)}
            className="text-primary focus-visible:outline-primary border-primary/30 min-h-11 rounded-xl border px-4 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}
