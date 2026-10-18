import { beforeEach, describe, expect, it } from "vitest";
import {
  JOURNAL_CHECKLIST_KEY,
  JOURNAL_DRAFT_KEY,
  journalFeaturePath,
  journalWorkspacePath,
  readJournalChecklists,
  readJournalDraft,
  saveJournalChecklist,
  saveJournalDraft,
} from "./checklists";
import {
  clearLocalSnapshot,
  collectLocalSnapshot,
  applyLocalSnapshot,
} from "@/features/sync/local-snapshot";
import { MAINTENANCE_STORAGE_KEY } from "@/features/maintenance/maintenance-storage";
const slug = "build-plan-first-job";
const data = {
  title: "First weekend job",
  notes: "Confirm parts before buying",
  checked: ["plan-0"],
};
beforeEach(() => localStorage.clear());

describe("vehicle Journal checklists", () => {
  it("upserts per vehicle and article without changing maintenance history", () => {
    saveJournalChecklist(
      { ...data, articleSlug: slug, vehicleId: "car-1" },
      localStorage,
      ["car-1", "car-2"],
    );
    saveJournalChecklist(
      {
        ...data,
        checked: ["plan-0", "plan-1"],
        articleSlug: slug,
        vehicleId: "car-1",
      },
      localStorage,
      ["car-1"],
    );
    saveJournalChecklist(
      { ...data, articleSlug: slug, vehicleId: "car-2" },
      localStorage,
      ["car-2"],
    );
    expect(readJournalChecklists(localStorage)).toHaveLength(2);
    expect(
      readJournalChecklists(localStorage).find((r) => r.vehicleId === "car-1")
        ?.checked,
    ).toHaveLength(2);
    expect(localStorage.getItem(MAINTENANCE_STORAGE_KEY)).toBeNull();
    expect(() =>
      saveJournalChecklist(
        { ...data, articleSlug: slug, vehicleId: "missing" },
        localStorage,
        ["car-1"],
      ),
    ).toThrow("vehicle");
  });
  it("round trips saved checklists through the existing account snapshot and clears them with account data", () => {
    saveJournalChecklist(
      { ...data, articleSlug: slug, vehicleId: "car-1" },
      localStorage,
      ["car-1"],
    );
    const snapshot = collectLocalSnapshot(localStorage);
    expect(snapshot.data[JOURNAL_CHECKLIST_KEY]).toContain(data.title);
    clearLocalSnapshot(localStorage);
    expect(readJournalChecklists(localStorage)).toEqual([]);
    applyLocalSnapshot(snapshot, localStorage);
    expect(readJournalChecklists(localStorage)[0].title).toBe(data.title);
  });
  it("keeps the unassigned draft out of cloud snapshots and expires it after one day", () => {
    saveJournalDraft(slug, data, localStorage);
    expect(readJournalDraft(slug, localStorage)).toEqual(data);
    expect(
      readJournalDraft("guide-to-vehicle-history", localStorage),
    ).toBeUndefined();
    expect(
      readJournalDraft(slug, localStorage, Date.now() + 86_400_001),
    ).toBeUndefined();
    expect(
      collectLocalSnapshot(localStorage).data[JOURNAL_DRAFT_KEY],
    ).toBeUndefined();
  });
  it("rejects corrupt and oversized data and uses existing feature routes", () => {
    localStorage.setItem(JOURNAL_CHECKLIST_KEY, "broken");
    expect(readJournalChecklists(localStorage)).toEqual([]);
    expect(() =>
      saveJournalDraft(
        slug,
        { ...data, notes: "x".repeat(1501) },
        localStorage,
      ),
    ).toThrow();
    expect(journalWorkspacePath(slug, "ja")).toContain("locale=ja");
    expect(journalFeaturePath(slug, "car-1")).toBe(
      "/garage/car-1/builds/new?journal=build-plan-first-job",
    );
    expect(journalFeaturePath("bmw-diy-wartung-dokumentieren", "car-1")).toBe(
      "/garage/car-1/maintenance",
    );
  });
});
