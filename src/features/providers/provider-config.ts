import type {
  ProviderDomain,
  ProviderMode,
  ProviderStatus,
} from "@/features/providers/provider-contracts";

export type ProviderEnvironment = Record<string, string | undefined>;

type ProviderDefinition = {
  domain: ProviderDomain;
  label: string;
  modeKey: string;
  nameKey: string;
  endpointKey: string;
  apiKeyKey: string;
  demoName: string;
};

const definitions: ProviderDefinition[] = [
  {
    domain: "vehicle",
    label: "Vehicle data",
    modeKey: "CAPCAR_VEHICLE_PROVIDER_MODE",
    nameKey: "CAPCAR_VEHICLE_PROVIDER_NAME",
    endpointKey: "CAPCAR_VEHICLE_PROVIDER_ENDPOINT",
    apiKeyKey: "CAPCAR_VEHICLE_PROVIDER_API_KEY",
    demoName: "Capcar vehicle demo",
  },
  {
    domain: "catalog",
    label: "Parts catalogue",
    modeKey: "CAPCAR_CATALOG_PROVIDER_MODE",
    nameKey: "CAPCAR_CATALOG_PROVIDER_NAME",
    endpointKey: "CAPCAR_CATALOG_PROVIDER_ENDPOINT",
    apiKeyKey: "CAPCAR_CATALOG_PROVIDER_API_KEY",
    demoName: "Capcar catalogue demo",
  },
  {
    domain: "offers",
    label: "Retail offers",
    modeKey: "CAPCAR_OFFERS_PROVIDER_MODE",
    nameKey: "CAPCAR_OFFERS_PROVIDER_NAME",
    endpointKey: "CAPCAR_OFFERS_PROVIDER_ENDPOINT",
    apiKeyKey: "CAPCAR_OFFERS_PROVIDER_API_KEY",
    demoName: "Capcar offers demo",
  },
  {
    domain: "models",
    label: "Vehicle 3D models",
    modeKey: "CAPCAR_MODEL_PROVIDER_MODE",
    nameKey: "CAPCAR_MODEL_PROVIDER_NAME",
    endpointKey: "CAPCAR_MODEL_PROVIDER_ENDPOINT",
    apiKeyKey: "CAPCAR_MODEL_PROVIDER_API_KEY",
    demoName: "Capcar reference geometry",
  },
];

function mode(value: string | undefined): ProviderMode {
  return value?.toLowerCase() === "external" ? "external" : "demo";
}

export function getProviderStatuses(
  environment: ProviderEnvironment = process.env,
): ProviderStatus[] {
  return definitions.map((definition) => {
    const selectedMode = mode(environment[definition.modeKey]);
    if (selectedMode === "demo") {
      return {
        domain: definition.domain,
        label: definition.label,
        mode: selectedMode,
        configured: true,
        providerName: definition.demoName,
        message: "Safe local demo data is active.",
      };
    }

    const providerName =
      environment[definition.nameKey]?.trim() || "External provider";
    const configured = Boolean(
      environment[definition.endpointKey]?.trim() &&
      environment[definition.apiKeyKey]?.trim(),
    );
    return {
      domain: definition.domain,
      label: definition.label,
      mode: selectedMode,
      configured,
      providerName,
      message: configured
        ? "Server-side external adapter is configured."
        : "Endpoint and API key are required before activation.",
    };
  });
}

export function getProviderStatus(
  domain: ProviderDomain,
  environment: ProviderEnvironment = process.env,
) {
  return getProviderStatuses(environment).find(
    (status) => status.domain === domain,
  )!;
}

export function getExternalProviderConnection(
  domain: ProviderDomain,
  environment: ProviderEnvironment = process.env,
) {
  const definition = definitions.find(
    (candidate) => candidate.domain === domain,
  )!;
  const status = getProviderStatus(domain, environment);
  if (status.mode !== "external" || !status.configured) return undefined;
  return {
    providerName: status.providerName,
    endpoint: environment[definition.endpointKey]!,
    apiKey: environment[definition.apiKeyKey]!,
  };
}
