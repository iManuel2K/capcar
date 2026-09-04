import { z } from "zod";

export const bodyStyles = [
  "Sedan",
  "Touring",
  "Coupe",
  "Convertible",
  "Hatchback",
  "SUV",
] as const;

export const transmissions = ["Manual", "Automatic"] as const;

const optionalVin = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const normalized = value.trim().toUpperCase();
    return normalized === "" ? undefined : normalized;
  },
  z
    .string()
    .length(17, "VIN must contain exactly 17 characters")
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/, "VIN contains an invalid character")
    .optional(),
);

export const vehicleInputSchema = z.object({
  make: z.literal("BMW"),
  model: z.string().trim().min(2, "Enter the BMW model").max(40),
  productionYear: z.coerce
    .number()
    .int()
    .min(2008, "Capcar currently supports BMWs from 2008")
    .max(2027, "Check the production year"),
  platform: z
    .string()
    .trim()
    .min(2, "Enter a chassis code such as E90 or F31")
    .max(12)
    .transform((value) => value.toUpperCase()),
  bodyStyle: z.enum(bodyStyles, { error: "Select the body style" }),
  engineCode: z
    .string()
    .trim()
    .min(2, "Enter the engine code or choose Unknown")
    .max(20)
    .transform((value) => value.toUpperCase()),
  transmission: z.enum(transmissions, { error: "Select the transmission" }),
  mileage: z.coerce
    .number()
    .int()
    .min(0, "Mileage cannot be negative")
    .max(2_000_000, "Check the mileage"),
  color: z.string().trim().max(40).optional(),
  nickname: z.string().trim().max(40).optional(),
  vin: optionalVin,
});

export const vehicleSchema = vehicleInputSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
});

export type VehicleInput = z.input<typeof vehicleInputSchema>;
export type NormalizedVehicleInput = z.output<typeof vehicleInputSchema>;
export type Vehicle = z.infer<typeof vehicleSchema>;
