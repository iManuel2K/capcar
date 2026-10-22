import { MotionLoader } from "@/components/ui/motion-loader";
import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("PublicStates");
  return (
    <main className="bg-background text-foreground min-h-dvh p-8">
      <p role="status" className="flex items-center gap-3">
        <MotionLoader />
        {t("loadingMarketplace")}
      </p>
    </main>
  );
}
