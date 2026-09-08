import { NextResponse } from "next/server";

import { createVehicleModelProvider } from "@/features/visualizer/vehicle-model-provider";
import { vehicleModelRequestSchema } from "@/features/visualizer/vehicle-model-schema";
import {
  guardProductApi,
  productApiError,
  readJsonRequest,
} from "@/lib/api/guard";

export async function POST(request: Request) {
  const guard = await guardProductApi("vehicle-model", { limit: 15 });
  if (!guard.ok) return guard.response;
  try {
    const input = await readJsonRequest(request, vehicleModelRequestSchema);
    const result = await createVehicleModelProvider().resolve(input);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return productApiError(error, "Vehicle model resolution failed.");
  }
}
