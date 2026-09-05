import { NextResponse } from "next/server";

import { createVehicleModelProvider } from "@/features/visualizer/vehicle-model-provider";
import { vehicleModelRequestSchema } from "@/features/visualizer/vehicle-model-schema";

export async function POST(request: Request) {
  try {
    const input = vehicleModelRequestSchema.parse(await request.json());
    const result = await createVehicleModelProvider().resolve(input);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Vehicle model resolution failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
