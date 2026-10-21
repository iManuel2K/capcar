import type { AppLocale } from "@/i18n/config";

const titles = {
  en: {
    platform: "Digital Garage, Build Plans & Maintenance Records",
    sound: "Compare Engine & Exhaust Recordings",
    parts: "Search Car Parts by Part Number",
    planner: "Project Car Planner: Parts, Budget & Progress",
    maintenance: "Car Maintenance Tracker & Service History",
  },
  de: {
    platform: "Digitale Garage, Umbaupläne und Wartungseinträge",
    sound: "Motor- und Auspuffsounds vergleichen",
    parts: "Autoteile nach Teilenummer suchen",
    planner: "Projektwagen planen: Teile, Budget und Fortschritt",
    maintenance: "Autowartung und Servicehistorie dokumentieren",
  },
  el: {
    platform: "Ψηφιακό γκαράζ, μετατροπές και ιστορικό συντήρησης",
    sound: "Σύγκρινε ήχους κινητήρα και εξάτμισης",
    parts: "Αναζήτησε ανταλλακτικά με κωδικό",
    planner: "Σχεδίασε μετατροπές, ανταλλακτικά και προϋπολογισμό",
    maintenance: "Καταγραφή συντήρησης και ιστορικού αυτοκινήτου",
  },
  sq: {
    platform: "Garazh digjital, plane modifikimi dhe mirëmbajtje",
    sound: "Krahaso regjistrime motori dhe marmite",
    parts: "Kërko pjesë makine sipas kodit",
    planner: "Planifiko makinën: pjesë, buxhet dhe progres",
    maintenance: "Regjistri i mirëmbajtjes dhe historiku i servisit",
  },
  ja: {
    platform: "デジタルガレージ・カスタム計画・整備記録",
    sound: "エンジン・排気音の録音を比較",
    parts: "部品番号で自動車パーツを検索",
    planner: "プロジェクトカー計画：パーツ・予算・進捗",
    maintenance: "車の整備記録とサービス履歴を管理",
  },
};
export function publicTitle(locale: AppLocale, page: keyof typeof titles.en) {
  return titles[locale][page];
}
