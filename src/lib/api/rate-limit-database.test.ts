// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("database-owned API quotas", () => {
  let db: PGlite;
  const user = "11111111-1111-4111-8111-111111111111";
  const other = "22222222-2222-4222-8222-222222222222";
  const call = (route: string, limit = 300, window = 10) =>
    db.query<{ allowed: boolean; remaining: number }>(
      "select * from public.consume_api_rate_limit($1,$2,$3)",
      [route, limit, window],
    );
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
      grant usage on schema auth to anon, authenticated;
      create schema storage;
      create table storage.buckets(id text primary key, public boolean, file_size_limit bigint, allowed_mime_types text[]);
      insert into storage.buckets values ('vehicle-documents',true,null,null),('listing-photos',true,null,null);`);
    await db.query("insert into auth.users values($1),($2)", [user, other]);
    for (const file of [
      "20260908140000_add_beta_api_rate_limits.sql",
      "20261022202851_security_review_hardening.sql",
    ])
      await db.exec(readFileSync(`supabase/migrations/${file}`, "utf8"));
  }, 30_000);
  afterAll(async () => {
    await db?.close();
  });

  async function as(id = user) {
    await db.exec("reset role");
    await db.query("select set_config('test.uid',$1,false)", [id]);
    await db.exec("set role authenticated");
  }
  it("does not let a direct RPC shorten an exhausted route's window", async () => {
    await db.query(
      "insert into public.api_rate_limits values($1,'copilot-chat',clock_timestamp()-interval '20 seconds',15)",
      [user],
    );
    await as();
    expect((await call("copilot-chat", 300, 10)).rows[0].allowed).toBe(false);
    expect((await call("copilot-chat", 15, 60)).rows[0].allowed).toBe(false);
    await as(other);
    expect((await call("copilot-chat")).rows[0].allowed).toBe(true);
    await db.exec("reset role");
  });
  it("enforces the hourly specialist limit despite a shorter HTTP request window", async () => {
    await db.query(
      "insert into public.api_rate_limits values($1,'specialist-profile',clock_timestamp()-interval '2 minutes',10)",
      [user],
    );
    await as();
    expect((await call("specialist-profile", 10, 60)).rows[0].allowed).toBe(
      false,
    );
    await db.exec("reset role");
  });
  it("blocks arbitrary route names, null configuration, anonymous calls and counter writes", async () => {
    await as();
    await expect(call("attacker-created-counter")).rejects.toThrow(
      "Unknown rate limit route",
    );
    await expect(
      db.query("select * from public.consume_api_rate_limit(null,30,60)"),
    ).rejects.toThrow();
    await expect(
      db.query(
        "select * from public.consume_api_rate_limit('copilot-chat',null,60)",
      ),
    ).rejects.toThrow();
    await expect(
      db.query("update public.api_rate_limits set request_count=1"),
    ).rejects.toThrow();
    await db.exec("reset role; set role anon");
    await expect(call("copilot-chat")).rejects.toThrow();
    await db.exec("reset role");
  });
  it("atomically allows only one of two calls at the quota boundary", async () => {
    await db.query(
      "insert into public.api_rate_limits values($1,'trip-route',clock_timestamp(),9)",
      [user],
    );
    await as();
    const results = await Promise.all([call("trip-route"), call("trip-route")]);
    expect(results.map((result) => result.rows[0].allowed).sort()).toEqual([
      false,
      true,
    ]);
    await db.exec("reset role");
  });
  it("resets an elapsed canonical window and repairs pre-existing public buckets", async () => {
    await db.query(
      "update public.api_rate_limits set window_start=clock_timestamp()-interval '2 minutes' where user_id=$1 and route='trip-route'",
      [user],
    );
    await as();
    expect((await call("trip-route")).rows[0]).toMatchObject({
      allowed: true,
      remaining: 9,
    });
    await db.exec("reset role");
    const buckets = (
      await db.query<{ public: boolean; file_size_limit: number }>(
        "select * from storage.buckets",
      )
    ).rows;
    expect(buckets).toHaveLength(2);
    expect(
      buckets.every(
        (bucket) => !bucket.public && Number(bucket.file_size_limit) > 0,
      ),
    ).toBe(true);
  });
});
