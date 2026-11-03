import {
  copilotFollowUpSchema,
  type CopilotRequest,
  type CopilotResponse,
} from "./copilot-schema";
export function parseCopilotAnswer(
  raw: string,
): Pick<CopilotResponse, "answer" | "followUp"> {
  const text = raw
    .trim()
    .replace(/^\x60\x60\x60(?:json)?\s*/i, "")
    .replace(/\s*\x60\x60\x60$/, "");
  const start = text.search(/\{\s*"answer"\s*:/);
  if (start < 0 && !text.startsWith("{")) return { answer: raw.slice(0, 6000) };
  const value = JSON.parse(
    text.slice(Math.max(0, start), text.lastIndexOf("}") + 1),
  ) as { answer?: unknown; followUp?: unknown };
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
