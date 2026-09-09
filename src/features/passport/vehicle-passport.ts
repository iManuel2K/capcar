import { z } from "zod";

import { readBuildState } from "@/features/builds/build-storage";
import { readDiagnostics } from "@/features/diagnostics/diagnostic-storage";
import { maintenanceCatalog } from "@/features/maintenance/maintenance-catalog";
import { readMaintenanceRecords } from "@/features/maintenance/maintenance-storage";
import { readInstallStamps } from "@/features/specialists/install-stamp-storage";
import { findVehicle } from "@/features/vehicles/vehicle-storage";
import { findCatalogPart } from "@/features/parts/part-catalog";
import { evaluateFitment } from "@/features/parts/fitment";

type ReadableStorage = Pick<Storage, "getItem">;

export const PASSPORT_PROFILE_STORAGE_KEY = "capcar.passport-profiles.v1";

export const passportProfileSchema = z.object({
  vehicleId: z.string().min(1),
  ownerName: z.string().trim().max(120).optional(),
  ownerAddress: z.string().trim().max(300).optional(),
  ownerPhone: z.string().trim().max(40).optional(),
  nextInspectionDate: z.string().date().optional(),
  insuranceCompany: z.string().trim().max(120).optional(),
  insurancePolicyNumber: z.string().trim().max(120).optional(),
  publishOwnerDetails: z.boolean().default(false),
  includeFullVin: z.boolean().default(false),
});

export type PassportProfile = z.infer<typeof passportProfileSchema>;

export const vehiclePassportSchema = z.object({
  version: z.literal(1),
  generatedAt: z.string().datetime(),
  vehicle: z.object({
    id: z.string().min(1),
    make: z.string().min(1),
    model: z.string().min(1),
    productionYear: z.number().int(),
    platform: z.string().min(1),
    engineCode: z.string().min(1),
    transmission: z.string().min(1),
    mileage: z.number().nonnegative(),
    vin: z.string().length(17).optional(),
    vinLastFive: z.string().max(5).optional(),
    imageUrl: z.string().startsWith("/").optional(),
  }),
  owner: z
    .object({
      name: z.string().min(1).max(120),
      address: z.string().min(1).max(300),
      phone: z.string().min(1).max(40),
    })
    .optional(),
  official: z
    .object({
      nextInspectionDate: z.string().date().optional(),
      insuranceCompany: z.string().min(1).max(120).optional(),
      insurancePolicyNumber: z.string().min(1).max(120).optional(),
    })
    .optional(),
  maintenance: z.array(
    z.object({
      title: z.string().min(1),
      completedDate: z.string().min(1),
      mileage: z.number().nonnegative(),
    }),
  ),
  modifications: z.array(
    z.object({
      title: z.string().min(1),
      status: z.string().min(1),
      cost: z.number().nonnegative(),
      selectedMerchant: z.string().min(1).optional(),
      fitment: z.string().min(1),
      verification: z.string().min(1),
    }),
  ),
  diagnostics: z.array(
    z.object({
      code: z.string().min(1),
      title: z.string().min(1),
      status: z.string().min(1),
      mileage: z.number().nonnegative(),
      resolution: z.string().min(1).optional(),
    }),
  ),
  installStamps: z.array(
    z.object({
      work: z.string().min(1),
      specialist: z.string().min(1),
      installedAt: z.string().min(1),
      verification: z.string().min(1),
    }),
  ),
});

export type VehiclePassportPayload = z.infer<typeof vehiclePassportSchema>;

export function readPassportProfile(
  vehicleId: string,
  storage: ReadableStorage,
): PassportProfile | undefined {
  const raw = storage.getItem(PASSPORT_PROFILE_STORAGE_KEY);
  if (!raw) return undefined;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return undefined;
  }
  const parsed = passportProfileSchema.array().safeParse(value);
  return parsed.success
    ? parsed.data.find((profile) => profile.vehicleId === vehicleId)
    : undefined;
}

