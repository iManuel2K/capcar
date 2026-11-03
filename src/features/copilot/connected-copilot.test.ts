import { afterEach, describe, expect, it, vi } from "vitest";
import { askConnectedCopilot } from "./connected-copilot";
import type { AiConnectionRecord } from "@/features/connections/ai-connection";
vi.mock("@/features/connections/ai-connection", () => ({
  tripPlannerEnvironmentForConnection: () => ({
    OPENAI_API_KEY: "private-key",
    GEMINI_API_KEY: "private-key",
    ANTHROPIC_API_KEY: "private-key",
  }),
}));
const input = {
  message: "I did. Now what?",
  locale: "de" as const,
  history: [
    { question: "Chip only, no hardware", answer: "Review maintenance" },
  ],
  vehicle: {
    id: "private-vehicle",
    model: "318i",
    productionYear: 2011,
    platform: "E90",
    engineCode: "N43",
    mileage: 142000,
  },
  buildItems: [],
};
afterEach(() => vi.unstubAllGlobals());
describe("connected copilot", () => {
  it.each(["openai", "anthropic", "gemini"] as const)(
    "parses a structured follow-up from %s and passes previous clarifications",
    async (provider) => {
      const followUp = {
        question: "Where is it registered?",
        reason: "This changes the approval requirements.",
        choices: ["Germany", "Another country"],
      };
      const text = JSON.stringify({
        answer: "Software-only constraint understood.",
        followUp,
      });
      const body =
        provider === "openai"
          ? { output: [{ content: [{ type: "output_text", text }] }] }
          : provider === "anthropic"
            ? { content: [{ type: "text", text }] }
            : { candidates: [{ content: { parts: [{ text }] } }] };
      const fetch = vi
        .fn()
        .mockImplementation(async () => new Response(JSON.stringify(body)));
      vi.stubGlobal("fetch", fetch);
      const connection = { provider, model: "test" } as AiConnectionRecord;
      const reply = await askConnectedCopilot(
        {
          ...input,
          clarifications: [{ question: "Budget?", answer: "I do not know" }],
        },
        connection,
      );
      expect(reply.followUp).toEqual(followUp);
      expect(reply.answer).toBe("Software-only constraint understood.");
      expect(fetch.mock.calls[0][1].body).toContain("I do not know");
      const repeated = await askConnectedCopilot(
        {
          ...input,
          clarifications: [{ question: followUp.question, answer: "Germany" }],
        },
        connection,
      );
      expect(repeated.followUp).toBeUndefined();
    },
  );
  it.each(["openai", "gemini", "anthropic"] as const)(
    "enables provider-native research only when requested for %s",
    async (provider) => {
      const body =
        provider === "openai"
          ? {
              output: [
                { content: [{ type: "output_text", text: "Unverified" }] },
              ],
            }
          : provider === "gemini"
            ? { candidates: [{ content: { parts: [{ text: "Unverified" }] } }] }
            : { content: [{ type: "text", text: "Unverified" }] };
      const fetch = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(body)));
      vi.stubGlobal("fetch", fetch);
      const result = await askConnectedCopilot({ ...input, research: true }, {
        provider,
        model: "test",
      } as AiConnectionRecord);
      expect(JSON.parse(fetch.mock.calls[0][1].body).tools).toHaveLength(1);
      expect(result.sources).toEqual([]);
      expect(result.warnings.join(" ")).toContain("no usable source citations");
      expect(fetch).toHaveBeenCalledOnce();
    },
  );
  it("uses a separate rewrite instruction with the actual tuning context", async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          output: [
            {
              content: [
                {
                  type: "output_text",
                  text: "Keep hardware unchanged and review software options.",
                },
              ],
            },
          ],
        }),
      ),
    );
    vi.stubGlobal("fetch", fetch);
    await askConnectedCopilot(
      {
        ...input,
        intent: "tuning_prompt",
        research: true,
        tuningContext: {
          goal: "power",
          experience: "beginner",
          usage: "daily",
          budget: 5000,
          reserveBudget: 1000,
          selectedStage: "power",
          stages: [
            {
              id: "power",
              title: "Plan",
              budget: 1000,
              checks: [{ text: "Health checked", done: true }],
            },
          ],
        },
      },
      { provider: "openai", model: "saved" } as AiConnectionRecord,
    );
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.tools).toBeUndefined();
    expect(body.input[0].content).toContain("Rewrite only");
    expect(body.input[0].content).toContain("Do not answer");
    expect(body.input[1].content).toContain('"reserveBudget":1000');
    expect(body.input[1].content).toContain('"done":true');
    expect(fetch).toHaveBeenCalledOnce();
  });
  it.each(["openai", "anthropic", "gemini"] as const)(
    "uses the owner's %s connection and preserves context",
    async (provider) => {
      const body =
        provider === "openai"
          ? {
              output: [
                { content: [{ type: "output_text", text: "Next action" }] },
              ],
            }
          : provider === "anthropic"
            ? { content: [{ type: "text", text: "Next action" }] }
            : {
                candidates: [
                  {
                    content: {
                      parts: [
                        { thought: true, text: "internal" },
                        { text: "Next action" },
                      ],
                    },
                  },
                ],
              };
      const fetch = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(body)));
      vi.stubGlobal("fetch", fetch);
      const reply = await askConnectedCopilot(input, {
        provider,
        model: "saved-model",
      } as AiConnectionRecord);
      expect(reply.source).toBe("external");
      expect(reply.answer).toBe("Next action");
      const options = fetch.mock.calls[0][1];
      expect(options.body).toContain("Chip only, no hardware");
      expect(options.body).toContain("N43");
      expect(options.body).not.toContain("private-vehicle");
      expect(fetch.mock.calls[0][0] + options.body).toContain("saved-model");
      expect(options.body).toContain("de");
      expect(JSON.stringify(reply)).not.toContain("private-key");
      expect(fetch).toHaveBeenCalledOnce();
    },
  );
  it.each([401, 429, 404, 500])(
    "surfaces provider failure %s without leaking details or retrying",
    async (status) => {
      const fetch = vi
        .fn()
        .mockResolvedValue(new Response("secret provider error", { status }));
      vi.stubGlobal("fetch", fetch);
      await expect(
        askConnectedCopilot(input, {
          provider: "openai",
          model: "test",
        } as AiConnectionRecord),
      ).rejects.toThrow(/provider|model/);
      expect(fetch).toHaveBeenCalledOnce();
    },
  );
  it("rejects empty model responses rather than inventing a successful result", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));
    await expect(
      askConnectedCopilot(input, {
        provider: "gemini",
        model: "test",
      } as AiConnectionRecord),
    ).rejects.toThrow("no answer");
  });
});
