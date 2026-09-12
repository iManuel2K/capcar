import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("PublicStates");
  return (
    <main className="min-h-dvh bg-[#e8e6d7] p-8 text-[#0e2d30]">
      <p role="status">{t("loadingMarketplace")}</p>
    </main>
  );
}
