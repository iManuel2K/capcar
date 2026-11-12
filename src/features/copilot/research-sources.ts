type Item = Record<string, unknown>;
const object = (value: unknown): Item =>
  value && typeof value === "object" ? (value as Item) : {};
const array = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];
/** Accept citation metadata, never links invented in the answer text. */
export function researchSources(provider: string, raw: unknown) {
  const data = object(raw);
  const candidates: Item[] =
    provider === "openai"
      ? array(data.output)
          .flatMap((item) => array(object(item).content))
          .flatMap((item) => array(object(item).annotations))
          .map(object)
          .filter((item) => item.type === "url_citation")
      : provider === "anthropic"
        ? array(data.content)
            .flatMap((item) => array(object(item).citations))
            .map(object)
            .filter((item) => item.type === "web_search_result_location")
        : array(
            object(object(array(data.candidates)[0]).groundingMetadata)
              .groundingChunks,
          )
            .map((item) => object(object(item).web))
            .map((item) => ({ title: item.title, url: item.uri }));
  const sources: { title: string; url: string }[] = [];
  for (const item of candidates) {
    if (typeof item.url !== "string") continue;
    try {
      const url = new URL(item.url);
      if (
        url.protocol !== "https:" ||
        url.username ||
        url.password ||
        sources.some((source) => source.url === url.href)
      )
        continue;
      sources.push({
        url: url.href,
        title: (typeof item.title === "string"
          ? item.title
          : url.hostname
        ).slice(0, 500),
      });
      if (sources.length === 12) break;
    } catch {
      /* Ignore invalid provider metadata. */
    }
  }
  const html = object(
    object(object(array(data.candidates)[0]).groundingMetadata)
      .searchEntryPoint,
  ).renderedContent;
  return {
    sources,
    searchSuggestions:
      provider === "gemini" &&
      typeof html === "string" &&
      html.length <= 100_000
        ? html
        : undefined,
  };
}
