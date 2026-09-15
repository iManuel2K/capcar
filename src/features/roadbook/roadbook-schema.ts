import { z } from "zod";

export const roadbookCategories = [
  "drift_circuit",
  "drag_acceleration",
  "track_day",
  "proving_ground",
  "scenic_route",
  "autobahn_context",
] as const;

export const roadbookMapModes = [
  "workshop_cream",
  "petrol_night",
  "blueprint",
  "touring_clay",
] as const;

export const roadbookAccessStatuses = [
  "closed_venue",
  "private",
  "permit_required",
  "public_context",
  "unknown",
] as const;

export const roadbookVerificationStatuses = [
  "verified",
  "official_source",
  "community_report",
  "stale",
  "unverified",
] as const;

export type RoadbookCategory = (typeof roadbookCategories)[number];
export type RoadbookMapMode = (typeof roadbookMapModes)[number];
export type RoadbookAccessStatus = (typeof roadbookAccessStatuses)[number];
export type RoadbookVerificationStatus =
  (typeof roadbookVerificationStatuses)[number];

const lineStringSchema = z.object({
  type: z.literal("LineString"),
  coordinates: z.array(z.tuple([z.number(), z.number()])).min(2),
});

const nullableString = z
  .string()
  .nullable()
  .transform((value) => value ?? undefined);
const nullableNumber = z
  .number()
  .nullable()
  .transform((value) => value ?? undefined);

const roadbookVenueRowSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(2),
    slug: z.string().min(1),
    category: z.enum(roadbookCategories),
    description: z.string(),
    access_status: z.enum(roadbookAccessStatuses),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    route_geojson: lineStringSchema.nullable(),
    country_code: z.string().length(2),
    city: z.string(),
    surface: nullableString,
    length_m: nullableNumber,
    noise_limit_db: nullableNumber,
    opening_hours: z.record(z.string(), z.string()),
    booking_url: z.string().url().nullable(),
    entry_price_cents: nullableNumber,
    price_currency: z.string().length(3),
    requirements: z.record(z.string(), z.unknown()),
    source_label: z.string().min(2),
    source_url: z.string().url(),
    verification_status: z.enum(roadbookVerificationStatuses),
    verified_at: z.string().datetime().nullable(),
    distance_m: z.number().nonnegative(),
  })
  .transform((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    description: row.description,
    accessStatus: row.access_status,
    latitude: row.latitude,
    longitude: row.longitude,
    routeGeoJson: row.route_geojson ?? undefined,
    countryCode: row.country_code,
    city: row.city,
    surface: row.surface,
    lengthM: row.length_m,
    noiseLimitDb: row.noise_limit_db,
    openingHours: row.opening_hours,
    bookingUrl: row.booking_url ?? undefined,
    entryPriceCents: row.entry_price_cents,
    priceCurrency: row.price_currency,
    requirements: row.requirements,
    sourceLabel: row.source_label,
    sourceUrl: row.source_url,
    verificationStatus: row.verification_status,
    verifiedAt: row.verified_at ?? undefined,
    distanceM: row.distance_m,
  }));

export const roadbookVenueListSchema = z.array(roadbookVenueRowSchema);
export type RoadbookVenue = z.infer<typeof roadbookVenueRowSchema>;

export const roadbookVisitRecordSchema = z.object({
  id: z.string().uuid(),
  vehicleId: z.string().min(1),
  venueId: z.string().uuid(),
  venueName: z.string().min(2),
  category: z.enum(roadbookCategories),
  visitedAt: z.string().date(),
  recordedAt: z.string().datetime(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  routeGeoJson: lineStringSchema.optional(),
  bestLapSeconds: z.number().positive().max(86400).optional(),
  photoCount: z.number().int().nonnegative().max(4),
  hasObdLog: z.boolean(),
  notes: z.string().max(2000).optional(),
  evidence: z.literal("owner_recorded"),
});

export type RoadbookVisitRecord = z.infer<typeof roadbookVisitRecordSchema>;

export const recordRoadbookVisitSchema = z.object({
  visitedAt: z.string().date(),
  notes: z.string().trim().max(2000).optional(),
  bestLapSeconds: z.number().positive().max(86400).optional(),
});

export type RecordRoadbookVisitInput = z.infer<
  typeof recordRoadbookVisitSchema
>;

export const roadbookReportSchema = z.object({
  reason: z.string().trim().min(10).max(1000),
  evidenceUrl: z.string().trim().url().optional(),
});

export type RoadbookReportInput = z.infer<typeof roadbookReportSchema>;
