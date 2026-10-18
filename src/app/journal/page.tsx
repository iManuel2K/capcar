import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { journalPath, resolveJournalLocale } from "@/features/journal/routes";

export default async function JournalRedirect() {
  redirect(journalPath(resolveJournalLocale(await getLocale())));
}
