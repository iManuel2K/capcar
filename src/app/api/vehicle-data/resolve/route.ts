import { NextResponse } from "next/server";

import { createVehicleDataProvider } from "@/features/vehicle-data/vehicle-data-provider";
import { vehicleDataRequestSchema } from "@/features/vehicle-data/vehicle-data-schema";

export async function POST(request: Request) {
  try {
    const input = vehicleDataRequestSchema.parse(await request.json());
    const result = await createVehicleDataProvider().resolve(input);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Vehicle resolution failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
