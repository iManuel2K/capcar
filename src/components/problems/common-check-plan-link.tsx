import Link from "next/link";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import type { AppLocale } from "@/i18n/config";
import { commonChecksForVehicle } from "@/features/problems/common-checks";
import { commonCheckCopy } from "@/features/problems/common-check-copy";
import { commonCheckItemId } from "@/features/problems/common-check-plan";

export function CommonCheckPlanLink({
  vehicle,
  itemId,
  locale,
}: {
  vehicle: Vehicle;
  itemId: string;
  locale: AppLocale;
}) {
  const check = commonChecksForVehicle(vehicle).find(
    (entry) => commonCheckItemId(vehicle.id, entry.id) === itemId,
  );
  return check ? (
    <Link
      href={`/garage/${encodeURIComponent(vehicle.id)}/known-problems#check-${check.id}`}
      className="text-primary mt-2 inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:outline-2"
    >
      {commonCheckCopy[locale].openCheck}
    </Link>
  ) : null;
}
