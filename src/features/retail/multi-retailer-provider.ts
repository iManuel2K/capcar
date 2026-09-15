import { RetailUnavailable, searchEbay } from "@/features/retail/ebay-provider";
import { searchPartnerRetailer } from "@/features/retail/partner-retail-provider";
import type {
  RetailRequest,
  RetailResponse,
} from "@/features/retail/retail-contracts";

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
    {
      id: "ebay",
      label: "eBay",
      status: attempts[0].status === "fulfilled" ? "available" : "unavailable",
    },
    ...(environment.CAPCAR_RETAIL_PARTNER_NAME
      ? [
          {
            id: "partner" as const,
            label: environment.CAPCAR_RETAIL_PARTNER_NAME.trim().slice(0, 80),
            status:
              attempts[1].status === "fulfilled"
                ? ("available" as const)
                : ("unavailable" as const),
          },
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
