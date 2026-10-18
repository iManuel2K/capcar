"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const NotificationBootstrap = dynamic(
  () =>
    import("@/components/notifications/notification-bootstrap").then(
      (module) => module.NotificationBootstrap,
    ),
  { ssr: false },
);

const ServiceWorkerRegistration = dynamic(
  () =>
    import("@/components/pwa/service-worker-registration").then(
      (module) => module.ServiceWorkerRegistration,
    ),
  { ssr: false },
);

const workspacePrefixes = [
  "/account",
  "/ai",
  "/garage",
  "/notifications",
  "/system",
] as const;

export function AppRuntimeBootstrap() {
  const pathname = usePathname() ?? "/";
  const isWorkspace = workspacePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isWorkspace) return null;

  return (
    <>
      <NotificationBootstrap />
      <ServiceWorkerRegistration />
    </>
  );
}
