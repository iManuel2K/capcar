"use client";

import Link from "next/link";
import { readCopilotResponse } from "@/features/copilot/chat-transport";
import { CopilotFollowUp } from "./copilot-follow-up";
import {
  clarificationContext,
  conversationAnswer,
} from "@/features/copilot/conversation-follow-up";
import { CopilotResearchSources, researchCopy } from "./copilot-research";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { MotionLoader as LoaderCircle } from "@/components/ui/motion-loader";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  AIConversation,
  AIInput,
  AIMessage,
  AIResponse,
} from "@/components/ui/ai-conversation";
import { useLocale } from "next-intl";
import { resolveJournalLocale } from "@/features/journal/routes";
import { copilotCopy } from "@/features/copilot/copilot-copy";
import { interactionCopy } from "@/features/ui/interaction-copy";

import { useBuildState } from "@/features/builds/use-builds";
import type { CopilotResponse } from "@/features/copilot/copilot-schema";
import { useVehicles } from "@/features/vehicles/use-vehicles";

const starters = [
  "What should I improve first?",
  "How should I plan more power?",
  "What should I check before buying wheels?",
] as const;

type Status = {
  mode: "deterministic" | "external" | "unavailable";
  providerName: string;
};
export function CopilotWorkspace({
  vehicleId,
  status = { mode: "deterministic", providerName: "CapCar rules copilot" },
}: {
  vehicleId: string;
  status?: Status;
}) {
  return (
    <CopilotSession key={vehicleId} vehicleId={vehicleId} status={status} />
  );
}

