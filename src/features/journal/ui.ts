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
  free: string;
  worksheet: string;
  download: string;
  downloadNote: string;
  ctaTitle: string;
  ctaBody: string;
  cta: string;
  related: string;
  missingTitle: string;
  missingBody: string;
};

export const journalUI: Record<AppLocale, JournalUI> = {
  en: {
    label: "Journal",
    title: "Journal: BMW projects, maintenance and day trips",
    description:
      "Practical BMW project planning, maintenance records and driving ideas. Four guides with free worksheets for your next step.",
    language: "English",
    headline: "Your car.\nYour next step.",
    intro:
      "A weekend job, a clear maintenance record or a day by the Rhine. Practical guides and free worksheets for life with your car.",
    allArticles: "All articles",
    readArticle: "Read the article and get the worksheet",
    readTime: "{minutes} min read",
    editorial: "CapCar Editorial",
    free: "Take it with you · Free",
    worksheet: "Your worksheet for the next step",
    download: "Download worksheet (.txt)",
    downloadNote:
      "No account needed. Fill it in using your text editor or print it.",
    ctaTitle: "Your car deserves a clear plan.",
    ctaBody: "Discover CapCar and start with your vehicle.",
    cta: "Start with CapCar",
    related: "Your next article",
    missingTitle: "This article is not available.",
    missingBody: "Find the latest articles in the CapCar Journal.",
  },
  de: {
    label: "Journal",
    title: "Journal: BMW-Projekte, Wartung und Ausflüge",
    description:
      "Praktische BMW-Projektplanung, Wartungsdokumentation und Ausflugsideen. Vier Leitfäden mit kostenlosen Vorlagen für deinen nächsten Schritt.",
    language: "Deutsch",
    headline: "Dein Auto.\nDein nächster Schritt.",
    intro:
      "Ein Wochenendjob, ein klarer Wartungseintrag oder ein freier Tag am Rhein. Hier findest du praktische Leitfäden und kostenlose Vorlagen für dein Leben mit dem Auto.",
    allArticles: "Alle Artikel",
    readArticle: "Artikel und Vorlage ansehen",
    readTime: "{minutes} Min. Lesezeit",
    editorial: "CapCar Redaktion",
    free: "Zum Mitnehmen · Kostenlos",
    worksheet: "Deine Vorlage für den nächsten Schritt",
    download: "Vorlage herunterladen (.txt)",
    downloadNote:
      "Ohne Anmeldung. In deinem Texteditor ausfüllen oder ausdrucken.",
    ctaTitle: "Dein Auto verdient einen klaren Plan.",
    ctaBody: "Lerne CapCar kennen und starte mit deinem Fahrzeug.",
    cta: "Mit CapCar starten",
    related: "Dein nächster Artikel",
    missingTitle: "Dieser Artikel ist nicht verfügbar.",
    missingBody: "Unsere aktuellen Artikel findest du im CapCar Journal.",
  },
  el: {
    label: "Άρθρα",
    title: "Άρθρα: BMW, συντήρηση και εκδρομές",
    description:
      "Πρακτική οργάνωση εργασιών BMW, καταγραφή συντήρησης και ιδέες εκδρομών. Τέσσερις οδηγοί με δωρεάν πρότυπα για το επόμενο βήμα σου.",
    language: "Ελληνικά",
    headline: "Το αυτοκίνητό σου.\nΤο επόμενο βήμα σου.",
    intro:
      "Μια εργασία το Σαββατοκύριακο, ένα σαφές ιστορικό συντήρησης ή μια μέρα στον Ρήνο. Πρακτικοί οδηγοί και δωρεάν πρότυπα για τη ζωή με το αυτοκίνητό σου.",
    allArticles: "Όλα τα άρθρα",
    readArticle: "Δες το άρθρο και το πρότυπο",
    readTime: "Ανάγνωση {minutes} λεπτών",
    editorial: "Συντακτική ομάδα CapCar",
    free: "Για να το κρατήσεις · Δωρεάν",
    worksheet: "Το πρότυπό σου για το επόμενο βήμα",
    download: "Λήψη προτύπου (.txt)",
    downloadNote:
      "Χωρίς λογαριασμό. Συμπλήρωσέ το σε επεξεργαστή κειμένου ή εκτύπωσέ το.",
    ctaTitle: "Το αυτοκίνητό σου αξίζει ένα σαφές πλάνο.",
    ctaBody: "Γνώρισε το CapCar και ξεκίνα με το αυτοκίνητό σου.",
    cta: "Ξεκίνα με το CapCar",
    related: "Το επόμενο άρθρο σου",
    missingTitle: "Αυτό το άρθρο δεν είναι διαθέσιμο.",
    missingBody: "Βρες τα τελευταία άρθρα στο CapCar Journal.",
  },
  sq: {
    label: "Artikuj",
    title: "Artikuj: projekte BMW, mirëmbajtje dhe udhëtime",
    description:
      "Planifikim praktik për BMW-në, regjistrim mirëmbajtjeje dhe ide udhëtimesh. Katër udhëzues me modele falas për hapin tënd të ardhshëm.",
    language: "Shqip",
    headline: "Makina jote.\nHapi yt i ardhshëm.",
    intro:
      "Një punë për fundjavë, një regjistrim i qartë mirëmbajtjeje ose një ditë pranë Rinit. Udhëzues praktikë dhe modele falas për jetën me makinën tënde.",
    allArticles: "Të gjithë artikujt",
    readArticle: "Shiko artikullin dhe modelin",
    readTime: "{minutes} min lexim",
    editorial: "Redaksia CapCar",
    free: "Për ta ruajtur · Falas",
    worksheet: "Modeli yt për hapin e ardhshëm",
    download: "Shkarko modelin (.txt)",
    downloadNote:
      "Pa llogari. Plotësoje në redaktuesin e tekstit ose printoje.",
    ctaTitle: "Makina jote meriton një plan të qartë.",
    ctaBody: "Njihu me CapCar dhe fillo me makinën tënde.",
    cta: "Fillo me CapCar",
    related: "Artikulli yt i ardhshëm",
    missingTitle: "Ky artikull nuk është i disponueshëm.",
    missingBody: "Gjej artikujt më të fundit në CapCar Journal.",
  },
  ja: {
    label: "ジャーナル",
    title: "ジャーナル：BMWの作業計画、整備、ドライブ",
    description:
      "BMWの作業計画、整備記録、ドライブのアイデア。次の一歩に役立つ4つのガイドと無料ワークシート。",
    language: "日本語",
    headline: "あなたの車。\n次の一歩。",
    intro:
      "週末の作業、分かりやすい整備記録、ライン川沿いの休日。車との暮らしに役立つガイドと無料ワークシートを紹介します。",
    allArticles: "すべての記事",
    readArticle: "記事とワークシートを見る",
    readTime: "読了まで約{minutes}分",
    editorial: "CapCar編集部",
    free: "持ち帰れる資料・無料",
    worksheet: "次の一歩のためのワークシート",
    download: "ワークシートをダウンロード（.txt）",
    downloadNote:
      "登録不要。テキストエディターで記入するか、印刷して使えます。",
    ctaTitle: "愛車に、分かりやすい計画を。",
    ctaBody: "CapCarを知って、あなたの車から始めましょう。",
    cta: "CapCarを始める",
    related: "次に読む記事",
    missingTitle: "この記事は見つかりません。",
    missingBody: "最新の記事はCapCarジャーナルでご覧いただけます。",
  },
};

export function journalReadingTime(locale: AppLocale, minutes: number) {
  return journalUI[locale].readTime.replace("{minutes}", String(minutes));
}
