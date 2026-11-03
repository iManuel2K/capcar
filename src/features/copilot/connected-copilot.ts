import {
  type AiConnectionRecord,
  tripPlannerEnvironmentForConnection,
} from "@/features/connections/ai-connection";
import type { CopilotRequest, CopilotResponse } from "./copilot-schema";

export class CopilotProviderError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function askConnectedCopilot(
  input: CopilotRequest,
  connection: AiConnectionRecord,
  signal?: AbortSignal,
): Promise<CopilotResponse> {
  const env = tripPlannerEnvironmentForConnection(connection);
  const system = `You are CapCar's practical project-car assistant. Reply in ${input.locale ?? "en"}.
Use the supplied vehicle, build items and conversation. Treat those as user-provided context, not verified technical evidence. Follow the latest request and constraints; don't ask again for supplied details. Give a direct answer and up to three concrete next actions. If the user says a check is done, advance the plan instead of repeating it.
For chip-only tuning, explain the limits for the exact engine if known; do not assume turbocharging from a model badge. Do not fabricate horsepower gains, prices, fitment, torque values, legal approval or sources. Clearly identify uncertainty and recommend exact-engine evidence from a qualified tuner. Never recommend emissions defeat. No live web search is available. Keep the answer under 350 words. Do not claim CapCar verified or completed work.`;
  const vehicle = {
    make: input.vehicle.make,
    model: input.vehicle.model,
    productionYear: input.vehicle.productionYear,
    platform: input.vehicle.platform,
    engineCode: input.vehicle.engineCode,
    mileage: input.vehicle.mileage,
  };
  const prompt = JSON.stringify({
    vehicle,
    buildItems: input.buildItems,
    history: input.history ?? [],
    message: input.message,
  });
  const provider = connection.provider;
  const url =
    provider === "openai"
      ? "https://api.openai.com/v1/responses"
      : provider === "anthropic"
        ? "https://api.anthropic.com/v1/messages"
        : `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(connection.model)}:generateContent`;
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (provider === "openai")
    headers.authorization = `Bearer ${env.OPENAI_API_KEY}`;
  else if (provider === "anthropic") {
    headers["x-api-key"] = env.ANTHROPIC_API_KEY!;
    headers["anthropic-version"] = "2023-06-01";
  } else headers["x-goog-api-key"] = env.GEMINI_API_KEY!;
  const body =
    provider === "openai"
      ? {
          model: connection.model,
          store: false,
          input: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
          reasoning: { effort: "low" },
          max_output_tokens: 1800,
        }
      : provider === "anthropic"
        ? {
            model: connection.model,
            system,
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1200,
          }
        : {
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1800 },
          };
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.any([
        AbortSignal.timeout(25_000),
        ...(signal ? [signal] : []),
      ]),
    });
  } catch {
    throw new CopilotProviderError(
      "The AI request was interrupted or timed out. No automatic retry was made.",
      504,
    );
  }
  if (!response.ok) {
    const message =
      response.status === 401 || response.status === 403
        ? "Your AI provider rejected access. Check your connection under Account → Connections."
        : response.status === 429 || response.status === 402
          ? "Your AI provider reached a quota or billing limit. Check your provider account before retrying."
          : response.status === 404
            ? "The saved AI model is unavailable. Reconnect your provider under Account → Connections."
            : "Your AI provider could not answer. Please try again later.";
    throw new CopilotProviderError(
      message,
      response.status === 429 ? 429 : 502,
    );
  }
  const data = await response.json().catch(() => {
    throw new CopilotProviderError(
      "Your AI provider returned an unreadable answer. No automatic retry was made.",
      502,
    );
  });
  const answer: unknown =
    provider === "openai"
      ? data.output
          ?.flatMap(
            (item: { content?: { type: string; text?: string }[] }) =>
              item.content ?? [],
          )
          .filter((item: { type: string }) => item.type === "output_text")
          .map((item: { text?: string }) => item.text ?? "")
          .join("\n")
      : provider === "anthropic"
        ? data.content
            ?.filter((item: { type: string }) => item.type === "text")
            .map((item: { text: string }) => item.text)
            .join("\n")
        : data.candidates?.[0]?.content?.parts
            ?.filter((item: { thought?: boolean }) => !item.thought)
            .map((item: { text?: string }) => item.text ?? "")
            .join("\n");
  if (typeof answer !== "string" || !answer.trim())
    throw new CopilotProviderError(
      "Your AI provider returned no answer. No automatic retry was made.",
      502,
    );
  return {
    provider: `Your ${provider === "openai" ? "OpenAI" : provider === "anthropic" ? "Claude" : "Gemini"}`,
    source: "external",
    answer: answer.slice(0, 6000),
    evidence: [
      `${vehicle.productionYear} ${vehicle.make ?? ""} ${vehicle.model} · ${vehicle.engineCode}`,
      `${input.buildItems.length} saved build items; ${input.history?.length ?? 0} recent conversation turns. User-provided context, not verified sources.`,
    ],
    warnings: [
      "AI advice is not a diagnosis, fitment check or legal approval. No live sources were checked.",
    ],
    nextActions: [
      { label: "Tuning roadmap", href: `/garage/${input.vehicle.id}/tuning` },
    ],
  };
}
