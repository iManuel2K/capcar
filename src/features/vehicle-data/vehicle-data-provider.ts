import {
  getExternalProviderConnection,
  getProviderStatus,
  type ProviderEnvironment,
} from "@/features/providers/provider-config";
import type {
  ResolvedVehicleData,
  VehicleDataRequest,
} from "@/features/providers/provider-contracts";
import { requestExternalProvider } from "@/features/providers/external-json-provider";
import { resolvedVehicleDataSchema } from "@/features/vehicle-data/vehicle-data-schema";

export interface VehicleDataProvider {
  resolve(request: VehicleDataRequest): Promise<ResolvedVehicleData>;
}

class DemoVehicleDataProvider implements VehicleDataProvider {
  async resolve(request: VehicleDataRequest): Promise<ResolvedVehicleData> {
    const suppliedFields = [
      "model",
      "productionYear",
      "platform",
      "bodyStyle",
      "engineCode",
      "transmission",
    ];
    return {
      provider: "Capcar vehicle demo",
      source: "demo",
      confidence: request.vin ? "partial" : "provided",
      resolvedAt: new Date().toISOString(),
      identity: {
        ...request,
        platform: request.platform.toUpperCase(),
        engineCode: request.engineCode.toUpperCase(),
      },
      bmwIdentity: {
        vinStatus: request.vin ? "format-only" : "missing",
        optionCodes: [],
      },
      fieldSources: suppliedFields.map((field) => ({
        field,
        source: "user" as const,
        verified: false,
      })),
      evidence: [
        "Identity was normalized from the vehicle profile stored in this browser.",
        request.vin
          ? "VIN format was supplied, but it was not decoded by an external source."
          : "No VIN was supplied; the result relies on manually entered attributes.",
      ],
      warnings: [
        "This result is not a BMW VIN decode or authoritative fitment record.",
        "Confirm production date, option codes and market before ordering parts.",
      ],
    };
  }
}

class ExternalVehicleDataProvider implements VehicleDataProvider {
  constructor(
    private readonly connection: {
      endpoint: string;
      apiKey: string;
      providerName: string;
    },
  ) {}

  async resolve(request: VehicleDataRequest): Promise<ResolvedVehicleData> {
    const response = await requestExternalProvider<
      VehicleDataRequest,
      ResolvedVehicleData
    >(this.connection, request);
    return resolvedVehicleDataSchema.parse({
      ...response,
      provider: this.connection.providerName,
      source: "external",
    });
  }
}

export function createVehicleDataProvider(
  environment: ProviderEnvironment = process.env,
): VehicleDataProvider {
  const status = getProviderStatus("vehicle", environment);
  const connection = getExternalProviderConnection("vehicle", environment);
  if (status.mode === "external") {
    if (!connection)
      throw new Error("External vehicle provider is not fully configured.");
    return new ExternalVehicleDataProvider(connection);
  }
  return new DemoVehicleDataProvider();
}
