import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("PublicStates");
  return (
    <main
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="min-h-dvh bg-[#0b0e0c] px-5 py-8 text-white sm:p-8"
    >
      <span className="sr-only">{t("loadingCapcar")}</span>
      <div className="mx-auto max-w-6xl animate-pulse motion-reduce:animate-none">
        <div className="h-12 w-40 rounded-full bg-white/[0.055]" />
        <div className="mt-12 h-[62vh] min-h-96 rounded-[2rem] border border-white/[0.045] bg-white/[0.035]" />
      </div>
    </main>
  );
}
