import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("ErrorUi");
  return (
    <main className="grid min-h-dvh place-items-center bg-[#0b0e0c] px-5 text-center text-[#f4f5f2]">
      <div>
        <p className="text-xs tracking-[0.16em] text-[#ff667a] uppercase">
          {t("notFound")}
        </p>
        <h1 className="mt-4 text-5xl font-medium tracking-[-0.05em]">
          {t("roadEnds")}
        </h1>
        <p className="mt-4 text-white/40">{t("notFoundDescription")}</p>
        <Link
          href="/"
          className="mt-7 inline-flex rounded-xl bg-[#e72d45] px-5 py-3 text-sm font-semibold text-[#07101d]"
        >
          {t("home")}
        </Link>
      </div>
    </main>
  );
}