function CopilotSession({
  vehicleId,
  status,
}: {
  vehicleId: string;
  status: Status;
}) {
  const locale = resolveJournalLocale(useLocale());
  const c = interactionCopy[locale];
  const copy = (key: keyof typeof copilotCopy) => copilotCopy[key][locale];
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const { vehicles } = useVehicles();
  const builds = useBuildState();
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);
  const vehicleBuildIds = new Set(
    builds.builds
      .filter((build) => build.vehicleId === vehicleId)
      .map((build) => build.id),
  );
  const buildItems = builds.items.filter((item) =>
    vehicleBuildIds.has(item.buildId),
  );
  const [clarifications, setClarifications] = useState<
    { question: string; answer: string }[]
  >([]);
  const [research, setResearch] = useState(false);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<CopilotResponse>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [turns, setTurns] = useState<
    {
      question: string;
      answer: string;
      contextAnswer?: string;
      followUp?: CopilotResponse["followUp"];
    }[]
  >([]);
  const [pending, setPending] = useState("");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  if (!hydrated)
    return (
      <div className="min-h-[720px] animate-pulse rounded-[2rem] bg-white/[0.04]" />
    );
  if (!vehicle)
    return (
      <div className="text-muted-foreground py-32 text-center">
        Vehicle not found.
      </div>
    );

  async function submit(question = message) {
    if (!vehicle || question.trim().length < 2 || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    const nextClarifications = clarificationContext(
      clarifications,
      response,
      question,
    );
    setPending(question);
    setLoading(true);
    setError("");
    try {
      const apiResponse = await fetch("/api/copilot/chat", {
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(65_000),
        ]),
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/x-ndjson",
        },
        body: JSON.stringify({
          message: question,
          research,
          clarifications: nextClarifications,
          locale,
          history: turns.slice(-8).map((turn) => ({
            question: turn.question,
            answer: (turn.contextAnswer ?? turn.answer).slice(0, 6000),
          })),
          vehicle: {
            id: vehicle.id,
            make: vehicle.make,
            model: vehicle.model,
            productionYear: vehicle.productionYear,
            platform: vehicle.platform,
            engineCode: vehicle.engineCode,
            mileage: vehicle.mileage,
          },
          buildItems: buildItems.map((item) => ({
            title: item.title,
            stage: item.stage,
            status: item.status,
            catalogPartId: item.catalogPartId,
          })),
        }),
      });
      const body = await readCopilotResponse(apiResponse);
      if (controller.signal.aborted) return;
      setResponse(body);
      setTurns((current) => [
        ...current,
        {
          question,
          answer: body.answer,
          contextAnswer: conversationAnswer(body),
          followUp: body.followUp,
        },
      ]);
      setClarifications(nextClarifications);
      setMessage((draft) => (draft === question ? "" : draft));
    } catch (caught) {
      if (controller.signal.aborted) return;
      setMessage((draft) => (draft.trim() ? draft : question));
      setError(
        caught instanceof Error ? caught.message : "Copilot request failed.",
      );
    } finally {
      request.current = null;
      setPending("");
      setLoading(false);
    }
  }

  return (
    <div className="pb-24 sm:pb-0">
      <Link
        href={`/garage/${vehicleId}`}
        className="text-muted-foreground hover:text-foreground mb-7 inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="size-4" /> Vehicle overview
      </Link>
      <header className="bg-card rounded-[2rem] border border-white/10 p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="border-primary/25 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] uppercase">
            <Bot className="size-3" />{" "}
            {response?.provider ?? status.providerName}
          </span>
          <span className="rounded-full border border-amber-300/20 bg-amber-300/8 px-3 py-1.5 text-[10px] text-amber-100/65 uppercase">
            {response
              ? copy(response.source === "external" ? "connected" : "rules")
              : copy(
                  status.mode === "external"
                    ? "connected"
                    : status.mode === "unavailable"
                      ? "unavailable"
                      : "rules",
                )}
          </span>
        </div>
        <h1 className="mt-5 max-w-4xl text-2xl font-medium tracking-[-0.04em] sm:text-4xl">
          {c.overview}
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6">
          {copy(
            (
              response
                ? response.source === "external"
                : status.mode === "external"
            )
              ? "active"
              : status.mode === "unavailable"
                ? "unavailable"
                : "limited",
          )}
        </p>
        <Link
          href="/account/connections"
          className="text-primary border-primary/30 mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 focus-visible:outline-2"
        >
          {copy("connect")}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </header>

      <section className="mt-5">
        <article className="bg-background rounded-[2rem] border border-white/10 p-6 sm:p-8">
          <AIConversation contentKey={`${turns.length}:${pending}`}>
            {turns.flatMap((turn, index) => [
              <AIMessage key={`${index}-user`} role="user">
                <AIResponse text={turn.question} />
              </AIMessage>,
              <AIMessage key={`${index}-assistant`} role="assistant">
                <AIResponse text={turn.answer} />
                {index !== turns.length - 1 && turn.followUp && (
                  <p className="text-muted-foreground mt-3 leading-7">
                    {turn.followUp.question}
                  </p>
                )}
                {index === turns.length - 1 && (
                  <CopilotFollowUp
                    followUp={response?.followUp}
                    locale={locale}
                    busy={loading}
                    onReply={(reply) => void submit(reply)}
                  />
                )}
                {index === turns.length - 1 && response && (
                  <CopilotResearchSources response={response} locale={locale} />
                )}
                {index === turns.length - 1 && response && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {response.nextActions.map((action) => (
                      <Link
                        key={action.href}
                        href={action.href}
                        className="text-primary border-primary/30 inline-flex min-h-11 items-center rounded-xl border px-3 py-2"
                      >
                        {action.label}
                      </Link>
                    ))}
                  </div>
                )}
              </AIMessage>,
            ])}
            {pending && (
              <>
                <AIMessage role="user">
                  <AIResponse text={pending} />
                </AIMessage>
                <AIMessage role="assistant">
                  <span className="flex items-center gap-3">
                    <LoaderCircle label={c.thinking} />
                    {c.thinking}
                  </span>
                </AIMessage>
              </>
            )}
            {!turns.length && !pending && (
              <p className="text-muted-foreground p-4">{c.empty}</p>
            )}
          </AIConversation>
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="mt-4">
              <label className="text-muted-foreground mb-3 flex min-h-11 items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={research}
                  disabled={loading}
                  onChange={(event) => setResearch(event.target.checked)}
                  className="accent-primary size-5"
                />
                {researchCopy[locale].option}
              </label>
              <AIInput
                value={message}
                onValueChange={setMessage}
                maxLength={1000}
                onSubmit={() => void submit()}
                busy={loading}
                onStop={() => request.current?.abort()}
              />
            </div>
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {starters.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    disabled={loading}
                    onClick={() => void submit(starter)}
                    className="text-muted-foreground hover:text-foreground focus-visible:outline-primary inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-left text-xs focus-visible:outline-2"
                  >
                    <span>{starter}</span>
                    <ArrowRight className="size-3.5 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          {response ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 text-xs text-emerald-200/70">
                  <CheckCircle2 className="size-4" /> {response.provider}
                </span>
                <span className="text-muted-foreground text-[10px] uppercase">
                  {response.source}
                </span>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/10 p-5">
                  <p className="text-muted-foreground text-xs tracking-[0.12em] uppercase">
                    Evidence used
                  </p>
                  <ul className="mt-4 space-y-3">
                    {response.evidence.map((item) => (
                      <li
                        key={item}
                        className="text-muted-foreground flex gap-2 text-xs leading-5"
                      >
                        <ShieldCheck className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-amber-300/15 bg-amber-300/6 p-5">
                  <p className="text-xs tracking-[0.12em] text-amber-100/60 uppercase">
                    Boundaries
                  </p>
                  <ul className="mt-4 space-y-3">
                    {response.warnings.map((item) => (
                      <li
                        key={item}
                        className="text-muted-foreground flex gap-2 text-xs leading-5"
                      >
                        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-200" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : null}
          {error && (
            <p
              role="alert"
              className="mt-5 flex gap-2 rounded-xl border border-red-300/15 bg-red-300/6 p-4 text-sm text-red-100/70"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}
        </article>
      </section>
    </div>
  );
}
