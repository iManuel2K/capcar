import type { Metadata } from "next";

import { PassportUnavailable } from "@/components/passport/passport-unavailable";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PublicStates");
  return {
    title: t("passportEyebrow"),
    robots: { index: false, follow: false },
  };
}

export default function PassportUnavailablePage() {
  return <PassportUnavailable />;
}
