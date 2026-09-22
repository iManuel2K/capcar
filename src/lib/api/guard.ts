import { NextResponse } from "next/server";
import type { ZodType } from "zod";

import { getAuthStatus } from "@/features/auth/auth-config";
import { createClient } from "@/lib/supabase/server";

type ApiGuardResult =
  { ok: true; userId?: string } | { ok: false; response: NextResponse };

export function isSameOriginRequest(
  request: Request,
  environment: Record<string, string | undefined> = process.env,
) {
  const suppliedOrigin = request.headers.get("origin");
  if (!suppliedOrigin) return false;

  let normalizedOrigin: string;
  try {
    const parsed = new URL(suppliedOrigin);
    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.origin !== suppliedOrigin
    )
      return false;
    normalizedOrigin = parsed.origin;
  } catch {
    return false;
  }

  return [
    request.url,
    environment.NEXT_PUBLIC_SITE_URL,
    environment.URL,
    environment.DEPLOY_PRIME_URL,
    environment.DEPLOY_URL,
  ].some((candidate) => {
    if (!candidate) return false;
    try {
      return new URL(candidate).origin === normalizedOrigin;
    } catch {
      return false;
    }
  });
}

export async function guardProductApi(
  route: string,
  options: { limit?: number; windowSeconds?: number } = {},
): Promise<ApiGuardResult> {
  if (!getAuthStatus().configured) return { ok: true };

  const client = await createClient();
  const { data: auth, error: authError } = await client.auth.getUser();
  if (authError || !auth.user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Sign in to use this CapCar tool." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      ),
    };
  }

  const limit = options.limit ?? 30;
  const windowSeconds = options.windowSeconds ?? 60;
  const { data, error } = await client.rpc("consume_api_rate_limit", {
    p_route: route,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "API protection is not ready. Apply the latest migration." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      ),
    };
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.allowed) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Too many requests. Wait a moment and try again." },
        {
          status: 429,
          headers: {
            "Cache-Control": "no-store",
            "Retry-After": String(windowSeconds),
          },
        },
      ),
    };
  }

  return { ok: true, userId: auth.user.id };
}

export async function readJsonRequest<T>(
  request: Request,
  schema: ZodType<T>,
  maxBytes = 16_384,
): Promise<T> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > maxBytes) throw new RequestTooLargeError();

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) {
    throw new RequestTooLargeError();
  }

  return schema.parse(JSON.parse(raw));
}

export class RequestTooLargeError extends Error {
  constructor() {
    super("Request too large.");
    this.name = "RequestTooLargeError";
  }
}

export function productApiError(error: unknown, fallback: string) {
  const status = error instanceof RequestTooLargeError ? 413 : 400;
  const message =
    error instanceof RequestTooLargeError ? error.message : fallback;
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
