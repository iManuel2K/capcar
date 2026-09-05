export type AuthStatus = {
  mode: "local" | "supabase";
  configured: boolean;
  message: string;
};

export function getAuthStatus(
  environment: Record<string, string | undefined> = process.env,
): AuthStatus {
  const configured = Boolean(
    environment.NEXT_PUBLIC_SUPABASE_URL &&
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  return configured
    ? {
        mode: "supabase",
        configured: true,
        message: "Supabase authentication and snapshot sync are available.",
      }
    : {
        mode: "local",
        configured: false,
        message: "Browser-local mode is active until Supabase is configured.",
      };
}
