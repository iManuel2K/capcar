import type { Metadata } from "next";

import {
  ConnectionWorkspace,
  type AiConnectionStatus,
  type ConnectionStatus,
} from "@/components/account/connection-workspace";
import {
  connectionStatus,
  getAiConnection,
  getAiConnectionSetup,
} from "@/features/connections/ai-connection";
import {
  getGoogleConnectionStatus,
  GOOGLE_OAUTH_SCOPES,
} from "@/features/connections/google-connection";
import { getGoogleConnection } from "@/features/connections/google-store";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentUser } from "@/lib/supabase/current-user";

export const metadata: Metadata = {
  title: "Connections",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function ConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ connection?: string; next?: string }>;
}) {
  const { connection, next } = await searchParams;
  const returnTo =
    next?.startsWith("/") && !next.startsWith("//") ? next : undefined;
  const setup = getGoogleConnectionStatus();
  let initialStatus: ConnectionStatus = {
    configured: setup.configured,
    connected: false,
    message: setup.message,
  };
  const aiSetup = getAiConnectionSetup();
  let initialAiStatus: AiConnectionStatus = {
    configured: aiSetup.configured,
    connected: false,
  };
  const user = await currentUser();
  if (aiSetup.configured && user) {
    try {
      initialAiStatus = connectionStatus(
        await getAiConnection(createAdminClient(), user.id),
      );
    } catch {
      initialAiStatus = {
        configured: true,
        connected: false,
      };
    }
  }
  if (setup.configured) {
    try {
      const record = user
        ? await getGoogleConnection(createAdminClient(), user.id)
        : null;
      initialStatus = {
        configured: true,
        connected: Boolean(record),
        email: record?.provider_account_email,
        lastSyncedAt: record?.last_synced_at,
        syncStatus: record?.sync_status,
        summary: record?.sync_summary,
        permissions: {
          calendar: GOOGLE_OAUTH_SCOPES.some((scope) =>
            scope.includes("calendar.events"),
          ),
          mailMetadata: GOOGLE_OAUTH_SCOPES.some((scope) =>
            scope.includes("gmail.metadata"),
          ),
        },
      };
    } catch {
      initialStatus = {
        configured: true,
        connected: false,
        message: "Connection status is temporarily unavailable.",
      };
    }
  }
  return (
    <ConnectionWorkspace
      connectionResult={connection}
      initialAiStatus={initialAiStatus}
      initialStatus={initialStatus}
      returnTo={returnTo}
    />
  );
}
