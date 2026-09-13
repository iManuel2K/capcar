import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { guardProductApi, isSameOriginRequest } from "@/lib/api/guard";
export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };
export async function GET(request: Request) {
  const id = z.uuid().safeParse(new URL(request.url).searchParams.get("id"));
  if (!id.success)
    return NextResponse.json(
      { error: "Invalid listing" },
      { status: 400, headers },
    );
  try {
    const client = await createClient();
    const { data, error } = await client
      .from("community_listing_photos")
      .select("object_path")
      .eq("listing_id", id.data)
      .maybeSingle();
    if (error)
      return NextResponse.json(
        { error: "Photos unavailable" },
        { status: 503, headers },
      );
    if (!data) return NextResponse.json({ url: null }, { headers });
    const signed = await client.storage
      .from("listing-photos")
      .createSignedUrl(data.object_path, 300);
    if (signed.error)
      return NextResponse.json(
        { error: "Photo unavailable" },
        { status: 503, headers },
      );
    return NextResponse.json({ url: signed.data.signedUrl }, { headers });
  } catch {
    return NextResponse.json(
      { error: "Photo unavailable" },
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
    const auth = await guardProductApi("listing-photo", { limit: 10 });
    if (!auth.ok) return auth.response;
    if (!auth.userId)
      return NextResponse.json(
        { error: "Sign in required" },
        { status: 401, headers },
      );
    if (!request.headers.get("content-type")?.startsWith("multipart/form-data"))
      return NextResponse.json(
        { error: "Upload required" },
        { status: 400, headers },
      );
    // Bound the stream before parsing multipart data; Content-Length is not trusted.
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Empty body");
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 1100000) {
          await reader.cancel();
          return NextResponse.json(
            { error: "Photo too large" },
            { status: 413, headers },
          );
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const body = Buffer.concat(chunks);
    const form = await new Response(body, {
      headers: { "Content-Type": request.headers.get("content-type")! },
    }).formData();
    const id = z.uuid().parse(form.get("id"));
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.type !== "image/jpeg" ||
      file.size > 1048576
    )
      throw new Error("JPEG required");
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (
      bytes.length < 100 ||
      bytes[0] !== 255 ||
      bytes[1] !== 216 ||
      bytes[bytes.length - 2] !== 255 ||
      bytes[bytes.length - 1] !== 217
    )
      throw new Error("Invalid JPEG");
    const client = await createClient();
    const path = `${auth.userId}/${id}/${crypto.randomUUID()}.jpg`;
    const upload = await client.storage
      .from("listing-photos")
      .upload(path, bytes, { contentType: "image/jpeg", upsert: false });
    if (upload.error)
      return NextResponse.json(
        { error: "Upload unavailable. Check ownership and listing status." },
        { status: 409, headers },
      );
    const attached = await client.rpc("attach_listing_photo", {
      p_id: id,
      p_path: path,
    });
    if (attached.error) {
      await client.storage.from("listing-photos").remove([path]);
      return NextResponse.json(
        { error: "Could not attach photo" },
        { status: 409, headers },
      );
    }
    if (typeof attached.data === "string")
      await client.storage.from("listing-photos").remove([attached.data]);
    const signed = await client.storage
      .from("listing-photos")
      .createSignedUrl(path, 300);
    return NextResponse.json(
      { url: signed.data?.signedUrl ?? null },
      { headers },
    );
  } catch {
    return NextResponse.json(
      { error: "Photo upload failed" },
      { status: 400, headers },
    );
  }
}
