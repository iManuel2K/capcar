import { requestExternalProvider } from "@/features/providers/external-json-provider";
import {
  copilotResponseSchema,
  type CopilotRequest,
  type CopilotResponse,
} from "@/features/copilot/copilot-schema";

type CopilotEnvironment = Record<string, string | undefined>;

export type CopilotStatus = {
  mode: "deterministic" | "external";
  configured: boolean;
  providerName: string;
};

export function getCopilotStatus(
  environment: CopilotEnvironment = process.env,
): CopilotStatus {
  const external = environment.CAPCAR_COPILOT_MODE === "external";
  if (!external)
    return {
      mode: "deterministic",
      configured: true,
      providerName: "CapCar rules copilot",
    };
  return {
    mode: "external",
    configured: Boolean(
      environment.CAPCAR_COPILOT_ENDPOINT && environment.CAPCAR_COPILOT_API_KEY,
    ),
    providerName:
      environment.CAPCAR_COPILOT_PROVIDER_NAME || "External AI provider",
  };
}

function deterministicResponse(request: CopilotRequest): CopilotResponse {
  const current = request.message.toLowerCase();
  const followUp =
    /^(i did|done|now what|what next|yes|okay|ok|erledigt|fertig)\b/.test(
      current,
    );
  const text = followUp
    ? `${request.history?.map((turn) => turn.question).join(" ") ?? ""} ${current}`.toLowerCase()
    : current;
  const base = `/garage/${request.vehicle.id}`;
  let answer = `For your ${request.vehicle.productionYear} ${request.vehicle.model} (${request.vehicle.engineCode}), start with the maintenance record and any current faults. Then choose a goal in the tuning roadmap and set a budget. I can organise these steps in rules mode; connect an AI provider for a vehicle-focused conversation.`;
  let nextActions = [
    { label: "Open maintenance", href: `${base}/maintenance` },
    { label: "Search parts", href: `${base}/parts` },
  ];
  if (
    /\b(ai|gpt|gemini|claude|openai|connect|connection|verbinden)\b/.test(
      current,
    )
  ) {
    answer =
      "Open Account → Connections and connect a Gemini, OpenAI or Claude API key. Copilot will use that same saved connection on your next message. A ChatGPT or other chat subscription alone does not connect its API. Until a provider is connected, replies are limited CapCar rules.";
    nextActions = [{ label: "Connect your AI", href: "/account/connections" }];
  } else if (
    /power|tune|tuning|chip|remap|stage|horsepower|leistung/.test(text)
  ) {
    answer =
      "For a power goal, establish maintenance and diagnostic health first, then verify tyres, brakes, cooling, ignition, fuelling and drivetrain condition before discussing calibration. CapCar does not estimate a safe power gain from the supplied vehicle information.";
    if (/chip|remap|no mechanical/.test(text))
      answer = `You want more power through software, without mechanical changes, for ${request.vehicle.model} (${request.vehicle.engineCode}). ${followUp ? "You have said the baseline checks are done. Next, " : "After confirming maintenance and fault-free operation, "}ask a qualified tuner for evidence for this exact engine and existing hardware: before/after measurements, fuel requirements, emissions approval and insurance implications. Do not buy a generic chip on a model-name claim. This rules mode cannot verify a gain or assess the engine's condition. Connect your AI for a more detailed discussion, or save this goal in your tuning roadmap.`;
    else if (followUp)
      answer =
        "You have said the baseline checks are done. Next, record your power goal, budget and hardware constraints in the tuning roadmap. Ask a qualified tuner for an exact-engine assessment, required supporting work and documented before/after measurements. This rules mode cannot verify a power gain.";
    nextActions = [
      { label: "Create tuning roadmap", href: `${base}/tuning` },
      { label: "Review maintenance", href: `${base}/maintenance` },
    ];
  } else if (/wheel|tyre|tire|suspension|brake|fit|compat/.test(text)) {
    answer =
      "Treat wheels, tyres, brakes and suspension as one system. Add the candidate parts to a build, then review offset, width, tyre diameter, axle load, ride height, steering travel and brake clearance together.";
    nextActions = [
      { label: "Search structured parts", href: `${base}/parts` },
      { label: "Open builds", href: `${base}/builds` },
    ];
  } else if (/install|guide|tool/.test(text)) {
    answer =
      "Use only a guide whose applicability and evidence state are visible. Draft CapCar workflows can organize the job, but exact specifications and safety steps must come from an authoritative source for the exact vehicle.";
    nextActions = [
      { label: "Open guide library", href: `${base}/guides` },
      { label: "Check data sources", href: `${base}/data-sources` },
    ];
  } else if (/price|cheap|cost|offer|buy/.test(text)) {
    answer =
      "Compare delivered cost rather than product price alone: shipping, required hardware, tools, alignment, coding, inspection and returns can change the real total. Current CapCar offers are fictional until a retailer provider is activated.";
    nextActions = [
      { label: "Search parts", href: `${base}/parts` },
      { label: "Open builds", href: `${base}/builds` },
    ];
  }
  return {
    provider: "CapCar rules copilot",
    source: "deterministic",
    answer,
    evidence: [
      `${request.vehicle.productionYear} ${request.vehicle.make ?? "Vehicle"} ${request.vehicle.model} · ${request.vehicle.platform} · ${request.vehicle.engineCode}`,
      `${request.buildItems.length} build items were provided as context.`,
      "Response generated from conservative CapCar workflow rules, not external technical data.",
    ],
    warnings: [
      "No torque value, fitment, legal status, diagnosis or performance gain is asserted.",
    ],
    nextActions,
  };
}

export async function askCopilot(
  request: CopilotRequest,
  environment: CopilotEnvironment = process.env,
): Promise<CopilotResponse> {
  const status = getCopilotStatus(environment);
  if (status.mode === "deterministic") return deterministicResponse(request);
  if (!status.configured)
    throw new Error("External copilot is not fully configured.");
  const response = await requestExternalProvider<
    CopilotRequest,
    CopilotResponse
  >(
    {
      endpoint: environment.CAPCAR_COPILOT_ENDPOINT!,
      apiKey: environment.CAPCAR_COPILOT_API_KEY!,
    },
    request,
  );
  return copilotResponseSchema.parse({
    ...response,
    provider: status.providerName,
    source: "external",
  });
}
