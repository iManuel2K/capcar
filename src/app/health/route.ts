import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      service: "capcar-web",
      status: "ok",
      version: "0.1.0",
      release:
        process.env.COMMIT_REF ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      checkedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
