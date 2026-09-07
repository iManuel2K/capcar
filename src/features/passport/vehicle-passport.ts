import { readBuildState } from "@/features/builds/build-storage";
import { readDiagnostics } from "@/features/diagnostics/diagnostic-storage";
import { maintenanceCatalog } from "@/features/maintenance/maintenance-catalog";
import { readMaintenanceRecords } from "@/features/maintenance/maintenance-storage";
import { readInstallStamps } from "@/features/specialists/install-stamp-storage";
import { findVehicle } from "@/features/vehicles/vehicle-storage";
import { findCatalogPart } from "@/features/parts/part-catalog";
import { evaluateFitment } from "@/features/parts/fitment";

type ReadableStorage = Pick<Storage, "getItem">;

export type VehiclePassportPayload = {
  version: 1;
  generatedAt: string;
  vehicle: {
    id: string;
    make: string;
    model: string;
    productionYear: number;
    platform: string;
    engineCode: string;
    transmission: string;
    mileage: number;
    vinLastFive?: string;
  };
  maintenance: Array<{ title: string; completedDate: string; mileage: number }>;
  modifications: Array<{ title: string; status: string; cost: number; selectedMerchant?: string; fitment: string; verification: string }>;
  diagnostics: Array<{ code: string; title: string; status: string; mileage: number; resolution?: string }>;
  installStamps: Array<{ work: string; specialist: string; installedAt: string; verification: string }>;
};

export function buildVehiclePassport(
  vehicleId: string,
  storage: ReadableStorage,
  now = new Date().toISOString(),
): VehiclePassportPayload | undefined {
  const vehicle = findVehicle(vehicleId, storage);
  if (!vehicle) return undefined;
  const maintenance = readMaintenanceRecords(storage)
    .filter((item) => item.vehicleId === vehicleId)
    .map((item) => ({
      title: maintenanceCatalog.find((template) => template.key === item.taskKey)?.title ?? item.taskKey,
      completedDate: item.lastCompletedDate,
      mileage: item.lastCompletedMileage,
    }));
  const buildState = readBuildState(storage);
  const buildIds = new Set(buildState.builds.filter((item) => item.vehicleId === vehicleId).map((item) => item.id));
  return {
    version: 1,
    generatedAt: now,
    vehicle: {
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      productionYear: vehicle.productionYear,
      platform: vehicle.platform,
      engineCode: vehicle.engineCode,
      transmission: vehicle.transmission,
      mileage: vehicle.mileage,
      vinLastFive: vehicle.vin?.slice(-5),
    },
    maintenance,
    modifications: buildState.items.filter((item) => buildIds.has(item.buildId)).map((item) => {
      const catalogPart = item.catalogPartId ? findCatalogPart(item.catalogPartId) : undefined;
      const fitment = catalogPart ? evaluateFitment(catalogPart, vehicle).label : "No structured fitment record";
      return {
        title: item.title,
        status: item.status,
        cost: item.deliveredPrice ?? item.estimatedCost,
        selectedMerchant: item.merchantName,
        fitment,
        verification: item.status === "installed" ? "Owner-recorded installation" : "Planning record",
      };
    }),
    diagnostics: readDiagnostics(storage).filter((item) => item.vehicleId === vehicleId).map((item) => ({ code: item.code, title: item.title, status: item.status, mileage: item.mileage, resolution: item.resolution })),
    installStamps: readInstallStamps(storage).filter((item) => item.vehicleId === vehicleId).map((item) => ({ work: item.work, specialist: item.specialistName, installedAt: item.installedAt, verification: item.verification })),
  };
}

export function passportToCsv(passport: VehiclePassportPayload) {
  const rows: string[][] = [["record_type", "date_or_status", "title", "mileage", "cost_or_source", "detail"]];
  for (const item of passport.maintenance) rows.push(["maintenance", item.completedDate, item.title, String(item.mileage), "", ""]);
  for (const item of passport.modifications) rows.push(["modification", item.status, item.title, "", String(item.cost), `${item.fitment} · ${item.verification}${item.selectedMerchant ? ` · ${item.selectedMerchant}` : ""}`]);
  for (const item of passport.diagnostics) rows.push(["diagnostic", item.status, `${item.code} · ${item.title}`, String(item.mileage), "", item.resolution ?? ""]);
  for (const item of passport.installStamps) rows.push(["install_stamp", item.installedAt, item.work, "", item.specialist, item.verification]);
  return rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
}
