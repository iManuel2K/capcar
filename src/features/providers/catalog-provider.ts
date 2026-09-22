import { evaluateFitment } from "@/features/parts/fitment";
import { partCatalog } from "@/features/parts/part-catalog";
import {
  getExternalProviderConnection,
  getProviderStatus,
  type ProviderEnvironment,
} from "@/features/providers/provider-config";
import type {
  PartSearchRequest,
  PartSearchResponse,
} from "@/features/providers/provider-contracts";
import { requestExternalProvider } from "@/features/providers/external-json-provider";
import { partSearchResponseSchema } from "@/features/providers/provider-response-schema";

export interface CatalogProvider {
  search(request: PartSearchRequest): Promise<PartSearchResponse>;
}

class DemoCatalogProvider implements CatalogProvider {
  async search(request: PartSearchRequest): Promise<PartSearchResponse> {
    const query = request.query?.trim().toLowerCase() ?? "";
    const results = partCatalog
      .filter((part) => {
        const searchable =
          `${part.name} ${part.brand} ${part.partNumber} ${part.category}`.toLowerCase();
        return (
          (!query || searchable.includes(query)) &&
          (!request.category ||
            request.category === "All" ||
            part.category === request.category)
        );
      })
      .map((part) => ({
        part,
        fitment: evaluateFitment(part, request.vehicle),
      }));

    return {
      provider: "CapCar catalogue demo",
      source: "demo",
      results,
      warnings: [
        "Catalogue products, identifiers and fitment rules are fictional.",
      ],
    };
  }
}

class ExternalCatalogProvider implements CatalogProvider {
  constructor(
    private readonly connection: {
      endpoint: string;
      apiKey: string;
      providerName: string;
    },
  ) {}

  async search(request: PartSearchRequest): Promise<PartSearchResponse> {
    const response = await requestExternalProvider<
      PartSearchRequest,
      PartSearchResponse
    >(this.connection, request);
    return partSearchResponseSchema.parse({
      ...response,
      provider: this.connection.providerName,
      source: "external",
    });
  }
}

export function createCatalogProvider(
  environment: ProviderEnvironment = process.env,
): CatalogProvider {
  const status = getProviderStatus("catalog", environment);
  const connection = getExternalProviderConnection("catalog", environment);
  if (status.mode === "external") {
    if (!connection)
      throw new Error("External catalogue provider is not fully configured.");
    return new ExternalCatalogProvider(connection);
  }
  return new DemoCatalogProvider();
}
