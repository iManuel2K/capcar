import { data as officialA } from "./source-catalog-official-a";
import { data as officialB } from "./source-catalog-official-b";
import { data as photos0 } from "./source-catalog-photos-0";
import { data as photos1 } from "./source-catalog-photos-1";
import { data as photos2 } from "./source-catalog-photos-2";
import { data as photos3 } from "./source-catalog-photos-3";

export const roadbookScoutSources = [...officialA, ...officialB];
export const europeanPhotoTargets = [...photos0, ...photos1, ...photos2, ...photos3];

export function entriesForShard<T extends { key: string }>(entries: readonly T[], shard: number, shardCount: number) {
  return entries.filter((_, index) => index % shardCount === shard);
}
