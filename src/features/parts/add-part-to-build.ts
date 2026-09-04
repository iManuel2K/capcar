import {
  createBuildItem,
  readBuildState,
} from "@/features/builds/build-storage";
import type { CatalogPart } from "@/features/parts/part-catalog";

type WritableStorage = Pick<Storage, "getItem" | "setItem">;

export function addCatalogPartToBuild(
  part: CatalogPart,
  buildId: string,
  storage: WritableStorage,
) {
  const duplicate = readBuildState(storage).items.some(
    (item) => item.buildId === buildId && item.catalogPartId === part.id,
  );
  if (duplicate) return { status: "duplicate" as const };

  const item = createBuildItem(
    {
      buildId,
      title: part.name,
      note: `Demo catalogue ${part.partNumber}. Fitment and road approval require verification.`,
      catalogPartId: part.id,
      stage: part.buildStage,
      priority: "next",
      estimatedCost: part.estimatedPrice,
      status: "planned",
    },
    storage,
  );
  return { status: "added" as const, item };
}
