import { z } from "zod";

import { requestExternalProvider } from "@/features/providers/external-json-provider";
import {
  evaluateRetailVehicleMatch,
  retailApplicabilitySchema,
  safeRetailUrl,
  type RetailRequest,
  type RetailResponse,
} from "@/features/retail/retail-contracts";

const responseSchema = z.object({
  checkedAt: z.iso.datetime().optional(),
  hasMore: z.boolean().default(false),
  warning: z.string().max(500).default("Confirm fitment and checkout totals."),
  items: z
    .array(
      z.object({
        id: z.string().min(1).max(220),
        title: z.string().min(2).max(500),
        price: z.number().finite().nonnegative(),
        currency: z.enum(["EUR", "GBP", "USD"]),
        shipping: z.number().finite().nonnegative().nullable(),
        country: z.string().max(3).nullable(),
        condition: z.string().min(1).max(80),
        url: z.string().refine(safeRetailUrl),
        fitment: retailApplicabilitySchema.optional(),
      }),
    )
    .max(50),
});

export function getPartnerRetailConnection(
  environment: Record<string, string | undefined> = process.env,
) {
  const name = environment.CAPCAR_RETAIL_PARTNER_NAME?.trim();
  const endpoint = environment.CAPCAR_RETAIL_PARTNER_ENDPOINT?.trim();
  const apiKey = environment.CAPCAR_RETAIL_PARTNER_API_KEY?.trim();
  if (!name && !endpoint && !apiKey) return undefined;
  if (!name || !endpoint || !apiKey)
    throw new Error("The partner retailer adapter is only partly configured.");
  if (!safeRetailUrl(endpoint))
    throw new Error(
      "The partner retailer endpoint must be a public HTTPS URL.",
    );
  return { name: name.slice(0, 80), endpoint, apiKey };
}

export async function searchPartnerRetailer(
  input: RetailRequest,
  environment: Record<string, string | undefined> = process.env,
): Promise<RetailResponse | undefined> {
  const connection = getPartnerRetailConnection(environment);
  if (!connection) return undefined;
  const payload = responseSchema.parse(
    await requestExternalProvider<RetailRequest, unknown>(connection, input),
  );
  return {
    source: "partner",
    checkedAt: payload.checkedAt ?? new Date().toISOString(),
    hasMore: payload.hasMore,
    warning: payload.warning,
    providers: [{ id: "partner", label: connection.name, status: "available" }],
    items: payload.items.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      currency: item.currency,
      shipping: item.shipping,
      country: item.country,
      condition: item.condition,
      url: item.url,
      affiliate: false,
      retailer: connection.name,
      provider: "partner",
      providerItemId: item.id,
      vehicleMatch: evaluateRetailVehicleMatch(input.vehicle, item.fitment),
    })),
  };
}
