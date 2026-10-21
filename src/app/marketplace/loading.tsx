import { MotionLoader } from "@/components/ui/motion-loader";
import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("PublicStates");
  return (
    <main className="min-h-dvh bg-[#e8e6d7] p-8 text-[#0e2d30]">
      <p role="status" className="flex items-center gap-3">
        <MotionLoader />
        {t("loadingMarketplace")}
      </p>
    </main>
  );
}
