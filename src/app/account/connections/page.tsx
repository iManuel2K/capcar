import type { Metadata } from "next";

import {
  ConnectionWorkspace,
  type ConnectionStatus,
} from "@/components/account/connection-workspace";
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
  searchParams: Promise<{ connection?: string }>;
}) {
  const { connection } = await searchParams;
  const setup = getGoogleConnectionStatus();
  let initialStatus: ConnectionStatus = {
    configured: setup.configured,
    connected: false,
    message: setup.message,
  };
  if (setup.configured) {
    try {
      const user = await currentUser();
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
      initialStatus={initialStatus}
    />
  );
}
