import { z } from "zod";

import { evidenceSchema } from "@/features/builds/build-workbench-schema";
import { requestExternalProvider } from "@/features/providers/external-json-provider";
import { vehicleDataRequestSchema } from "@/features/vehicle-data/vehicle-data-schema";
import { safeRetailUrl } from "@/features/retail/retail-contracts";

export const fitmentResolutionRequestSchema = z.object({
  vehicle: vehicleDataRequestSchema,
  partNumber: z.string().trim().min(2).max(80),
});

const providerResponseSchema = z.object({
  provider: z.string().max(80).optional(),
  checkedAt: z.iso.datetime().optional(),
  records: z.unknown().array().max(10),
  warnings: z.string().max(300).array().max(10).default([]),
});

export type FitmentResolutionRequest = z.infer<
  typeof fitmentResolutionRequestSchema
>;
export type FitmentResolution = {
  provider: string;
  checkedAt: string;
  records: Array<z.infer<typeof evidenceSchema>>;
  warnings: string[];
};

export class FitmentProviderUnavailable extends Error {}

export async function resolveConnectedFitment(
  input: FitmentResolutionRequest,
  environment: Record<string, string | undefined> = process.env,
): Promise<FitmentResolution> {
  const provider = environment.CAPCAR_FITMENT_PROVIDER_NAME?.trim();
  const endpoint = environment.CAPCAR_FITMENT_PROVIDER_ENDPOINT?.trim();
  const apiKey = environment.CAPCAR_FITMENT_PROVIDER_API_KEY?.trim();
  if (!provider || !endpoint || !apiKey)
    throw new FitmentProviderUnavailable(
      "Connected fitment data is not configured.",
    );
  if (!safeRetailUrl(endpoint))
    throw new FitmentProviderUnavailable(
      "The fitment provider endpoint must use HTTPS.",
    );
  const checkedAt = new Date().toISOString();
  const response = providerResponseSchema.parse(
    await requestExternalProvider<FitmentResolutionRequest, unknown>(
      { endpoint, apiKey },
      input,
    ),
  );
  return {
    provider: response.provider?.trim() || provider,
    checkedAt: response.checkedAt ?? checkedAt,
    warnings: response.warnings,
    records: response.records.map((record) =>
      evidenceSchema.parse({
        ...(record && typeof record === "object" ? record : {}),
        id: crypto.randomUUID(),
        kind: "manufacturer",
        capturedBy: "provider",
        recordedAt: response.checkedAt ?? checkedAt,
      }),
    ),
  };
}
