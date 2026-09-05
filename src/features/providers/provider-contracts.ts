import type { FitmentResult } from "@/features/parts/fitment";
import type { CatalogPart, PartCategory } from "@/features/parts/part-catalog";
import type { RankedOffer } from "@/features/offers/offer-catalog";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";

export type ProviderMode = "demo" | "external";
export type ProviderDomain = "vehicle" | "catalog" | "offers" | "models";

export type ProviderStatus = {
  domain: ProviderDomain;
  label: string;
  mode: ProviderMode;
  configured: boolean;
  providerName: string;
  message: string;
};

export type VehicleDataRequest = Pick<
  Vehicle,
  | "vin"
  | "make"
  | "model"
  | "productionYear"
  | "platform"
  | "bodyStyle"
  | "engineCode"
  | "transmission"
>;

export type ResolvedVehicleData = {
  provider: string;
  source: "demo" | "external";
  confidence: "provided" | "partial" | "verified";
  resolvedAt: string;
  identity: VehicleDataRequest;
  bmwIdentity: {
    vinStatus: "missing" | "format-only" | "decoded";
    productionDate?: string;
    typeCode?: string;
    market?: string;
    steering?: "left" | "right";
    fuelType?: "petrol" | "diesel" | "hybrid" | "electric" | "unknown";
    displacementCc?: number;
    powerKw?: number;
    transmissionCode?: string;
    paintCode?: string;
    optionCodes: string[];
    catalogVehicleId?: string;
  };
  fieldSources: Array<{
    field: string;
    source: "user" | "vin-provider" | "catalog-provider";
    verified: boolean;
  }>;
  evidence: string[];
  warnings: string[];
};

export type PartSearchRequest = {
  vehicle: VehicleDataRequest;
  query?: string;
  category?: "All" | PartCategory;
};

export type ProviderPartResult = {
  part: CatalogPart;
  fitment: FitmentResult;
};

export type PartSearchResponse = {
  provider: string;
  source: "demo" | "external";
  results: ProviderPartResult[];
  warnings: string[];
};

export type OfferSearchRequest = {
  partId: string;
  quantity: number;
  destinationCountry: string;
  currency: "EUR";
};

export type OfferSearchResponse = {
  provider: string;
  source: "demo" | "external";
  partId: string;
  offers: RankedOffer[];
  searchedAt: string;
  destinationCountry: string;
  currency: "EUR";
  warnings: string[];
};
