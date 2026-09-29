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

const normalized = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "");

function recordMatchesRequest(
  record: z.infer<typeof evidenceSchema>,
  input: FitmentResolutionRequest,
) {
  return (
    normalized(record.partNumber) === normalized(input.partNumber) &&
    normalized(record.make) === normalized(input.vehicle.make) &&
    normalized(record.platform) === normalized(input.vehicle.platform) &&
    normalized(record.engineCode) === normalized(input.vehicle.engineCode) &&
    normalized(record.bodyStyle) === normalized(input.vehicle.bodyStyle) &&
    normalized(record.transmission) ===
      normalized(input.vehicle.transmission) &&
    record.yearFrom <= input.vehicle.productionYear &&
    record.yearTo >= input.vehicle.productionYear
  );
}

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
  const records = response.records.map((record) =>
    evidenceSchema.parse({
      ...(record && typeof record === "object" ? record : {}),
      id: crypto.randomUUID(),
      kind: "manufacturer",
      capturedBy: "provider",
      recordedAt: response.checkedAt ?? checkedAt,
    }),
  );
  const exactRecords = records.filter((record) =>
    recordMatchesRequest(record, input),
  );
  const ignored = records.length - exactRecords.length;
  return {
    provider: response.provider?.trim() || provider,
    checkedAt: response.checkedAt ?? checkedAt,
    warnings: [
      ...response.warnings,
      ...(ignored
        ? [
            `${ignored} provider record${ignored === 1 ? " was" : "s were"} ignored because its part number or vehicle scope did not exactly match.`,
          ]
        : []),
    ],
    records: exactRecords,
  };
}
