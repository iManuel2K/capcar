import type { BuildItem } from "./build-schema";

export function actualItemCost(item: BuildItem): number | undefined {
  if (item.status === "installed" && item.completion?.actualCost !== undefined)
    return item.completion.actualCost;
  const purchase = item.workbench?.purchase;
  return purchase
    ? Math.round((purchase.amount - purchase.refunded) * 100) / 100
    : undefined;
}
export function accountedItemCost(item: BuildItem) {
  const purchase = item.workbench?.purchase;
  if (purchase?.accounting === "already-recorded") return undefined;
  if (!purchase && item.completion?.accounting === "already-recorded")
    return undefined;
  return actualItemCost(item);
}
