import {
  hasSnapshotData,
  snapshotsMatch,
  type LocalSnapshot,
} from "@/features/sync/local-snapshot";

export type SnapshotDecision =
  "empty" | "use-local" | "use-remote" | "conflict";

export function decideInitialSnapshot({
  currentUserId,
  previousUserId,
  local,
  remote,
  localChangedAt,
  remoteUpdatedAt,
}: {
  currentUserId: string;
  previousUserId: string | null;
  local: LocalSnapshot;
  remote?: LocalSnapshot;
  localChangedAt?: string;
  remoteUpdatedAt?: string;
}): SnapshotDecision {
  if (previousUserId && previousUserId !== currentUserId) {
    return remote && hasSnapshotData(remote) ? "use-remote" : "empty";
  }

  const hasLocal = hasSnapshotData(local);
  const hasRemote = Boolean(remote && hasSnapshotData(remote));
  if (!hasLocal && !hasRemote) return "empty";
  if (!hasRemote) return "use-local";
  if (!hasLocal || (remote && snapshotsMatch(local, remote))) {
    return "use-remote";
  }

  if (localChangedAt && remoteUpdatedAt) {
    return localChangedAt > remoteUpdatedAt ? "use-local" : "use-remote";
  }

  return "conflict";
}
