import { describe, expect, it } from "vitest";
import {
  clarificationContext,
  conversationAnswer,
  parseCopilotAnswer,
} from "./conversation-follow-up";
const followUp = {
  question: "Where is the car registered?",
  reason: "Road-use requirements affect the options.",
  choices: ["Germany", "Another country"],
};
const response = {
  answer: "I can compare software-only options.",
  followUp,
  source: "external" as const,
  provider: "Test",
  evidence: [],
  warnings: [],
  nextActions: [],
};
describe("clarification contract", () => {
  it("preserves an entire answer when only follow-up JSON was cut off", () => {
    expect(
      parseCopilotAnswer(
        '{"answer":"The actual complete answer.","followUp":{"question":',
      ),
    ).toEqual({ answer: "The actual complete answer.", incomplete: true });
    expect(() => parseCopilotAnswer('{"answer":"Cut off')).toThrow();
  });
  it("parses one optional question and rejects invalid question metadata without exposing JSON", () => {
    expect(parseCopilotAnswer(JSON.stringify(response))).toEqual({
      answer: response.answer,
      followUp,
    });
    expect(
      parseCopilotAnswer(
        JSON.stringify({
          answer: "Proceed with assumptions",
          followUp: { question: ["one", "two"] },
        }),
      ),
    ).toEqual({ answer: "Proceed with assumptions" });
    expect(
      parseCopilotAnswer("I checked the sources.\n" + JSON.stringify(response)),
    ).toEqual({ answer: response.answer, followUp });
    expect(parseCopilotAnswer("Normal advice")).toEqual({
      answer: "Normal advice",
    });
    expect(() => parseCopilotAnswer('{"answer":')).toThrow();
  });
  it("retains the user's actual reply and replaces rather than duplicates the same question", () => {
    const context = clarificationContext(
      [],
      response,
      "I don’t know — help me decide",
    );
    expect(context).toEqual([
      { question: followUp.question, answer: "I don’t know — help me decide" },
    ]);
    expect(clarificationContext(context, response, "Germany")).toEqual([
      { question: followUp.question, answer: "Germany" },
    ]);
    expect(conversationAnswer(response)).toContain(followUp.question);
    expect(conversationAnswer(response)).toContain(followUp.reason);
  });
  it("keeps at most twelve clarification replies independently of recent chat turns", () => {
    const previous = Array.from({ length: 12 }, (_, i) => ({
      question: String(i),
      answer: "Known",
    }));
    const result = clarificationContext(previous, response, "Germany");
    expect(result).toHaveLength(12);
    expect(result[0].question).toBe("1");
    expect(result.at(-1)?.answer).toBe("Germany");
  });
});
