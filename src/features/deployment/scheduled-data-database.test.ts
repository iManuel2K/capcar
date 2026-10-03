// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("scheduled data and public Passport database policies", () => {
  let db: PGlite;
  const owner = "00000000-0000-4000-8000-000000000001";
  const other = "00000000-0000-4000-8000-000000000002";
  const watch = "00000000-0000-4000-8000-000000000010";

  beforeAll(async () => {
    db = new PGlite();
    await db.exec(`
      create role anon;
      create role authenticated;
      create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
      grant usage on schema auth to anon, authenticated;
      grant execute on function auth.uid() to anon, authenticated;
    `);
    await db.query("insert into auth.users values($1),($2)", [owner, other]);
    for (const file of [
      "20260907160000_create_vehicle_passports.sql",
      "20261001141619_scheduled_price_watch_results.sql",
      "20261001141634_public_passport_integrity.sql",
    ]) {
      await db.exec(
        readFileSync(
          new URL(`../../../supabase/migrations/${file}`, import.meta.url),
          "utf8",
        ),
      );
    }
  }, 30000);

  afterAll(async () => {
    await db?.close();
  });

  it("keeps synchronized watches owner-only and lets owners consume only their results", async () => {
    await asUser(owner);
    await db.query(
      `insert into public.price_watch_subscriptions(
        user_id, watch_id, vehicle_id, vehicle_label, build_id, item_id,
        quote_id, provider, provider_item_id, query, market, destination
      ) values($1,$2,'car-1','2011 BMW 318i','build-1','item-1',
        'ebay:offer-1','ebay','offer-1','BMW E90 rear lights','DE','DE')`,
      [owner, watch],
    );
    expect(
      (await db.query("select * from public.price_watch_subscriptions")).rows,
    ).toHaveLength(1);

    await db.exec("reset role");
    await db.query(
      `insert into public.price_watch_results(
        user_id, watch_id, status, checked_at, next_check_at
      ) values($1,$2,'error',now(),now() + interval '6 hours')`,
      [owner, watch],
    );

    await asUser(other);
    expect(
      (await db.query("select * from public.price_watch_subscriptions")).rows,
    ).toHaveLength(0);
    expect(
      (await db.query("select * from public.price_watch_results")).rows,
    ).toHaveLength(0);

    await asUser(owner);
    expect(
      (await db.query("select * from public.price_watch_results")).rows,
    ).toHaveLength(1);
    await db.exec(
      "update public.price_watch_results set consumed_at=now() where watch_id='00000000-0000-4000-8000-000000000010'",
    );
    await expect(
      db.exec(
        "update public.price_watch_results set status='missing' where watch_id='00000000-0000-4000-8000-000000000010'",
      ),
    ).rejects.toThrow();
  });

  it("exposes only active public Passport snapshots to anonymous visitors", async () => {
    await db.exec("reset role");
    const payload = JSON.stringify({ version: 1 });
    await db.query(
      `insert into public.vehicle_passports(
        share_id,user_id,payload,is_public,record_hash,expires_at,revoked_at
      ) values
        ('00000000-0000-4000-8000-000000000021',$1,$2,true,$3,now()+interval '1 day',null),
        ('00000000-0000-4000-8000-000000000022',$1,$2,true,$3,now()-interval '1 day',null),
        ('00000000-0000-4000-8000-000000000023',$1,$2,true,$3,null,now())`,
      [owner, payload, "a".repeat(64)],
    );
    await db.exec("set role anon");
    const rows = await db.query<{ share_id: string }>(
      "select share_id from public.vehicle_passports",
    );
    expect(rows.rows.map((row) => row.share_id)).toEqual([
      "00000000-0000-4000-8000-000000000021",
    ]);
  });

  it("lets an authenticated owner publish, expire and revoke a Passport without exposing private rows", async () => {
    const shareId = "00000000-0000-4000-8000-000000000024";
    await asUser(owner);
    await db.query(
      `insert into public.vehicle_passports(
        share_id,user_id,payload,is_public,record_hash,expires_at,revoked_at
      ) values($1,$2,$3,true,$4,now()+interval '30 days',null)`,
      [shareId, owner, JSON.stringify({ version: 1 }), "b".repeat(64)],
    );

    await db.exec("reset role; set role anon");
    expect(
      (
        await db.query(
          "select share_id from public.vehicle_passports where share_id=$1",
          [shareId],
        )
      ).rows,
    ).toHaveLength(1);

    await asUser(owner);
    await db.query(
      "update public.vehicle_passports set revoked_at=now(),is_public=false where share_id=$1",
      [shareId],
    );
    await db.exec("reset role; set role anon");
    expect(
      (
        await db.query(
          "select share_id from public.vehicle_passports where share_id=$1",
          [shareId],
        )
      ).rows,
    ).toHaveLength(0);

    await asUser(owner);
    await db.query(
      "update public.vehicle_passports set revoked_at=null,is_public=true,expires_at=now()-interval '1 minute' where share_id=$1",
      [shareId],
    );
    await db.exec("reset role; set role anon");
    expect(
      (
        await db.query(
          "select share_id from public.vehicle_passports where share_id=$1",
          [shareId],
        )
      ).rows,
    ).toHaveLength(0);
  });

  async function asUser(id: string) {
    await db.exec("reset role");
    await db.query("select set_config('test.uid',$1,false)", [id]);
    await db.exec("set role authenticated");
  }
});
