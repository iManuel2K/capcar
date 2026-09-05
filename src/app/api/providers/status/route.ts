import { NextResponse } from "next/server";

import { getProviderStatuses } from "@/features/providers/provider-config";

export function GET() {
  return NextResponse.json({ providers: getProviderStatuses() });
}
