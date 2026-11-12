import type { CopilotResponse } from "@/features/copilot/copilot-schema";
import type { AppLocale } from "@/i18n/config";
export const researchCopy = {
  en: {
    option: "Research web sources (provider search charges may apply)",
    sources: "Sources returned by your provider",
    suggestions: "Google Search suggestions",
  },
  de: {
    option: "Webquellen recherchieren (Suchkosten beim Anbieter möglich)",
    sources: "Vom Anbieter gelieferte Quellen",
    suggestions: "Google-Suchvorschläge",
  },
  el: {
    option: "Έρευνα πηγών στο διαδίκτυο (πιθανές χρεώσεις αναζήτησης)",
    sources: "Πηγές που επέστρεψε ο πάροχος",
    suggestions: "Προτάσεις Αναζήτησης Google",
  },
  sq: {
    option: "Kërko burime në internet (mund të ketë tarifa kërkimi)",
    sources: "Burime të kthyera nga ofruesi",
    suggestions: "Sugjerime nga Google Search",
  },
  ja: {
    option: "ウェブの出典を調査する（検索料金が発生する場合があります）",
    sources: "プロバイダーが返した出典",
    suggestions: "Google検索の候補",
  },
};
export function CopilotResearchSources({
  response,
  locale,
}: {
  response: CopilotResponse;
  locale: AppLocale;
}) {
  const c = researchCopy[locale];
  return (
    <>
      {Boolean(response.sources?.length) && (
        <div className="mt-4">
          <p className="text-muted-foreground text-sm">{c.sources}</p>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            {response.sources?.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary inline-block min-h-11 py-2 break-words underline underline-offset-4"
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
      {response.searchSuggestions && (
        <iframe
          title={c.suggestions}
          sandbox="allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer"
          srcDoc={response.searchSuggestions}
          className="mt-4 h-48 w-full rounded-xl border border-white/15 bg-white"
        />
      )}
    </>
  );
}
