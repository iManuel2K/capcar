import { requestExternalProvider } from "@/features/providers/external-json-provider";
import {
  getExternalProviderConnection,
  getProviderStatus,
  type ProviderEnvironment,
} from "@/features/providers/provider-config";
import { createReferenceVehicleModel } from "@/features/visualizer/reference-vehicle-model";
import {
  vehicleModelSchema,
  type VehicleModel,
  type VehicleModelRequest,
} from "@/features/visualizer/vehicle-model-schema";

export interface VehicleModelProvider {
  resolve(request: VehicleModelRequest): Promise<VehicleModel>;
}

class ReferenceVehicleModelProvider implements VehicleModelProvider {
  async resolve(request: VehicleModelRequest) {
    return createReferenceVehicleModel(request.vehicle);
  }
}

class ExternalVehicleModelProvider implements VehicleModelProvider {
  constructor(
    private readonly connection: {
      endpoint: string;
      apiKey: string;
      providerName: string;
    },
  ) {}

  async resolve(request: VehicleModelRequest) {
    const response = await requestExternalProvider<
      VehicleModelRequest,
      VehicleModel
    >(this.connection, request);
    return vehicleModelSchema.parse({
      ...response,
      provider: this.connection.providerName,
      source: "external",
    });
  }
}

export function createVehicleModelProvider(
  environment: ProviderEnvironment = process.env,
): VehicleModelProvider {
  const status = getProviderStatus("models", environment);
  const connection = getExternalProviderConnection("models", environment);
  if (status.mode === "external") {
    if (!connection)
      throw new Error(
        "External vehicle model provider is not fully configured.",
      );
    return new ExternalVehicleModelProvider(connection);
  }
  return new ReferenceVehicleModelProvider();
}
