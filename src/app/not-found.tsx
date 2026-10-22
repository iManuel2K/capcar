import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("ErrorUi");
  return (
    <main className="bg-background text-foreground grid min-h-dvh place-items-center px-5 text-center">
      <div>
        <p className="text-primary text-xs tracking-[0.16em] uppercase">
          {t("notFound")}
        </p>
        <h1 className="mt-4 text-5xl font-medium tracking-[-0.05em]">
          {t("roadEnds")}
        </h1>
        <p className="text-muted-foreground mt-4">{t("notFoundDescription")}</p>
        <Link
          href="/"
          className="bg-primary text-primary-foreground mt-7 inline-flex rounded-xl px-5 py-3 text-sm font-semibold"
        >
          {t("home")}
        </Link>
      </div>
    </main>
  );
}
