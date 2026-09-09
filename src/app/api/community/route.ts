import { NextResponse } from "next/server";
import {
  guardProductApi,
  readJsonRequest,
  productApiError,
} from "@/lib/api/guard";
import { getAuthStatus } from "@/features/auth/auth-config";
import { createClient } from "@/lib/supabase/server";
import { mutationSchema, actions } from "@/features/community/contracts";
const headers = { "Cache-Control": "no-store" };
async function guard() {
  if (!getAuthStatus().configured)
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Community features require a configured account service." },
        { status: 503, headers },
      ),
    };
  return guardProductApi("community", { limit: 60 });
}
export async function GET() {
  const auth = await guard();
  if (!auth.ok) return auth.response;
  const client = await createClient();
  const results = await Promise.all([
    client
      .from("community_listings")
      .select(
        "id,seller_id,title,description,city,price_cents,condition,status,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(100),
    client
      .from("community_roles")
      .select("user_id,role,display_name")
      .limit(500),
    client
      .from("community_messages")
      .select("id,listing_id,sender_id,recipient_id,body,created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    client
      .from("community_reports")
      .select("id,listing_id,reason,closed")
      .eq("closed", false)
      .limit(100),
    client
      .from("work_verifications")
      .select(
        "id,owner_id,vehicle_id,specialist_id,work,performed_on,status,evidence",
      )
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  if (results.some((result) => result.error))
    return NextResponse.json(
      {
        error:
          "Community database is unavailable. Apply the community migration and retry.",
      },
      { status: 503, headers },
    );
  return NextResponse.json(
    {
      userId: auth.userId,
      listings: results[0].data,
      roles: results[1].data,
      messages: results[2].data,
      reports: results[3].data,
      stamps: results[4].data,
    },
    { headers },
  );
}
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return NextResponse.json(
      { error: "Same-origin request required." },
      { status: 403, headers },
    );
  const auth = await guard();
  if (!auth.ok) return auth.response;
  try {
    const input = await readJsonRequest(request, mutationSchema);
    const client = await createClient();
    const { data, error } = await client.rpc("community_mutate", {
      p_action: input.action,
      p_id: input.id ?? null,
      p_data: actions[input.action].parse(input.data),
    });
    if (error)
      return NextResponse.json(
        {
          error:
            "Action could not be completed. Check your account confirmation, permissions, current record status and required fields. For stamps, sync the vehicle first.",
        },
        { status: 409, headers },
      );
    return NextResponse.json({ id: data }, { headers });
  } catch (error) {
    return productApiError(error, "Invalid community request.");
  }
}
