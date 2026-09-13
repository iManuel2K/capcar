import { getTranslations } from "next-intl/server";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import {
  PublicSpecialists,
  type PublicSpecialist,
} from "@/components/community/public-specialists";
import { createClient } from "@/lib/supabase/server";
export async function generateMetadata() {
  const t = await getTranslations("Expansion");
  return { title: t("specialists") };
}
export default async function Page() {
  const t = await getTranslations("Expansion");
  let specialists: PublicSpecialist[] = [];
  let unavailable = false;
  try {
    const client = await createClient();
    const result = await client.rpc("browse_specialist_profiles");
    if (result.error || !Array.isArray(result.data))
      throw new Error("Unavailable");
    specialists = result.data;
  } catch {
    unavailable = true;
  }
  return (
    <div className="min-h-dvh bg-[#e8e6d7] text-[#0e2d30]">
      <MarketingHeader />
      <main className="mx-auto max-w-6xl px-5 py-12 sm:py-20">
        <h1 className="mb-8 text-4xl font-medium tracking-tight sm:text-6xl">
          {t("specialists")}
        </h1>
        <PublicSpecialists
          specialists={specialists}
          unavailable={unavailable}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
