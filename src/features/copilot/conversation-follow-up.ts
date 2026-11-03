import {
  copilotFollowUpSchema,
  type CopilotRequest,
  type CopilotResponse,
} from "./copilot-schema";
export function parseCopilotAnswer(
  raw: string,
): Pick<CopilotResponse, "answer" | "followUp"> & { incomplete?: boolean } {
  const text = raw
    .trim()
    .replace(/^\x60\x60\x60(?:json)?\s*/i, "")
    .replace(/\s*\x60\x60\x60$/, "");
  const start = text.search(/\{\s*"answer"\s*:/);
  if (start < 0 && !text.startsWith("{")) return { answer: raw.slice(0, 6000) };
  let value: { answer?: unknown; followUp?: unknown };
  try {
    value = JSON.parse(
      text.slice(Math.max(0, start), text.lastIndexOf("}") + 1),
    );
  } catch (error) {
    // Preserve only an entire JSON string, never invent or repair missing answer text.
    const match = text.match(/"answer"\s*:\s*("(?:\\.|[^"\\])*")/);
    if (!match) throw error;
    const answer: unknown = JSON.parse(match[1]);
    if (typeof answer !== "string" || !answer.trim()) throw error;
    return { answer: answer.slice(0, 6000), incomplete: true };
  }
  if (typeof value?.answer !== "string" || !value.answer.trim())
    throw new Error("Missing answer");
  const followUp = copilotFollowUpSchema.safeParse(value.followUp);
  return {
    answer: value.answer.slice(0, 6000),
    ...(followUp.success ? { followUp: followUp.data } : {}),
  };
}
export function clarificationContext(
  previous: NonNullable<CopilotRequest["clarifications"]>,
  response: CopilotResponse | undefined,
  message: string,
) {
  if (!response?.followUp) return previous;
  const question = response.followUp.question;
  return [
    ...previous.filter((item) => item.question !== question),
    { question, answer: message.slice(0, 1000) },
  ].slice(-12);
}
export function conversationAnswer(response: CopilotResponse) {
  return [
    response.answer,
    ...(response.followUp
      ? [
          response.followUp.question,
          response.followUp.reason,
          response.followUp.choices.join(" / "),
        ]
      : []),
  ]
    .join("\n")
    .slice(0, 6000);
}
