// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("vehicle document owner policies", () => {
  let db: PGlite;
  const owner = "11111111-1111-4111-8111-111111111111";
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(`
      create role authenticated;
      create role anon;
      create schema auth;
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
      create schema storage;
      create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
      create table storage.objects(id integer generated always as identity, bucket_id text, name text);
      create function storage.foldername(name text) returns text[] language sql immutable as $$ select string_to_array(name, '/') $$;
      alter table storage.objects enable row level security;
      grant usage on schema storage, auth to authenticated, anon;
      grant select, insert, delete on storage.objects to authenticated, anon;
      grant usage on all sequences in schema storage to authenticated;
    `);
    await db.exec(
      readFileSync(
        new URL(
          "../../../supabase/migrations/20260914010000_vehicle_documents.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
  });
  afterAll(async () => {
    await db?.close();
  });
  it("creates a private bucket", async () => {
    const result = await db.query<{ public: boolean }>(
      "select public from storage.buckets where id='vehicle-documents'",
    );
    expect(result.rows[0].public).toBe(false);
  });
  it("allows only the authenticated owner's prefix", async () => {
    await db.exec(`set role authenticated; set test.uid = '${owner}';`);
    await db.query(
      "insert into storage.objects(bucket_id, name) values('vehicle-documents', $1)",
      [`${owner}/car/receipt.pdf`],
    );
    await expect(
      db.query(
        "insert into storage.objects(bucket_id, name) values('vehicle-documents','someone-else/car/receipt.pdf')",
      ),
    ).rejects.toThrow();
    expect((await db.query("select * from storage.objects")).rows).toHaveLength(
      1,
    );
    await db.exec("set test.uid = '22222222-2222-4222-8222-222222222222';");
    expect((await db.query("select * from storage.objects")).rows).toHaveLength(
      0,
    );
    expect(
      (await db.query("delete from storage.objects returning *")).rows,
    ).toHaveLength(0);
    await db.exec(`set test.uid = '${owner}';`);
    expect(
      (await db.query("delete from storage.objects returning *")).rows,
    ).toHaveLength(1);
    await db.exec("reset role;");
  });
  it("does not expose documents to anonymous callers", async () => {
    await db.exec("set role anon; set test.uid = '';");
    expect((await db.query("select * from storage.objects")).rows).toHaveLength(
      0,
    );
    await expect(
      db.exec(
        "insert into storage.objects(bucket_id, name) values('vehicle-documents','anon/car/document.pdf')",
      ),
    ).rejects.toThrow();
    await db.exec("reset role;");
  });
});
