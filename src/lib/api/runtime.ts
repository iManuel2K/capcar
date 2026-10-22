export function isProductionRuntime(
  environment: Record<string, string | undefined> = process.env,
) {
  return (
    environment.NODE_ENV === "production" ||
    environment.NEXT_PUBLIC_DEPLOYMENT_ENV === "production" ||
    environment.CONTEXT === "production" ||
    environment.VERCEL_ENV === "production"
  );
}
