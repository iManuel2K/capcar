import type { AppLocale } from "@/i18n/config";

export const setupFields = [
  "make",
  "model",
  "productionYear",
  "platform",
  "engineCode",
  "mileage",
  "title",
  "estimate",
] as const;
export type SetupField = (typeof setupFields)[number];
type Copy = {
  errorTitle: string;
  noMatches: string;
  fields: Record<SetupField, string>;
};
export const validationCopy: Record<AppLocale, Copy> = {
  en: {
    errorTitle: "Check these details",
    noMatches: "No cars match your search. Add your car manually below.",
    fields: {
      make: "Enter a make with at least 2 characters.",
      model: "Enter the car model.",
      productionYear: "Enter a year from 1886 to 2027.",
      platform: "Use at least 2 characters for the chassis, or leave it blank.",
      engineCode:
        "Use at least 2 characters for the engine code, or leave it blank.",
      mileage: "Enter mileage from 0 to 2,000,000 km, or leave it blank.",
      title: "Describe your first action in 2–100 characters.",
      estimate:
        "Enter a whole-euro estimate from 0 to 1,000,000, or leave it blank.",
    },
  },
  de: {
    errorTitle: "Prüfe diese Angaben",
    noMatches:
      "Keine passenden Autos gefunden. Füge dein Auto unten manuell hinzu.",
    fields: {
      make: "Gib eine Marke mit mindestens 2 Zeichen ein.",
      model: "Gib das Automodell ein.",
      productionYear: "Gib ein Baujahr von 1886 bis 2027 ein.",
      platform:
        "Gib mindestens 2 Zeichen für die Baureihe ein oder lasse das Feld leer.",
      engineCode:
        "Gib mindestens 2 Zeichen für den Motorcode ein oder lasse das Feld leer.",
      mileage: "Gib 0 bis 2.000.000 km ein oder lasse das Feld leer.",
      title: "Beschreibe deinen ersten Schritt mit 2–100 Zeichen.",
      estimate: "Gib 0 bis 1.000.000 ganze Euro ein oder lasse das Feld leer.",
    },
  },
  el: {
    errorTitle: "Έλεγξε αυτά τα στοιχεία",
    noMatches:
      "Δεν βρέθηκαν αυτοκίνητα. Πρόσθεσε το δικό σου χειροκίνητα παρακάτω.",
    fields: {
      make: "Γράψε μάρκα με τουλάχιστον 2 χαρακτήρες.",
      model: "Γράψε το μοντέλο του αυτοκινήτου.",
      productionYear: "Γράψε έτος από το 1886 έως το 2027.",
      platform:
        "Γράψε τουλάχιστον 2 χαρακτήρες για το πλαίσιο ή άφησέ το κενό.",
      engineCode:
        "Γράψε τουλάχιστον 2 χαρακτήρες για τον κωδικό κινητήρα ή άφησέ το κενό.",
      mileage: "Γράψε από 0 έως 2.000.000 χλμ. ή άφησέ το κενό.",
      title: "Περίγραψε την πρώτη ενέργεια με 2–100 χαρακτήρες.",
      estimate: "Γράψε ακέραιο ποσό από 0 έως 1.000.000 ευρώ ή άφησέ το κενό.",
    },
  },
  sq: {
    errorTitle: "Kontrollo këto të dhëna",
    noMatches:
      "Nuk u gjet asnjë makinë. Shto makinën tënde manualisht më poshtë.",
    fields: {
      make: "Shkruaj një markë me të paktën 2 karaktere.",
      model: "Shkruaj modelin e makinës.",
      productionYear: "Shkruaj vitin nga 1886 deri në 2027.",
      platform: "Shkruaj të paktën 2 karaktere për shasinë ose lëre bosh.",
      engineCode:
        "Shkruaj të paktën 2 karaktere për kodin e motorit ose lëre bosh.",
      mileage: "Shkruaj nga 0 deri në 2.000.000 km ose lëre bosh.",
      title: "Përshkruaj veprimin e parë me 2–100 karaktere.",
      estimate:
        "Shkruaj një shumë të plotë nga 0 deri në 1.000.000 euro ose lëre bosh.",
    },
  },
  ja: {
    errorTitle: "入力内容を確認してください",
    noMatches: "一致する車が見つかりません。下の欄から手動で追加できます。",
    fields: {
      make: "メーカー名を2文字以上で入力してください。",
      model: "車種を入力してください。",
      productionYear: "1886〜2027年の年式を入力してください。",
      platform: "シャシーコードを2文字以上で入力するか、空欄にしてください。",
      engineCode: "エンジンコードを2文字以上で入力するか、空欄にしてください。",
      mileage: "0〜2,000,000kmを入力するか、空欄にしてください。",
      title: "最初の作業を2〜100文字で入力してください。",
      estimate: "0〜1,000,000ユーロの整数を入力するか、空欄にしてください。",
    },
  },
};
