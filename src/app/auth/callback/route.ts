import { NextResponse } from "next/server";

import { getAuthStatus } from "@/features/auth/auth-config";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedNext = url.searchParams.get("next");
  const next =
    requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/garage";
  const destination = new URL(next, url.origin);
  const code = url.searchParams.get("code");
  if (!getAuthStatus().configured || !code) {
    const account = new URL("/account", url.origin);
    account.searchParams.set("auth", "unavailable");
    return NextResponse.redirect(account);
  }
  const { error } = await (
    await createClient()
  ).auth.exchangeCodeForSession(code);
  if (error) {
    const account = new URL("/account", url.origin);
    account.searchParams.set("auth", "failed");
    return NextResponse.redirect(account);
  }
  return NextResponse.redirect(destination);
}
