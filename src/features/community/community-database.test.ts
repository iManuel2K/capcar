// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("community database authorization", () => {
  let db: PGlite;
  const seller = "00000000-0000-4000-8000-000000000001",
    buyer = "00000000-0000-4000-8000-000000000002",
    mod = "00000000-0000-4000-8000-000000000003",
    shop = "00000000-0000-4000-8000-000000000004";
  const listing = {
    title: "Original BMW bumper",
    description: "Used original bumper with a small scratch.",
    city: "Frankfurt",
    price_cents: 15000,
    condition: "used",
  };
  async function as(id: string) {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
    await db.exec("set role authenticated");
  }
  async function call(action: string, id: string | null, data: unknown = {}) {
    const result = await db.query<{ id: string }>(
      "select public.community_mutate($1,$2,$3::jsonb) as id",
      [action, id, JSON.stringify(data)],
    );
    return result.rows[0].id;
  }
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(
      "create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key,email_confirmed_at timestamptz); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;",
    );
    for (const id of [seller, buyer, mod, shop])
      await db.query("insert into auth.users values($1,now())", [id]);
    for (const file of [
      "20260905130000_create_garage_snapshots.sql",
      "20260907160000_create_vehicle_passports.sql",
      "20260907161000_create_affiliate_clicks.sql",
      "20260908140000_add_beta_api_rate_limits.sql",
      "20260908141000_add_account_data_lifecycle.sql",
      "20260909090000_community_and_verified_work.sql",
      "20260910090000_public_discovery.sql",
      "20260912180000_beta_hardening.sql",
    ])
      await db.exec(readFileSync(`supabase/migrations/${file}`, "utf8"));
    await db.query(
      "insert into public.community_roles values($1,'moderator','Moderator'),($2,'specialist','Reviewed workshop')",
      [mod, shop],
    );
    await db.query(
      "insert into public.garage_snapshots(user_id,payload) values($1,$2::jsonb)",
      [
        seller,
        JSON.stringify({
          data: {
            "capcar.vehicles.v1": JSON.stringify([
              { id: "car-a", demoProject: false },
            ]),
          },
        }),
      ],
    );
  }, 30000);
  afterAll(async () => {
    await db?.close();
  });
  it("allows anonymous published projections but denies private tables and budget overrides", async () => {
    await db.exec("reset role");
    const ids = await db.query<{ id: string }>(
      "insert into public.community_listings(seller_id,title,description,city,price_cents,condition,status) values($1,'Public test part','A complete public description','Berlin',1000,'used','published'),($1,'Pending test part','A complete pending description','Berlin',1000,'used','pending') returning id",
      [buyer],
    );
    await db.exec("set role anon");
    const publicRows = (
      await db.query<{ id: string }>(
        "select * from public.browse_published_listings()",
      )
    ).rows;
    expect(publicRows.map((row) => row.id)).toContain(ids.rows[0].id);
    expect(publicRows.map((row) => row.id)).not.toContain(ids.rows[1].id);
    expect(Object.keys(publicRows[0]).sort()).toEqual(
      ["id", "title", "description", "city", "price_cents", "condition"].sort(),
    );
    for (const table of [
      "community_messages",
      "community_reports",
      "work_verifications",
      "public_retail_budget",
    ]) {
      await expect(db.query(`select * from public.${table}`)).rejects.toThrow();
    }
    for (let i = 0; i < 30; i++)
      expect(
        (
          await db.query<{ allowed: boolean }>(
            "select public.consume_public_retail_budget() as allowed",
          )
        ).rows[0].allowed,
      ).toBe(true);
    expect(
      (
        await db.query<{ allowed: boolean }>(
          "select public.consume_public_retail_budget() as allowed",
        )
      ).rows[0].allowed,
    ).toBe(false);
    await db.exec("reset role");
    await db.exec(
      "update public.public_retail_budget set minute_start = now() - interval '2 minutes', day_count = 1200",
    );
    await db.exec("set role anon");
    expect(
      (
        await db.query<{ allowed: boolean }>(
          "select public.consume_public_retail_budget() as allowed",
        )
      ).rows[0].allowed,
    ).toBe(false);
    await db.exec("reset role");
    await db.query(
      "insert into public.community_roles values($1,'suspended','Suspended user')",
      [buyer],
    );
    await db.exec("set role anon");
    expect(
      (
        await db.query<{ id: string }>(
          "select * from public.browse_published_listings()",
        )
      ).rows.map((row) => row.id),
    ).not.toContain(ids.rows[0].id);
    await db.exec("reset role");
    await db.query("delete from public.community_roles where user_id=$1", [
      buyer,
    ]);
  });
  it("requires moderation, prevents self-approval and reapplies review on edit", async () => {
    await as(seller);
    const id = await call("create", null, listing);
    await expect(
      call("moderate", id, { status: "published", reason: "I approve myself" }),
    ).rejects.toThrow();
    await expect(
      db.query(
        "insert into public.community_roles values($1,'moderator','Me')",
        [seller],
      ),
    ).rejects.toThrow();
    await as(buyer);
    expect(
      (
        await db.query("select * from public.community_listings where id=$1", [
          id,
        ])
      ).rows,
    ).toHaveLength(0);
    await expect(call("withdraw", id)).rejects.toThrow();
    await as(mod);
    await call("moderate", id, {
      status: "published",
      reason: "Reviewed listing and provenance",
    });
    await as(buyer);
    expect(
      (
        await db.query("select * from public.community_listings where id=$1", [
          id,
        ])
      ).rows,
    ).toHaveLength(1);
    await call("message", id, { body: "Is this still available?" });
    await call("report", id, { reason: "Part number appears inconsistent" });
    await as(mod);
    expect(
      (await db.query("select * from public.community_messages")).rows,
    ).toHaveLength(0);
    expect(
      (await db.query("select * from public.community_reports")).rows,
    ).toHaveLength(1);
    await as(seller);
    expect(
      (await db.query("select * from public.community_reports")).rows,
    ).toHaveLength(0);
    const messages = await db.query<{ id: string }>(
      "select * from public.community_messages",
    );
    expect(messages.rows).toHaveLength(1);
    await call("reply", messages.rows[0].id, { body: "Yes, still available." });
    await call("edit", id, { ...listing, title: "Revised original bumper" });
    await as(buyer);
    expect(
      (
        await db.query("select * from public.community_listings where id=$1", [
          id,
        ])
      ).rows,
    ).toHaveLength(0);
  });
  it("binds stamps to synced vehicles and the assigned approved specialist", async () => {
    await as(seller);
    await expect(
      call("request_stamp", null, {
        vehicle_id: "someone-elses-car",
        specialist_id: shop,
        work: "Brake inspection",
        performed_on: "2026-01-01",
      }),
    ).rejects.toThrow();
    const id = await call("request_stamp", null, {
      vehicle_id: "car-a",
      specialist_id: shop,
      work: "Brake inspection",
      performed_on: "2026-01-01",
    });
    await expect(
      call("decide_stamp", id, {
        status: "verified",
        evidence: "Self verification",
      }),
    ).rejects.toThrow();
    await as(buyer);
    expect(
      (await db.query("select * from public.work_verifications")).rows,
    ).toHaveLength(0);
    await as(shop);
    await expect(
      call("decide_stamp", id, { status: "verified" }),
    ).rejects.toThrow();
    await call("decide_stamp", id, {
      status: "verified",
      evidence: "Job reference 123, technician attestation",
    });
    await as(seller);
    expect(
      (
        await db.query<{ status: string }>(
          "select status from public.work_verifications where id=$1",
          [id],
        )
      ).rows[0].status,
    ).toBe("verified");
    await call("revoke_stamp", id);
    expect(
      (
        await db.query<{ status: string }>(
          "select status from public.work_verifications where id=$1",
          [id],
        )
      ).rows[0].status,
    ).toBe("revoked");
  });
  it("denies anonymous table access and direct writes", async () => {
    await db.exec("reset role; set role anon");
    await expect(
      db.query("select * from public.community_listings"),
    ).rejects.toThrow();
    await expect(call("create", null, listing)).rejects.toThrow();
    await as(seller);
    await expect(
      db.query("update public.community_listings set status='published'"),
    ).rejects.toThrow();
  });
  it("allows an independent moderator to suspend a seller and stops further posts", async () => {
    await as(seller);
    const id = await call("create", null, listing);
    await as(mod);
    await call("review_seller", id, {
      reason: "Identity review completed by moderator",
    });
    await call("suspend_seller", id, {
      reason: "Fraud report reviewed and substantiated",
    });
    await as(seller);
    await expect(call("create", null, listing)).rejects.toThrow("suspended");
    expect(
      (
        await db.query(
          "select * from public.community_roles where role='reviewed_seller'",
        )
      ).rows,
    ).toHaveLength(0);
  });
  it("requires independent specialist approval and prevents stale decisions", async () => {
    const application = {
      business_name: "Independent Garage",
      city: "Berlin",
      website: "https://garage.example/",
      expertise: "BMW engine diagnostics and mechanical repairs",
      consent: true,
    };
    await as(buyer);
    await expect(
      db.query(
        "insert into public.specialist_applications(user_id,business_name,city,website,expertise) values($1,'Bypass','Berlin','https://garage.example/','Full engine repair experience')",
        [buyer],
      ),
    ).rejects.toThrow();
    const result = await db.query<{ id: string }>(
      "select public.specialist_apply($1::jsonb) as id",
      [JSON.stringify(application)],
    );
    const id = result.rows[0].id;
    await expect(
      db.query(
        "select public.specialist_review($1,'approved','Self approval is prohibited')",
        [id],
      ),
    ).rejects.toThrow();
    await as(shop);
    expect(
      (await db.query("select * from public.specialist_applications")).rows,
    ).toHaveLength(0);
    await as(mod);
    await db.query(
      "select public.specialist_review($1,'approved','Business and representative independently confirmed')",
      [id],
    );
    await expect(
      db.query(
        "select public.specialist_review($1,'rejected','Stale moderator decision must fail')",
        [id],
      ),
    ).rejects.toThrow("status changed");
    await as(buyer);
    expect(
      (
        await db.query<{ allowed: boolean }>(
          "select public.community_has_role('specialist') as allowed",
        )
      ).rows[0].allowed,
    ).toBe(true);
    await expect(
      db.query("select public.specialist_apply($1::jsonb)", [
        JSON.stringify(application),
      ]),
    ).rejects.toThrow("already active");
    await as(mod);
    await db.query(
      "select public.specialist_review($1,'revoked','Independent evidence requires access withdrawal')",
      [id],
    );
    await as(buyer);
    expect(
      (
        await db.query<{ allowed: boolean }>(
          "select public.community_has_role('specialist') as allowed",
        )
      ).rows[0].allowed,
    ).toBe(false);
    await db.query("select public.delete_current_user_data()");
    expect(
      (await db.query("select * from public.specialist_applications")).rows,
    ).toHaveLength(0);
  });
  it("blocks public contact links and prevents suspended recipients receiving messages", async () => {
    await as(buyer);
    await expect(
      call("create", null, {
        ...listing,
        description: "Contact me at seller@example.com for this part",
      }),
    ).rejects.toThrow("Remove email");
    const id = await call("create", null, listing);
    await as(mod);
    await call("moderate", id, {
      status: "published",
      reason: "Reviewed item ownership and description",
    });
    await as(shop);
    await call("message", id, { body: "Interested in this original bumper" });
    await as(buyer);
    const message = (
      await db.query<{ id: string }>(
        "select id from public.community_messages where listing_id=$1",
        [id],
      )
    ).rows[0];
    await db.exec("reset role");
    await db.query(
      "insert into public.community_roles values($1,'suspended','Suspended account')",
      [shop],
    );
    await as(buyer);
    await expect(
      call("reply", message.id, {
        body: "This must not reach a suspended account",
      }),
    ).rejects.toThrow();
    await db.exec("reset role");
    expect(
      (
        await db.query(
          "select * from public.community_roles where user_id=$1 and role='specialist'",
          [shop],
        )
      ).rows,
    ).toHaveLength(0);
  });
  it("erases the account's new private records with the existing erase-data action", async () => {
    await as(seller);
    await db.query("select public.delete_current_user_data()");
    expect(
      (await db.query("select * from public.work_verifications")).rows,
    ).toHaveLength(0);
    expect(
      (await db.query("select * from public.community_messages")).rows,
    ).toHaveLength(0);
    expect(
      (
        await db.query(
          "select * from public.community_listings where seller_id=$1",
          [seller],
        )
      ).rows,
    ).toHaveLength(0);
  });
});
