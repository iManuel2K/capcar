import { NextResponse } from "next/server";

import { getDeploymentReadiness } from "@/features/deployment/deployment-readiness";

export const dynamic = "force-dynamic";

export function GET() {
  const readiness = getDeploymentReadiness();
  return NextResponse.json(readiness, {
    status: readiness.ready ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
