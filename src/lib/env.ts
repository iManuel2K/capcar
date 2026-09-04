import { z } from "zod";

export const supabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

export type SupabaseEnv = z.infer<typeof supabaseEnvSchema>;

export function parseSupabaseEnv(input: unknown): SupabaseEnv {
  const result = supabaseEnvSchema.safeParse(input);

  if (!result.success) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local and provide the project URL and publishable key.",
      { cause: result.error },
    );
  }

  return result.data;
}

export function getSupabaseEnv(): SupabaseEnv {
  return parseSupabaseEnv({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
