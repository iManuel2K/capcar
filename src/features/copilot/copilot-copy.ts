import type { AppLocale } from "@/i18n/config";
const t = (
  en: string,
  de: string,
  el: string,
  sq: string,
  ja: string,
): Record<AppLocale, string> => ({ en, de, el, sq, ja });
export const copilotCopy = {
  rules: t(
    "Limited rules mode",
    "Eingeschränkter Regelmodus",
    "Περιορισμένοι κανόνες",
    "Rregulla të kufizuara",
    "限定ルールモード",
  ),
  connected: t(
    "Connected AI",
    "Verbundene KI",
    "Συνδεδεμένη AI",
    "AI e lidhur",
    "接続済みAI",
  ),
  connect: t(
    "Connect or manage your AI",
    "KI verbinden oder verwalten",
    "Σύνδεση ή διαχείριση AI",
    "Lidh ose menaxho AI-në",
    "AIの接続・管理",
  ),
  limited: t(
    "No AI connected. Replies use limited planning rules. Connect Gemini, OpenAI or Claude through Account → Connections.",
    "Keine KI verbunden. Antworten nutzen begrenzte Planungsregeln. Verbinde Gemini, OpenAI oder Claude über Konto → Verbindungen.",
    "Δεν υπάρχει συνδεδεμένη AI. Οι απαντήσεις βασίζονται σε περιορισμένους κανόνες. Σύνδεσε Gemini, OpenAI ή Claude από τις συνδέσεις λογαριασμού.",
    "Pa AI të lidhur. Përgjigjet përdorin rregulla të kufizuara. Lidh Gemini, OpenAI ose Claude nga lidhjet e llogarisë.",
    "AI未接続です。限定的な計画ルールで応答します。アカウントの接続設定からGemini・OpenAI・Claudeを接続してください。",
  ),
  active: t(
    "Uses your connected provider, this car, saved build items and the last eight conversation turns. API charges may apply. No automatic retries.",
    "Nutzt deinen verbundenen Anbieter, dieses Auto, gespeicherte Umbaupositionen und die letzten acht Gesprächsrunden. API-Kosten können anfallen. Keine automatischen Wiederholungen.",
    "Χρησιμοποιεί τον πάροχό σου, το όχημα, τις αποθηκευμένες βελτιώσεις και τους τελευταίους οκτώ διαλόγους. Πιθανές χρεώσεις API. Χωρίς αυτόματες επαναλήψεις.",
    "Përdor ofruesin e lidhur, makinën, pjesët e ruajtura dhe tetë shkëmbimet e fundit. Mund të ketë kosto API. Pa riprovime automatike.",
    "この車、保存済みカスタム項目、直近8往復を接続先AIに送信します。API料金が発生する場合があります。自動再試行はしません。",
  ),
  useChecks: t(
    "Use CapCar checks instead",
    "Stattdessen CapCar-Checks nutzen",
    "Χρήση ελέγχων CapCar",
    "Përdor kontrollet e CapCar",
    "代わりにCapCarのチェックを使う",
  ),
  checksReply: t(
    "This reply uses CapCar’s built-in checks, without web research. Send still uses your connected AI.",
    "Diese Antwort nutzt CapCars integrierte Checks ohne Websuche. Beim Senden wird weiterhin deine verbundene KI genutzt.",
    "Αυτή η απάντηση χρησιμοποιεί τους ελέγχους του CapCar χωρίς αναζήτηση στο διαδίκτυο. Η αποστολή συνεχίζει να χρησιμοποιεί τη συνδεδεμένη AI.",
    "Kjo përgjigje përdor kontrollet e CapCar pa kërkim në internet. Dërgimi vazhdon të përdorë AI-në e lidhur.",
    "この回答はWeb検索なしでCapCarのチェックを使っています。通常の送信では引き続き接続済みAIを使います。",
  ),
  unavailable: t(
    "AI status unavailable. Check your connection before sending.",
    "KI-Status nicht verfügbar. Prüfe deine Verbindung.",
    "Η κατάσταση AI δεν είναι διαθέσιμη. Έλεγξε τη σύνδεση.",
    "Statusi i AI-së mungon. Kontrollo lidhjen.",
    "AIの状態を確認できません。接続を確認してください。",
  ),
};
