"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  LoaderCircle,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { useBuildState } from "@/features/builds/use-builds";
import type { CopilotResponse } from "@/features/copilot/copilot-schema";
import { useVehicles } from "@/features/vehicles/use-vehicles";

const starters = [
  "What should I improve first?",
  "How should I plan more power?",
  "What should I check before buying wheels?",
] as const;

export function CopilotWorkspace({ vehicleId }: { vehicleId: string }) {
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
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<CopilotResponse>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!hydrated)
    return (
      <div className="min-h-[720px] animate-pulse rounded-[2rem] bg-white/[0.04]" />
    );
  if (!vehicle)
    return (
      <div className="py-32 text-center text-white/45">Vehicle not found.</div>
    );

  async function submit(question = message) {
    if (!vehicle || question.trim().length < 2) return;
    setLoading(true);
    setError("");
    try {
      const apiResponse = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: question,
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
      const body = (await apiResponse.json()) as
        CopilotResponse | { error?: string };
      if (!apiResponse.ok || !("answer" in body))
        throw new Error(
          "error" in body && body.error
            ? body.error
            : "Copilot request failed.",
        );
      setResponse(body);
      setMessage(question);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Copilot request failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pb-24 sm:pb-0">
      <Link
        href={`/garage/${vehicleId}`}
        className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
      >
        <ArrowLeft className="size-4" /> Vehicle overview
      </Link>
      <header className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_84%_15%,rgba(231,45,69,0.22),transparent_30%),#111111] p-6 sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e72d45]/25 bg-[#e72d45]/10 px-3 py-1.5 text-[10px] text-[#bad1ff] uppercase">
            <Bot className="size-3" /> Capcar rules copilot
          </span>
          <span className="rounded-full border border-amber-300/20 bg-amber-300/8 px-3 py-1.5 text-[10px] text-amber-100/65 uppercase">
            No external AI active
          </span>
        </div>
        <p className="mt-7 text-xs font-semibold tracking-[0.14em] text-[#ff667a] uppercase">
          Epic 18 · Project-car copilot
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
          Ask in plain language. Get a structured next step.
        </h1>
        <p className="mt-5 max-w-2xl leading-7 text-white/45">
          The current copilot uses conservative rules and your saved
          vehicle/build context. An external AI adapter can be activated later.
        </p>
      </header>

      <section className="mt-5 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
        <aside className="rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-8">
          <p className="text-xs tracking-[0.14em] text-white/30 uppercase">
            Ask Capcar
          </p>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={6}
            placeholder="I want better handling but still use the car every day…"
            className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-[#0d0d0d] p-4 text-sm leading-6 text-white/70 outline-none placeholder:text-white/25 focus:border-[#e72d45]/50"
          />
          <button
            type="button"
            disabled={loading || message.trim().length < 2}
            onClick={() => submit()}
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e72d45] px-4 text-sm font-semibold text-[#07101d] disabled:opacity-40"
          >
            {loading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}{" "}
            Ask copilot
          </button>
          <div className="mt-7">
            <p className="text-xs text-white/30">Try a starting point</p>
            <div className="mt-3 space-y-2">
              {starters.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => void submit(starter)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/8 p-3 text-left text-xs text-white/45 hover:text-white"
                >
                  <span>{starter}</span>
                  <ArrowRight className="size-3.5 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </aside>

        <article className="rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-8">
          {response ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 text-xs text-emerald-200/70">
                  <CheckCircle2 className="size-4" /> {response.provider}
                </span>
                <span className="text-[10px] text-white/25 uppercase">
                  {response.source}
                </span>
              </div>
              <p className="mt-8 text-xl leading-9 text-white/75">
                {response.answer}
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/10 p-5">
                  <p className="text-xs tracking-[0.12em] text-white/30 uppercase">
                    Evidence used
                  </p>
                  <ul className="mt-4 space-y-3">
                    {response.evidence.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 text-xs leading-5 text-white/40"
                      >
                        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-white/25" />
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
                        className="flex gap-2 text-xs leading-5 text-white/45"
                      >
                        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-200" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {response.nextActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/60 hover:text-white"
                  >
                    {action.label}
                    <ArrowRight className="size-3.5" />
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
              <Sparkles className="size-10 text-white/20" />
              <h2 className="mt-6 text-2xl font-medium">
                Your context is ready
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/40">
                Capcar can reference this vehicle and {buildItems.length} saved
                build items without sending data to an external AI.
              </p>
            </div>
          )}
          {error && (
            <p className="mt-5 flex gap-2 rounded-xl border border-red-300/15 bg-red-300/6 p-4 text-sm text-red-100/70">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}
        </article>
      </section>
    </div>
  );
}
