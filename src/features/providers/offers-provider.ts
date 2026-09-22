import { getOfferComparison } from "@/features/offers/offer-catalog";
import {
  getExternalProviderConnection,
  getProviderStatus,
  type ProviderEnvironment,
} from "@/features/providers/provider-config";
import type {
  OfferSearchRequest,
  OfferSearchResponse,
} from "@/features/providers/provider-contracts";
import { requestExternalProvider } from "@/features/providers/external-json-provider";
import { offerSearchResponseSchema } from "@/features/providers/provider-response-schema";

export interface OffersProvider {
  search(request: OfferSearchRequest | string): Promise<OfferSearchResponse>;
}

function normalizeRequest(
  request: OfferSearchRequest | string,
): OfferSearchRequest {
  return typeof request === "string"
    ? {
        partId: request,
        quantity: 1,
        destinationCountry: "DE",
        currency: "EUR",
      }
    : request;
}

class DemoOffersProvider implements OffersProvider {
  async search(
    input: OfferSearchRequest | string,
  ): Promise<OfferSearchResponse> {
    const request = normalizeRequest(input);
    const searchedAt = new Date().toISOString();
    return {
      provider: "CapCar offers demo",
      source: "demo",
      partId: request.partId,
      offers: getOfferComparison(request.partId, {
        quantity: request.quantity,
        searchedAt,
      }),
      searchedAt,
      destinationCountry: request.destinationCountry,
      currency: request.currency,
      warnings: [
        "Merchants, prices, availability, ratings and delivery times are fictional.",
      ],
    };
  }
}

class ExternalOffersProvider implements OffersProvider {
  constructor(
    private readonly connection: {
      endpoint: string;
      apiKey: string;
      providerName: string;
    },
  ) {}

  async search(
    input: OfferSearchRequest | string,
  ): Promise<OfferSearchResponse> {
    const request = normalizeRequest(input);
    const response = await requestExternalProvider<
      OfferSearchRequest,
      OfferSearchResponse
    >(this.connection, request);
    return offerSearchResponseSchema.parse({
      ...response,
      provider: this.connection.providerName,
      source: "external",
      partId: request.partId,
      destinationCountry: request.destinationCountry,
      currency: request.currency,
    });
  }
}

export function createOffersProvider(
  environment: ProviderEnvironment = process.env,
): OffersProvider {
  const status = getProviderStatus("offers", environment);
  const connection = getExternalProviderConnection("offers", environment);
  if (status.mode === "external") {
    if (!connection)
      throw new Error("External offers provider is not fully configured.");
    return new ExternalOffersProvider(connection);
  }
  return new DemoOffersProvider();
}
