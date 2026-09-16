import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import {
  recordRoadbookVisitSchema,
  roadbookEventListSchema,
  roadbookReportSchema,
  roadbookVenueListSchema,
  type RecordRoadbookVisitInput,
  type RoadbookCategory,
  type RoadbookEvent,
  type RoadbookReportInput,
  type RoadbookVenue,
} from "@/features/roadbook/roadbook-schema";
import { saveRoadbookVisit } from "@/features/roadbook/roadbook-storage";
import { createClient } from "@/lib/supabase/client";

export type RoadbookCenter = { latitude: number; longitude: number };

export async function fetchRoadbookVenues(input: {
  center: RoadbookCenter;
  radiusKm: number;
  categories: RoadbookCategory[];
  signal?: AbortSignal;
}) {
  const query = createClient().rpc("roadbook_venues_nearby", {
    p_lat: input.center.latitude,
    p_lng: input.center.longitude,
    p_radius_m: Math.round(input.radiusKm * 1000),
    p_categories: input.categories.length ? input.categories : null,
  });
  if (input.signal) query.abortSignal(input.signal);
  const { data, error } = await query;
  if (error) throw new Error("ROADBOOK_UNAVAILABLE");
  return roadbookVenueListSchema.parse(data ?? []);
}

export async function fetchRoadbookEvents(input: {
  venueIds: string[];
  signal?: AbortSignal;
}) {
  if (!input.venueIds.length) return [] satisfies RoadbookEvent[];
  let query = createClient()
    .from("roadbook_events")
    .select(
      "id,venue_id,title,slug,description,event_type,participation,booking_required,starts_at,ends_at,booking_url,entry_price_cents,price_currency,source_label,source_url,verification_status,verified_at",
    )
    .in("venue_id", input.venueIds.slice(0, 250))
    .gte("ends_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(100);
  if (input.signal) query = query.abortSignal(input.signal);
  const { data, error } = await query;
  if (error) throw new Error("ROADBOOK_EVENTS_UNAVAILABLE");
  return roadbookEventListSchema.parse(data ?? []);
}

async function requireUser() {
  const client = createClient();
  const { data, error } = await client.auth.getUser();
  if (error) throw new Error("SAVE_FAILED");
  if (!data.user) throw new Error("SIGN_IN_REQUIRED");
  return { client, user: data.user };
}

export async function saveRoadbookPlace(input: {
  venueId: string;
  vehicleId: string;
  buildId?: string;
}) {
  const { client, user } = await requireUser();
  const { error } = await client.from("saved_roadbook_places").upsert(
    {
      user_id: user.id,
      venue_id: input.venueId,
      vehicle_id: input.vehicleId,
      build_id: input.buildId ?? null,
    },
    { onConflict: "user_id,venue_id,vehicle_id" },
  );
  if (error) throw new Error(error.message);
}

function safeObjectPathName(name: string) {
  const extension =
    name
      .split(".")
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "bin";
  return `${crypto.randomUUID()}.${extension.slice(0, 8)}`;
}

export async function recordRoadbookVisit(input: {
  venue: RoadbookVenue;
  vehicle: Vehicle;
  details: RecordRoadbookVisitInput;
  photos: File[];
  obdFile?: File;
}) {
  const details = recordRoadbookVisitSchema.parse(input.details);
  const photos = input.photos.slice(0, 4);
  if (
    photos.some(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 12 * 1024 * 1024,
    )
  ) {
    throw new Error("VISIT_FILE_INVALID");
  }
  if (
    input.obdFile &&
    (input.obdFile.size > 1024 * 1024 ||
      !["text/plain", "text/csv", "application/json"].includes(
        input.obdFile.type || "text/plain",
      ))
  ) {
    throw new Error("VISIT_FILE_INVALID");
  }
  const { client, user } = await requireUser();
  const visitId = crypto.randomUUID();
  const uploadedPaths: string[] = [];
  const photoPaths: string[] = [];

  try {
    for (const file of photos) {
      const path = `${user.id}/${input.vehicle.id}/${visitId}/photos/${safeObjectPathName(file.name)}`;
      const { error } = await client.storage
        .from("roadbook-visits")
        .upload(path, file, { upsert: false });
      if (error) throw error;
      uploadedPaths.push(path);
      photoPaths.push(path);
    }

    let obdLog: Record<string, unknown> | null = null;
    if (input.obdFile) {
      const path = `${user.id}/${input.vehicle.id}/${visitId}/obd/${safeObjectPathName(input.obdFile.name)}`;
      const { error } = await client.storage
        .from("roadbook-visits")
        .upload(path, input.obdFile, { upsert: false });
      if (error) throw error;
      uploadedPaths.push(path);
      obdLog = {
        fileName: input.obdFile.name.slice(0, 180),
        mediaType: input.obdFile.type || "text/plain",
        storagePath: path,
      };
    }

    const lapTimes = details.bestLapSeconds
      ? [{ label: "Best recorded lap", seconds: details.bestLapSeconds }]
      : [];
    const { error } = await client.from("passport_visits").insert({
      id: visitId,
      user_id: user.id,
      venue_id: input.venue.id,
      vehicle_id: input.vehicle.id,
      visited_at: details.visitedAt,
      notes: details.notes || null,
      lap_times: lapTimes,
      obd_log: obdLog,
      photo_paths: photoPaths,
      conditions: {},
    });
    if (error) throw error;

    return saveRoadbookVisit(
      {
        id: visitId,
        vehicleId: input.vehicle.id,
        venueId: input.venue.id,
        venueName: input.venue.name,
        category: input.venue.category,
        visitedAt: details.visitedAt,
        recordedAt: new Date().toISOString(),
        latitude: input.venue.latitude,
        longitude: input.venue.longitude,
        routeGeoJson: input.venue.routeGeoJson,
        bestLapSeconds: details.bestLapSeconds,
        photoCount: photoPaths.length,
        hasObdLog: Boolean(obdLog),
        notes: details.notes,
        evidence: "owner_recorded",
      },
      window.localStorage,
    );
  } catch (error) {
    if (uploadedPaths.length)
      await client.storage.from("roadbook-visits").remove(uploadedPaths);
    if (error instanceof Error && error.message === "SIGN_IN_REQUIRED") {
      throw error;
    }
    throw new Error("VISIT_FAILED");
  }
}

export async function reportRoadbookVenue(
  venueId: string,
  input: RoadbookReportInput,
) {
  const report = roadbookReportSchema.parse(input);
  const { client, user } = await requireUser();
  const { error } = await client.from("venue_verifications").insert({
    venue_id: venueId,
    reporter_id: user.id,
    reason: report.reason,
    evidence_url: report.evidenceUrl || null,
    status: "pending",
  });
  if (error?.code === "23505") throw new Error("REPORT_ALREADY_EXISTS");
  if (error) throw new Error("REPORT_FAILED");
}

export async function isRoadbookModerator() {
  const { client } = await requireUser();
  const { data, error } = await client.rpc("community_has_role", {
    p_role: "moderator",
  });
  if (error) return false;
  return data === true;
}

export type RoadbookModerationReport = {
  id: string;
  venueId: string;
  venueName: string;
  reason: string;
  evidenceUrl?: string;
  createdAt: string;
};

export async function fetchRoadbookModerationQueue() {
  const { client } = await requireUser();
  const { data, error } = await client
    .from("venue_verifications")
    .select("id,venue_id,reason,evidence_url,created_at,roadbook_venues(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(50);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => {
    const relation = row.roadbook_venues as unknown as
      { name?: string } | { name?: string }[] | null;
    const venue = Array.isArray(relation) ? relation[0] : relation;
    return {
      id: row.id,
      venueId: row.venue_id,
      venueName: venue?.name ?? "Roadbook place",
      reason: row.reason,
      evidenceUrl: row.evidence_url ?? undefined,
      createdAt: row.created_at,
    } satisfies RoadbookModerationReport;
  });
}

export async function moderateRoadbookReport(
  reportId: string,
  status: "accepted" | "rejected",
  note: string,
) {
  const { client } = await requireUser();
  const { error } = await client.rpc("moderate_roadbook_report", {
    p_report_id: reportId,
    p_status: status,
    p_note: note,
  });
  if (error) throw new Error(error.message);
}
