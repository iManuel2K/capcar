import { NextResponse } from "next/server";

import { getAuthStatus } from "@/features/auth/auth-config";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const destination = new URL("/account", url.origin);
  const code = url.searchParams.get("code");
  if (!getAuthStatus().configured || !code) {
    destination.searchParams.set("auth", "unavailable");
    return NextResponse.redirect(destination);
  }
  const { error } = await (
    await createClient()
  ).auth.exchangeCodeForSession(code);
  destination.searchParams.set("auth", error ? "failed" : "success");
  return NextResponse.redirect(destination);
}
