import { RetailUnavailable, searchEbay } from "@/features/retail/ebay-provider";
import { searchPartnerRetailer } from "@/features/retail/partner-retail-provider";
import type {
  RetailRequest,
  RetailResponse,
} from "@/features/retail/retail-contracts";

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
          : "unavailable",
    retryable: !["configuration", "authorization"].includes(kind),
  };
}

export async function searchRetailers(
  input: RetailRequest,
  environment: Record<string, string | undefined> = process.env,
): Promise<RetailResponse> {
  const attempts = await Promise.allSettled([
    searchEbay(input, environment),
    searchPartnerRetailer(input, environment),
  ]);
  const results = attempts.flatMap((attempt) =>
    attempt.status === "fulfilled" && attempt.value ? [attempt.value] : [],
  );
  if (!results.length) {
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
  const providers: NonNullable<RetailResponse["providers"]> = [
    attempts[0].status === "fulfilled"
      ? { id: "ebay", label: "eBay", status: "available" }
      : unavailableProvider("ebay", "eBay", attempts[0]),
    ...(environment.CAPCAR_RETAIL_PARTNER_NAME
      ? [
          attempts[1].status === "fulfilled"
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
                attempts[1],
              ),
        ]
      : []),
  ];
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
  return {
    source: results.length > 1 ? "multi" : results[0].source,
    checkedAt: new Date().toISOString(),
    items,
    hasMore: results.some((result) => result.hasMore),
    providers,
    warning:
      "Results are normalized but currencies are not converted. Unknown delivery, tax and import charges remain unknown. Confirm fitment and the retailer checkout total.",
  };
}
