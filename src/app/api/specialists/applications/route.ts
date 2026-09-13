import { NextResponse } from "next/server";
import {
  guardProductApi,
  isSameOriginRequest,
  readJsonRequest,
  productApiError,
} from "@/lib/api/guard";
import { createClient } from "@/lib/supabase/server";
import { specialistMutation } from "@/features/community/specialist-contracts";
const headers = { "Cache-Control": "private, no-store" };
export async function GET(request: Request) {
  try {
    const auth = await guardProductApi("specialist-applications", {
      limit: 60,
    });
    if (!auth.ok) return auth.response;
    if (!auth.userId)
      return NextResponse.json(
        { error: "Account service unavailable" },
        { status: 503, headers },
      );
    const client = await createClient();
    const page = Number(new URL(request.url).searchParams.get("page") ?? 0);
    if (!Number.isInteger(page) || page < 0 || page > 999)
      return NextResponse.json(
        { error: "Invalid page" },
        { status: 400, headers },
      );
    const columns =
      "id,user_id,business_name,city,website,expertise,status,review_reason,created_at,updated_at";
    const [records, roles, own] = await Promise.all([
      client
        .from("specialist_applications")
        .select(columns)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(page * 100, page * 100 + 100),
      client.from("community_roles").select("role").eq("user_id", auth.userId),
      client
        .from("specialist_applications")
        .select(columns)
        .eq("user_id", auth.userId)
        .maybeSingle(),
    ]);
    if (records.error || roles.error || own.error)
      return NextResponse.json(
        { error: "Applications unavailable" },
        { status: 503, headers },
      );
    return NextResponse.json(
      {
        userId: auth.userId,
        applications: [
          ...records.data.slice(0, 100),
          ...(own.data &&
          !records.data
            .slice(0, 100)
            .some((record) => record.id === own.data?.id)
            ? [own.data]
            : []),
        ],
        page,
        hasMore: records.data.length > 100 && page < 999,
        moderator:
          roles.data.some((r) => r.role === "moderator") &&
          !roles.data.some((r) => r.role === "suspended"),
      },
      { headers },
    );
  } catch {
    return NextResponse.json(
      { error: "Applications unavailable" },
      { status: 503, headers },
    );
  }
}
export async function POST(request: Request) {
  if (!isSameOriginRequest(request))
    return NextResponse.json(
      { error: "Same-origin request required" },
      { status: 403, headers },
    );
  try {
    const auth = await guardProductApi("specialist-applications", {
      limit: 30,
    });
    if (!auth.ok) return auth.response;
    if (!auth.userId)
      return NextResponse.json(
        { error: "Account service unavailable" },
        { status: 503, headers },
      );
    const input = await readJsonRequest(request, specialistMutation);
    const client = await createClient();
    const result =
      input.action === "apply"
        ? await client.rpc("specialist_apply", { p_data: input.data })
        : await client.rpc("specialist_review", {
            p_id: input.id,
            p_status: input.status,
            p_reason: input.reason,
          });
    if (result.error)
      return NextResponse.json(
        { error: "Check permissions, confirmation and application status" },
        { status: 409, headers },
      );
    return NextResponse.json({ id: result.data }, { headers });
  } catch (error) {
    return productApiError(error, "Invalid application");
  }
}
