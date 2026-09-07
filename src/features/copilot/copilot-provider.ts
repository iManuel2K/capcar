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
      providerName: "Capcar rules copilot",
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
  const text = request.message.toLowerCase();
  const base = `/garage/${request.vehicle.id}`;
  let answer =
    "Start by making the vehicle data and goal explicit, then use Capcar's structured checks before choosing a part.";
  let nextActions = [
    { label: "Open maintenance", href: `${base}/maintenance` },
    { label: "Search parts", href: `${base}/parts` },
  ];
  if (/power|tune|stage|horsepower|leistung/.test(text)) {
    answer =
      "For a power goal, establish maintenance and diagnostic health first, then verify tyres, brakes, cooling, ignition, fuelling and drivetrain condition before discussing calibration. Capcar does not estimate a safe power gain from the current demo data.";
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
  } else if (/install|guide|tool|how/.test(text)) {
    answer =
      "Use only a guide whose applicability and evidence state are visible. Draft Capcar workflows can organize the job, but exact specifications and safety steps must come from an authoritative source for the exact vehicle.";
    nextActions = [
      { label: "Open guide library", href: `${base}/guides` },
      { label: "Check data sources", href: `${base}/data-sources` },
    ];
  } else if (/price|cheap|cost|offer|buy/.test(text)) {
    answer =
      "Compare delivered cost rather than product price alone: shipping, required hardware, tools, alignment, coding, inspection and returns can change the real total. Current Capcar offers are fictional until a retailer provider is activated.";
    nextActions = [
      { label: "Search parts", href: `${base}/parts` },
      { label: "Open builds", href: `${base}/builds` },
    ];
  }
  return {
    provider: "Capcar rules copilot",
    source: "deterministic",
    answer,
    evidence: [
      `${request.vehicle.productionYear} ${request.vehicle.make ?? "Vehicle"} ${request.vehicle.model} · ${request.vehicle.platform} · ${request.vehicle.engineCode}`,
      `${request.buildItems.length} build items were provided as context.`,
      "Response generated from conservative Capcar workflow rules, not external technical data.",
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
