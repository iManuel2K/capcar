import { NextResponse } from "next/server";

import { createVehicleDataProvider } from "@/features/vehicle-data/vehicle-data-provider";
import { vehicleDataRequestSchema } from "@/features/vehicle-data/vehicle-data-schema";
import {
  guardProductApi,
  productApiError,
  readJsonRequest,
} from "@/lib/api/guard";

export async function POST(request: Request) {
  const guard = await guardProductApi("vehicle-resolve", { limit: 15 });
  if (!guard.ok) return guard.response;
  try {
    const input = await readJsonRequest(request, vehicleDataRequestSchema);
    const result = await createVehicleDataProvider().resolve(input);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return productApiError(error, "Vehicle resolution failed.");
  }
}