export function savePassportProfile(
  input: PassportProfile,
  storage: Pick<Storage, "getItem" | "setItem">,
) {
  const profile = passportProfileSchema.parse(input);
  const raw = storage.getItem(PASSPORT_PROFILE_STORAGE_KEY);
  let value: unknown;
  try {
    value = raw ? JSON.parse(raw) : undefined;
  } catch {
    value = undefined;
  }
  const parsed = value
    ? passportProfileSchema.array().safeParse(value)
    : undefined;
  const profiles = parsed?.success ? parsed.data : [];
  storage.setItem(
    PASSPORT_PROFILE_STORAGE_KEY,
    JSON.stringify([
      profile,
      ...profiles.filter((item) => item.vehicleId !== profile.vehicleId),
    ]),
  );
  return profile;
}

export function buildVehiclePassport(
  vehicleId: string,
  storage: ReadableStorage,
  now = new Date().toISOString(),
): VehiclePassportPayload | undefined {
  const vehicle = findVehicle(vehicleId, storage);
  if (!vehicle) return undefined;
  const profile = readPassportProfile(vehicleId, storage);
  const maintenance = readMaintenanceRecords(storage)
    .filter((item) => item.vehicleId === vehicleId)
    .map((item) => ({
      title:
        maintenanceCatalog.find((template) => template.key === item.taskKey)
          ?.title ?? item.taskKey,
      completedDate: item.lastCompletedDate,
      mileage: item.lastCompletedMileage,
    }));
  const buildState = readBuildState(storage);
  const buildIds = new Set(
    buildState.builds
      .filter((item) => item.vehicleId === vehicleId)
      .map((item) => item.id),
  );
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
      vin: profile?.includeFullVin ? vehicle.vin : undefined,
      vinLastFive: vehicle.vin?.slice(-5),
      imageUrl: vehicle.imageUrl,
    },
    owner:
      profile?.publishOwnerDetails &&
      profile.ownerName &&
      profile.ownerAddress &&
      profile.ownerPhone
        ? {
            name: profile.ownerName,
            address: profile.ownerAddress,
            phone: profile.ownerPhone,
          }
        : undefined,
    official: profile
      ? {
          nextInspectionDate: profile.nextInspectionDate,
          insuranceCompany: profile.insuranceCompany,
          insurancePolicyNumber: profile.insurancePolicyNumber,
        }
      : undefined,
    maintenance,
    modifications: buildState.items
      .filter((item) => buildIds.has(item.buildId))
      .map((item) => {
        const catalogPart = item.catalogPartId
          ? findCatalogPart(item.catalogPartId)
          : undefined;
        const fitment = catalogPart
          ? evaluateFitment(catalogPart, vehicle).label
          : "No structured fitment record";
        return {
          title: item.title,
          status: item.status,
          cost: item.deliveredPrice ?? item.estimatedCost,
          selectedMerchant: item.merchantName,
          fitment,
          verification:
            item.status === "installed"
              ? "Owner-recorded installation"
              : "Planning record",
        };
      }),
    diagnostics: readDiagnostics(storage)
      .filter((item) => item.vehicleId === vehicleId)
      .map((item) => ({
        code: item.code,
        title: item.title,
        status: item.status,
        mileage: item.mileage,
        resolution: item.resolution,
      })),
    installStamps: readInstallStamps(storage)
      .filter((item) => item.vehicleId === vehicleId)
      .map((item) => ({
        work: item.work,
        specialist: item.specialistName,
        installedAt: item.installedAt,
        verification: item.verification,
      })),
  };
}

export function passportToCsv(passport: VehiclePassportPayload) {
  const rows: string[][] = [
    [
      "record_type",
      "date_or_status",
      "title",
      "mileage",
      "cost_or_source",
      "detail",
    ],
  ];
  for (const item of passport.maintenance)
    rows.push([
      "maintenance",
      item.completedDate,
      item.title,
      String(item.mileage),
      "",
      "",
    ]);
  for (const item of passport.modifications)
    rows.push([
      "modification",
      item.status,
      item.title,
      "",
      String(item.cost),
      `${item.fitment} · ${item.verification}${item.selectedMerchant ? ` · ${item.selectedMerchant}` : ""}`,
    ]);
  for (const item of passport.diagnostics)
    rows.push([
      "diagnostic",
      item.status,
      `${item.code} · ${item.title}`,
      String(item.mileage),
      "",
      item.resolution ?? "",
    ]);
  for (const item of passport.installStamps)
    rows.push([
      "install_stamp",
      item.installedAt,
      item.work,
      "",
      item.specialist,
      item.verification,
    ]);
  return rows
    .map((row) =>
      row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
}
