import { RetailUnavailable, searchEbay } from "@/features/retail/ebay-provider";
import { searchPartnerRetailer } from "@/features/retail/partner-retail-provider";
import type {
  RetailRequest,
  RetailResponse,
} from "@/features/retail/retail-contracts";

const STALE_RESULT_TTL_MS = 15 * 60 * 1_000;
const MAX_CACHE_ENTRIES = 40;
const successfulSearches = new Map<
  string,
  { response: RetailResponse; storedAt: number }
>();

function unavailableProvider(
  id: "ebay" | "partner",
  label: string,
  attempt: PromiseSettledResult<RetailResponse | undefined>,
): NonNullable<RetailResponse["providers"]>[number] {
  const kind =
    attempt.status === "rejected" && attempt.reason instanceof RetailUnavailable
      ? attempt.reason.kind
      : "unavailable";
  return {
    id,
    label,
    status: "unavailable",
    code:
      kind === "configuration" || kind === "authorization"
        ? "access"
        : kind === "rate_limit"
          ? "limit"
          : kind === "timeout"
            ? "timeout"
            : "unavailable",
    retryable: !["configuration", "authorization"].includes(kind),
  };
}

export async function searchRetailers(
  input: RetailRequest,
  environment: Record<string, string | undefined> = process.env,
): Promise<RetailResponse> {
  const cacheKey = JSON.stringify(input);
  const attempts = await Promise.allSettled([
    searchEbay(input, environment),
    searchPartnerRetailer(input, environment),
  ]);
  const results = attempts.flatMap((attempt) =>
    attempt.status === "fulfilled" && attempt.value ? [attempt.value] : [],
  );
  if (!results.length) {
    const stale = successfulSearches.get(cacheKey);
    if (stale && Date.now() - stale.storedAt <= STALE_RESULT_TTL_MS) {
      return {
        ...stale.response,
        freshness: "stale",
        providers: providerStatuses(attempts, environment),
        warning:
          "Live retailers are temporarily unavailable. These are the last successful listings for this exact search; recheck price, availability, fitment and checkout totals at the retailer.",
      };
    }
    const rejected = attempts.find(
      (attempt): attempt is PromiseRejectedResult =>
        attempt.status === "rejected",
    );
    if (rejected?.reason instanceof RetailUnavailable) throw rejected.reason;
    throw new RetailUnavailable(
      rejected?.reason instanceof Error
        ? rejected.reason.message
        : "No retailer provider is available.",
    );
  }
  const providers = providerStatuses(attempts, environment);
  const items = results
    .flatMap((result) => result.items)
    .toSorted((left, right) => {
      const leftTotal =
        left.shipping === null ? Infinity : left.price + left.shipping;
      const rightTotal =
        right.shipping === null ? Infinity : right.price + right.shipping;
      return leftTotal - rightTotal;
    })
    .slice(0, 60);
  const response: RetailResponse = {
    source: results.length > 1 ? "multi" : results[0].source,
    checkedAt: new Date().toISOString(),
    items,
    hasMore: results.some((result) => result.hasMore),
    freshness: "live",
    providers,
    warning:
      "Results are normalized but currencies are not converted. Unknown delivery, tax and import charges remain unknown. Confirm fitment and the retailer checkout total.",
  };
  if (successfulSearches.size >= MAX_CACHE_ENTRIES) {
    const oldest = successfulSearches.keys().next().value;
    if (oldest) successfulSearches.delete(oldest);
  }
  successfulSearches.set(cacheKey, { response, storedAt: Date.now() });
  return response;
}

function providerStatuses(
  attempts: PromiseSettledResult<RetailResponse | undefined>[],
  environment: Record<string, string | undefined>,
): NonNullable<RetailResponse["providers"]> {
  return [
    attempts[0]?.status === "fulfilled" && attempts[0].value
      ? { id: "ebay", label: "eBay", status: "available" }
      : unavailableProvider("ebay", "eBay", attempts[0]!),
    ...(environment.CAPCAR_RETAIL_PARTNER_NAME
      ? [
          attempts[1]?.status === "fulfilled" && attempts[1].value
            ? {
                id: "partner" as const,
                label: environment.CAPCAR_RETAIL_PARTNER_NAME.trim().slice(
                  0,
                  80,
                ),
                status: "available" as const,
              }
            : unavailableProvider(
                "partner",
                environment.CAPCAR_RETAIL_PARTNER_NAME.trim().slice(0, 80),
                attempts[1]!,
              ),
        ]
      : []),
  ];
}
