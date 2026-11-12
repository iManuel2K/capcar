import { describe, expect, it } from "vitest";
import { researchSources } from "./research-sources";
describe("research source metadata", () => {
  it("extracts and deduplicates OpenAI citations without trusting URLs in answer text", () => {
    const result = researchSources("openai", {
      output: [
        {
          content: [
            {
              text: "https://invented.test",
              annotations: [
                {
                  type: "url_citation",
                  title: "BMW",
                  url: "https://bmw.com/spec",
                },
                { type: "url_citation", url: "https://bmw.com/spec" },
                { type: "url_citation", url: "javascript:alert(1)" },
                {
                  type: "url_citation",
                  url: "https://user:secret@example.com",
                },
              ],
            },
          ],
        },
      ],
    });
    expect(result.sources).toEqual([
      { title: "BMW", url: "https://bmw.com/spec" },
    ]);
  });
  it("extracts Claude citations and Gemini grounding with its required suggestion widget", () => {
    expect(
      researchSources("anthropic", {
        content: [
          {
            citations: [
              {
                type: "web_search_result_location",
                url: "https://example.com/evidence",
                title: "Evidence",
              },
            ],
          },
        ],
      }).sources,
    ).toHaveLength(1);
    const result = researchSources("gemini", {
      candidates: [
        {
          groundingMetadata: {
            groundingChunks: [
              {
                web: {
                  uri: "https://example.com/measurement",
                  title: "Measurement",
                },
              },
            ],
            searchEntryPoint: {
              renderedContent: "<div>Search suggestions</div>",
            },
          },
        },
      ],
    });
    expect(result.sources[0].title).toBe("Measurement");
    expect(result.searchSuggestions).toBe("<div>Search suggestions</div>");
  });
  it("does not fabricate citations from a plain model answer", () => {
    expect(
      researchSources("gemini", {
        candidates: [
          { content: { parts: [{ text: "Source: https://invented.test" }] } },
        ],
      }).sources,
    ).toEqual([]);
  });
});
