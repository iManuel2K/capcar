import type { AppLocale } from "@/i18n/config";
export const buildProgressCopy: Record<
  AppLocale,
  {
    label: string;
    current: string;
    complete: string;
    steps: string[];
    statuses: Record<"planning" | "in_progress" | "complete", string>;
  }
> = {
  en: {
    label: "Build progress",
    current: "You are here",
    complete: "Complete",
    steps: ["Imagine", "Plan", "Find", "Visualize", "Build", "Remember"],
    statuses: {
      planning: "Planning",
      in_progress: "In progress",
      complete: "Complete",
    },
  },
  de: {
    label: "Baufortschritt",
    current: "Hier stehst du",
    complete: "Abgeschlossen",
    steps: [
      "Idee",
      "Planen",
      "Finden",
      "Visualisieren",
      "Umbauen",
      "Festhalten",
    ],
    statuses: {
      planning: "In Planung",
      in_progress: "In Arbeit",
      complete: "Abgeschlossen",
    },
  },
  el: {
    label: "Πρόοδος έργου",
    current: "Είσαι εδώ",
    complete: "Ολοκληρώθηκε",
    steps: [
      "Ιδέα",
      "Σχεδιασμός",
      "Εύρεση",
      "Απεικόνιση",
      "Εργασία",
      "Καταγραφή",
    ],
    statuses: {
      planning: "Σχεδιασμός",
      in_progress: "Σε εξέλιξη",
      complete: "Ολοκληρώθηκε",
    },
  },
  sq: {
    label: "Progresi i projektit",
    current: "Je këtu",
    complete: "Përfunduar",
    steps: [
      "Ideja",
      "Plani",
      "Kërkimi",
      "Vizualizimi",
      "Punimi",
      "Dokumentimi",
    ],
    statuses: {
      planning: "Në planifikim",
      in_progress: "Në punë",
      complete: "Përfunduar",
    },
  },
  ja: {
    label: "プロジェクトの進捗",
    current: "現在のステップ",
    complete: "完了",
    steps: ["アイデア", "計画", "部品探し", "イメージ", "作業", "記録"],
    statuses: { planning: "計画中", in_progress: "進行中", complete: "完了" },
  },
};
