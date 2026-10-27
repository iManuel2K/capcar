import type { AppLocale } from "@/i18n/config";

type PricingCopy = {
  nav: string;
  title: string;
  description: string;
  price: string;
  planDescription: string;
  features: string[];
  action: string;
  note: string;
};
export const pricingCopy: Record<AppLocale, PricingCopy> = {
  en: {
    nav: "Pricing",
    title: "Simple pricing.",
    description:
      "Your car, your projects and your progress. Start with CapCar for free.",
    price: "Free",
    planDescription: "For your car, and everything you plan next.",
    features: [
      "Your digital garage",
      "Build plans and budgets",
      "Maintenance and vehicle history",
      "Parts search and comparison",
      "Roadbook places and drives",
    ],
    action: "Create your garage",
    note: "Parts purchases and any connected AI service costs are separate.",
  },
  de: {
    nav: "Preise",
    title: "Einfach kostenlos.",
    description:
      "Dein Auto, deine Projekte und dein Fortschritt. Starte kostenlos mit CapCar.",
    price: "Kostenlos",
    planDescription: "Für dein Auto und alles, was du als Nächstes vorhast.",
    features: [
      "Deine digitale Garage",
      "Projektpläne und Budgets",
      "Wartung und Fahrzeughistorie",
      "Teilesuche und Vergleich",
      "Roadbook-Orte und Ausfahrten",
    ],
    action: "Garage erstellen",
    note: "Teilekäufe und mögliche Kosten verbundener KI-Dienste sind separat.",
  },
  el: {
    nav: "Τιμές",
    title: "Απλά, δωρεάν.",
    description:
      "Το αυτοκίνητο, τα project και η πρόοδός σου. Ξεκίνα δωρεάν με το CapCar.",
    price: "Δωρεάν",
    planDescription: "Για το αυτοκίνητό σου και όσα σχεδιάζεις στη συνέχεια.",
    features: [
      "Το ψηφιακό σου γκαράζ",
      "Πλάνα project και προϋπολογισμοί",
      "Συντήρηση και ιστορικό οχήματος",
      "Αναζήτηση και σύγκριση ανταλλακτικών",
      "Μέρη και διαδρομές στο Roadbook",
    ],
    action: "Δημιούργησε το γκαράζ σου",
    note: "Οι αγορές ανταλλακτικών και τυχόν χρεώσεις συνδεδεμένων υπηρεσιών AI είναι ξεχωριστές.",
  },
  sq: {
    nav: "Çmimet",
    title: "Thjesht, falas.",
    description: "Makina, projektet dhe përparimi yt. Fillo falas me CapCar.",
    price: "Falas",
    planDescription: "Për makinën tënde dhe gjithçka që planifikon më pas.",
    features: [
      "Garazhi yt digjital",
      "Plane projektesh dhe buxhete",
      "Mirëmbajtja dhe historiku i makinës",
      "Kërkimi dhe krahasimi i pjesëve",
      "Vende dhe udhëtime në Roadbook",
    ],
    action: "Krijo garazhin tënd",
    note: "Blerjet e pjesëve dhe tarifat e mundshme të shërbimeve AI të lidhura janë më vete.",
  },
  ja: {
    nav: "料金",
    title: "シンプルに、無料。",
    description: "愛車も、計画も、進捗も。CapCarを無料で始めましょう。",
    price: "無料",
    planDescription: "愛車と、これからやりたいことのために。",
    features: [
      "自分のデジタルガレージ",
      "カスタム計画と予算",
      "メンテナンスと車両履歴",
      "パーツの検索と比較",
      "Roadbookのスポットとドライブ",
    ],
    action: "ガレージを作成",
    note: "パーツの購入費用や接続するAIサービスの利用料金は別途かかります。",
  },
};
