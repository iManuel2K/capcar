import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    service: "capcar-web",
    status: "ok",
    version: "0.1.0",
  });
}
