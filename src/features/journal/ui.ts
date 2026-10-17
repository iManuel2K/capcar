import type { AppLocale } from "@/i18n/config";

type JournalUI = {
  label: string;
  title: string;
  description: string;
  language: string;
  headline: string;
  intro: string;
  allArticles: string;
  readArticle: string;
  readTime: string;
  editorial: string;
  related: string;
  missingTitle: string;
  missingBody: string;
};

export const journalUI: Record<AppLocale, JournalUI> = {
  en: {
    label: "Journal",
    title: "Journal: BMW projects, maintenance and day trips",
    description:
      "Practical BMW projects, vehicle guides, maintenance records and driving ideas with interactive checklists in CapCar.",
    language: "English",
    headline: "Your car.\nYour next step.",
    intro:
      "A weekend job, a clear maintenance record or a day by the Rhine. Read the guides and take the next step inside CapCar.",
    allArticles: "All articles",
    readArticle: "Read the article and use the checklist",
    readTime: "{minutes} min read",
    editorial: "CapCar Editorial",
    related: "Your next article",
    missingTitle: "This article is not available.",
    missingBody: "Find the latest articles in the CapCar Journal.",
  },
  de: {
    label: "Journal",
    title: "Journal: BMW-Projekte, Wartung und Ausflüge",
    description:
      "BMW-Projekte, Fahrzeuganleitungen, Wartungsdokumentation und Ausflugsideen mit interaktiven Checklisten in CapCar.",
    language: "Deutsch",
    headline: "Dein Auto.\nDein nächster Schritt.",
    intro:
      "Ein Wochenendjob, ein klarer Wartungseintrag oder ein freier Tag am Rhein. Lies die Artikel und setze deinen nächsten Schritt direkt in CapCar um.",
    allArticles: "Alle Artikel",
    readArticle: "Artikel und Checkliste öffnen",
    readTime: "{minutes} Min. Lesezeit",
    editorial: "CapCar Redaktion",
    related: "Dein nächster Artikel",
    missingTitle: "Dieser Artikel ist nicht verfügbar.",
    missingBody: "Unsere aktuellen Artikel findest du im CapCar Journal.",
  },
  el: {
    label: "Άρθρα",
    title: "Άρθρα: BMW, συντήρηση και εκδρομές",
    description:
      "Έργα BMW, οδηγοί οχήματος, καταγραφές συντήρησης και ιδέες διαδρομών με διαδραστικές λίστες στο CapCar.",
    language: "Ελληνικά",
    headline: "Το αυτοκίνητό σου.\nΤο επόμενο βήμα σου.",
    intro:
      "Μια εργασία, μια σαφής καταγραφή συντήρησης ή μια μέρα στον Ρήνο. Διάβασε τους οδηγούς και συνέχισε μέσα στο CapCar.",
    allArticles: "Όλα τα άρθρα",
    readArticle: "Άρθρο και διαδραστική λίστα",
    readTime: "Ανάγνωση {minutes} λεπτών",
    editorial: "Συντακτική ομάδα CapCar",
    related: "Το επόμενο άρθρο σου",
    missingTitle: "Αυτό το άρθρο δεν είναι διαθέσιμο.",
    missingBody: "Βρες τα τελευταία άρθρα στο CapCar Journal.",
  },
  sq: {
    label: "Artikuj",
    title: "Artikuj: projekte BMW, mirëmbajtje dhe udhëtime",
    description:
      "Projekte BMW, udhëzues, dokumentim mirëmbajtjeje dhe ide udhëtimesh me lista interaktive në CapCar.",
    language: "Shqip",
    headline: "Makina jote.\nHapi yt i ardhshëm.",
    intro:
      "Një punë fundjave, një regjistrim mirëmbajtjeje ose një ditë pranë Rinit. Lexo udhëzuesit dhe vazhdo drejtpërdrejt në CapCar.",
    allArticles: "Të gjithë artikujt",
    readArticle: "Lexo artikullin dhe përdor listën",
    readTime: "{minutes} min lexim",
    editorial: "Redaksia CapCar",
    related: "Artikulli yt i ardhshëm",
    missingTitle: "Ky artikull nuk është i disponueshëm.",
    missingBody: "Gjej artikujt më të fundit në CapCar Journal.",
  },
  ja: {
    label: "ジャーナル",
    title: "ジャーナル：BMWの作業計画、整備、ドライブ",
    description:
      "BMWの計画、車両ガイド、整備記録、ドライブのアイデアを、CapCarの対話式チェックリストで実践できます。",
    language: "日本語",
    headline: "あなたの車。\n次の一歩。",
    intro:
      "週末の作業、分かりやすい整備記録、ライン川への日帰り旅行。記事を読み、CapCarで次の行動につなげましょう。",
    allArticles: "すべての記事",
    readArticle: "記事とチェックリストを開く",
    readTime: "読了まで約{minutes}分",
    editorial: "CapCar編集部",
    related: "次に読む記事",
    missingTitle: "この記事は見つかりません。",
    missingBody: "最新の記事はCapCarジャーナルでご覧いただけます。",
  },
};

export function journalReadingTime(locale: AppLocale, minutes: number) {
  return journalUI[locale].readTime.replace("{minutes}", String(minutes));
}
