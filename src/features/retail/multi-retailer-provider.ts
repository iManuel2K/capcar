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
  onPartial?: (result: RetailResponse) => void,
): Promise<RetailResponse> {
  const cacheKey = JSON.stringify(input);
  const requests = [
    searchEbay(input, environment),
    searchPartnerRetailer(input, environment),
  ];
  let settled = 0;
  const attempts = await Promise.allSettled(
    requests.map(async (request, index) => {
      let result: RetailResponse | undefined;
      try {
        result = await request;
      } finally {
        settled += 1;
      }
      if (
        onPartial &&
        settled < requests.length &&
        result?.items.length &&
        environment.CAPCAR_RETAIL_PARTNER_NAME
      ) {
        onPartial(
          liveResponse(
            input.sort,
            [result],
            [
              {
                id: index === 0 ? "ebay" : "partner",
                label:
                  index === 0
                    ? "eBay"
                    : environment.CAPCAR_RETAIL_PARTNER_NAME.trim().slice(
                        0,
                        80,
                      ),
                status: "available",
              },
            ],
          ),
        );
      }
      return result;
    }),
  );
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
  const response = liveResponse(
    input.sort,
    results,
    providerStatuses(attempts, environment),
  );
  if (successfulSearches.size >= MAX_CACHE_ENTRIES) {
    const oldest = successfulSearches.keys().next().value;
    if (oldest) successfulSearches.delete(oldest);
  }
  successfulSearches.set(cacheKey, { response, storedAt: Date.now() });
  return response;
}

function liveResponse(
  sort: RetailRequest["sort"],
  results: RetailResponse[],
  providers: NonNullable<RetailResponse["providers"]>,
): RetailResponse {
  const combined = results.flatMap((result) => result.items);
  // Providers can sort their own listings by age. The normalized response
  // does not carry dates that could establish an order across retailers.
  const items =
    results.length === 1 || sort === "newest"
      ? combined
      : sortByPrice(combined, sort === "priceDesc");
  return {
    source: results.length > 1 ? "multi" : results[0].source,
    checkedAt: new Date().toISOString(),
    items: items.slice(0, 60),
    hasMore: results.some((result) => result.hasMore),
    freshness: "live",
    providers,
    warning:
      "Results are normalized but currencies are not converted. Unknown delivery, tax and import charges remain unknown. Confirm fitment and the retailer checkout total.",
  };
}

function sortByPrice(items: RetailResponse["items"], descending: boolean) {
  const currencies = new Map<string, RetailResponse["items"]>();
  for (const item of items) {
    const group = currencies.get(item.currency);
    if (group) group.push(item);
    else currencies.set(item.currency, [item]);
  }
  return [...currencies.values()].flatMap((group) =>
    group.sort((left, right) => {
      if (left.shipping === null) return right.shipping === null ? 0 : 1;
      if (right.shipping === null) return -1;
      const difference =
        left.price + left.shipping - right.price - right.shipping;
      return descending ? -difference : difference;
    }),
  );
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
