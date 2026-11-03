"use client";

import Link from "next/link";
import {
  CopilotResearchSources,
  researchCopy,
} from "@/components/copilot/copilot-research";
import { useEffect, useRef, useState } from "react";
import {
  copilotResponseSchema,
  type CopilotResponse,
} from "@/features/copilot/copilot-schema";
import { tuningAiContext } from "@/features/tuning/tuning-ai";
import { tuningAiCopy } from "@/features/tuning/tuning-ai-copy";
import type { TuningPlan } from "@/features/tuning/tuning-roadmap";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import type { AppLocale } from "@/i18n/config";

const button =
  "min-h-11 rounded-xl border border-primary/40 px-4 py-3 text-left font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50";
export function TuningAiAssistant({
  vehicle,
  plan,
  locale,
}: {
  vehicle: Vehicle;
  plan: TuningPlan;
  locale: AppLocale;
}) {
  const c = (key: keyof typeof tuningAiCopy) => tuningAiCopy[key][locale];
  const [research, setResearch] = useState(false);
  const [question, setQuestion] = useState("");
  const [original, setOriginal] = useState<string>();
  const [selectedStage, setSelectedStage] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [response, setResponse] = useState<CopilotResponse>();
  const [history, setHistory] = useState<
    { question: string; answer: string }[]
  >([]);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  async function send(intent: "tuning_prompt" | "tuning_review") {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    setStatus("");
    const message = question.trim() || c("defaultQuestion");
    try {
      const result = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(
            intent === "tuning_review" && research ? 55_000 : 35_000,
          ),
        ]),
        body: JSON.stringify({
          intent,
          research: intent === "tuning_review" && research,
          locale,
          message,
          tuningContext: tuningAiContext(plan, selectedStage),
          history: intent === "tuning_review" ? history.slice(-8) : [],
          vehicle: {
            id: vehicle.id,
            make: vehicle.make,
            model: vehicle.model,
            productionYear: vehicle.productionYear,
            platform: vehicle.platform,
            engineCode: vehicle.engineCode,
            mileage: vehicle.mileage,
          },
          buildItems: [],
        }),
      });
      if (result.status === 409) {
        setError(c("setup"));
        return;
      }
      if (!result.ok) {
        const failure = await result.json().catch(() => null);
        setError(
          c("failure") +
            (typeof failure?.error === "string"
              ? " " + failure.error.slice(0, 400)
              : ""),
        );
        return;
      }
      const body = copilotResponseSchema.parse(await result.json());
      if (body.source !== "external") throw new Error("AI provider required");
      if (controller.signal.aborted) return;
      if (intent === "tuning_prompt") {
        if (body.answer.length > 1000) throw new Error("Prompt too long");
        setOriginal(question);
        setQuestion(body.answer);
        setStatus(c("improved"));
      } else {
        setResponse(body);
        setHistory((current) => [
          ...current.slice(-7),
          { question: message, answer: body.answer.slice(0, 6000) },
        ]);
      }
    } catch {
      if (!controller.signal.aborted) setError(c("failure"));
    } finally {
      request.current = null;
      setBusy(false);
    }
  }
  return (
    <section
      aria-labelledby="tuning-ai-title"
      className="bg-card border-primary/30 mt-5 rounded-3xl border p-5 sm:p-7"
    >
      <h2
        id="tuning-ai-title"
        tabIndex={-1}
        className="scroll-mt-24 text-xl font-medium focus:outline-none"
      >
        {c("title")}
      </h2>
      <p className="text-muted-foreground mt-3 leading-7">{c("intro")}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          aria-pressed={!selectedStage}
          onClick={() => {
            setSelectedStage(undefined);
            setResponse(undefined);
            setHistory([]);
          }}
          className={button}
        >
          {c("whole")}
        </button>
        {plan.stages.map((stage) => (
          <button
            key={stage.id}
            type="button"
            disabled={busy}
            aria-pressed={selectedStage === stage.id}
            onClick={() => {
              setSelectedStage(stage.id);
              setResponse(undefined);
              setHistory([]);
            }}
            className={`${button} ${selectedStage === stage.id ? "bg-primary/10 text-primary" : ""}`}
          >
            {stage.order}. {stage.title}
          </button>
        ))}
      </div>
      <label htmlFor="tuning-ai-question" className="mt-5 block font-medium">
        {c("question")}
      </label>
      <textarea
        id="tuning-ai-question"
        value={question}
        disabled={busy}
        onChange={(event) => {
          setQuestion(event.target.value);
          setStatus("");
        }}
        maxLength={1000}
        rows={3}
        placeholder={c("placeholder")}
        className="bg-background focus-visible:outline-primary mt-2 w-full rounded-xl border border-white/20 p-4 leading-7 focus-visible:outline-2"
      />
      <p className="text-muted-foreground mt-2 text-sm leading-6">
        {c("disclosure")}
      </p>
      <label className="text-muted-foreground mt-3 flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={research}
          disabled={busy}
          onChange={(event) => setResearch(event.target.checked)}
          className="accent-primary size-5"
        />
        {researchCopy[locale].option}
      </label>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void send("tuning_prompt")}
          className={button}
        >
          {c("improve")}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void send("tuning_review")}
          className={`${button} bg-primary text-primary-foreground`}
        >
          {c("ask")}
        </button>
        {original !== undefined && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setQuestion(original);
              setOriginal(undefined);
              setStatus("");
            }}
            className={button}
          >
            {c("undo")}
          </button>
        )}
      </div>
      <p role="status" className="text-primary mt-3 empty:hidden">
        {busy ? c("busy") : status}
      </p>
      {error && (
        <p role="alert" className="text-destructive mt-3">
          {error}
        </p>
      )}
      <Link
        href="/account/connections"
        className="text-primary mt-3 inline-flex min-h-11 items-center underline underline-offset-4"
      >
        {c("connect")}
      </Link>
      {response && (
        <article className="bg-background mt-4 rounded-2xl border border-white/15 p-5">
          <h3 className="font-medium">{c("review")}</h3>
          <p className="text-primary mt-2 text-sm">{response.provider}</p>
          <p className="mt-4 leading-7 whitespace-pre-wrap">
            {response.answer}
          </p>
          <CopilotResearchSources response={response} locale={locale} />
          <ul className="text-muted-foreground mt-4 space-y-2 text-sm leading-6">
            {response.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </article>
      )}
    </section>
  );
}
