import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function guardPublicRetail() {
  const headers = { "Cache-Control": "no-store" };
  try {
    const client = await createClient();
    const { data, error } = await client.rpc("consume_public_retail_budget");
    if (error || typeof data !== "boolean")
      throw new Error("Budget unavailable");
    if (!data)
      return NextResponse.json(
        {
          error:
            "Live search is busy or has reached today's allowance. Please try again later.",
        },
        { status: 429, headers },
      );
    return null;
  } catch {
    return NextResponse.json(
      {
        error:
          "Live search is temporarily unavailable. Please try again later.",
      },
      { status: 503, headers },
    );
  }
}
