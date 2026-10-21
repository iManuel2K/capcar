import type { AppLocale } from "@/i18n/config";

export const analyticsUI: Record<
  AppLocale,
  {
    title: string;
    details: string;
    description: string;
    accept: string;
    decline: string;
    settings: string;
    privacy: string;
    notice: string;
  }
> = {
  en: {
    title: "Optional usage analytics",
    details: "How analytics works",
    description:
      "May we use PostHog to understand which pages and features are useful? It stores a browser identifier and sends usage events to PostHog in the US. Session recordings are disabled. Your choice does not affect your account.",
    accept: "Allow analytics",
    decline: "Decline analytics",
    settings: "Analytics settings",
    privacy: "Privacy notice",
    notice:
      "If you allow analytics, CapCar uses PostHog Cloud (US) to measure page visits and selected actions, such as saved checklists, registration submissions, vehicle additions and trip creation. A random browser identifier helps measure returning visits; it is not linked to your account email. Browser and device information and IP-based location may be processed by PostHog. We exclude private record content, vehicle identifiers, trip locations and authentication query strings, and disable session recordings and automatic click capture. You can decline or withdraw permission using Analytics settings. This stops future tracking in that browser; it does not automatically delete previously collected events. Analytics does not measure visitors who decline, block tracking or enable Do Not Track.",
  },
  de: {
    title: "Optionale Nutzungsanalyse",
    details: "So funktioniert die Analyse",
    description:
      "Dürfen wir mit PostHog erfassen, welche Seiten und Funktionen hilfreich sind? Dabei werden eine Browser-Kennung gespeichert und Nutzungsereignisse an PostHog in den USA gesendet. Sitzungsaufzeichnungen sind deaktiviert. Deine Wahl hat keinen Einfluss auf dein Konto.",
    accept: "Analyse erlauben",
    decline: "Analyse ablehnen",
    settings: "Analyse-Einstellungen",
    privacy: "Datenschutzhinweise",
    notice:
      "Mit deiner Einwilligung nutzt CapCar PostHog Cloud (USA), um Seitenaufrufe und ausgewählte Aktionen wie gespeicherte Checklisten, Registrierungsanfragen, hinzugefügte Fahrzeuge und erstellte Reisepläne auszuwerten. Eine zufällige Browser-Kennung erkennt wiederkehrende Besuche; sie wird nicht mit deiner Konto-E-Mail verknüpft. PostHog kann Browser- und Geräteinformationen sowie einen aus der IP-Adresse abgeleiteten Standort verarbeiten. Private Inhalte, Fahrzeugkennungen, Reiseorte und Authentifizierungsparameter werden ausgeschlossen. Sitzungsaufzeichnungen und automatische Klick-Erfassung sind deaktiviert. Du kannst die Einwilligung über Analyse-Einstellungen ablehnen oder widerrufen. Dies beendet die zukünftige Erfassung in diesem Browser, löscht aber zuvor erfasste Ereignisse nicht automatisch. Abgelehnte oder blockierte Erfassung sowie Do Not Track führen zu unvollständigen Statistiken.",
  },
  el: {
    title: "Προαιρετικά αναλυτικά χρήσης",
    details: "Πώς λειτουργούν τα αναλυτικά",
    description:
      "Να χρησιμοποιούμε το PostHog για να κατανοούμε ποιες σελίδες και λειτουργίες βοηθούν; Αποθηκεύεται ένα αναγνωριστικό προγράμματος περιήγησης και αποστέλλονται συμβάντα χρήσης στο PostHog στις ΗΠΑ. Η καταγραφή συνεδριών είναι απενεργοποιημένη. Η επιλογή δεν επηρεάζει τον λογαριασμό σου.",
    accept: "Αποδοχή αναλυτικών",
    decline: "Απόρριψη αναλυτικών",
    settings: "Ρυθμίσεις αναλυτικών",
    privacy: "Πολιτική απορρήτου",
    notice:
      "Με τη συγκατάθεσή σου, το CapCar χρησιμοποιεί το PostHog Cloud (ΗΠΑ) για προβολές σελίδων και επιλεγμένες ενέργειες, όπως αποθηκεύσεις λιστών, υποβολές εγγραφής, προσθήκες οχημάτων και δημιουργία ταξιδιών. Ένα τυχαίο αναγνωριστικό προγράμματος περιήγησης μετρά επαναλαμβανόμενες επισκέψεις χωρίς σύνδεση με το email σου. Το PostHog μπορεί να επεξεργάζεται στοιχεία συσκευής, προγράμματος περιήγησης και τοποθεσία βάσει IP. Εξαιρούμε ιδιωτικό περιεχόμενο, αναγνωριστικά οχημάτων, τοποθεσίες ταξιδιών και παραμέτρους σύνδεσης. Οι καταγραφές συνεδριών και η αυτόματη καταγραφή κλικ είναι απενεργοποιημένες. Ανάκληση από τις Ρυθμίσεις αναλυτικών σταματά τη μελλοντική συλλογή σε αυτό το πρόγραμμα περιήγησης, χωρίς αυτόματη διαγραφή προηγούμενων συμβάντων. Επισκέπτες που αρνούνται, αποκλείουν την παρακολούθηση ή ενεργοποιούν Do Not Track δεν μετρώνται.",
  },
  sq: {
    title: "Analiza opsionale të përdorimit",
    details: "Si funksionon analiza",
    description:
      "A mund të përdorim PostHog për të kuptuar cilat faqe dhe funksione janë të dobishme? Ruhet një identifikues i shfletuesit dhe ngjarjet e përdorimit dërgohen te PostHog në SHBA. Regjistrimi i sesioneve është çaktivizuar. Zgjedhja nuk ndikon në llogarinë tënde.",
    accept: "Lejo analizat",
    decline: "Refuzo analizat",
    settings: "Cilësimet e analizave",
    privacy: "Njoftimi i privatësisë",
    notice:
      "Me pëlqimin tënd, CapCar përdor PostHog Cloud (SHBA) për të matur vizitat dhe veprime të caktuara, si ruajtjet e listave, dërgimet e regjistrimit, shtimin e automjeteve dhe krijimin e udhëtimeve. Një identifikues i rastësishëm i shfletuesit mat vizitat e përsëritura pa u lidhur me emailin tënd. PostHog mund të përpunojë informacion për pajisjen, shfletuesin dhe vendndodhjen sipas IP-së. Përjashtojmë përmbajtjen private, identifikuesit e automjeteve, vendet e udhëtimeve dhe parametrat e autentifikimit. Regjistrimi i sesioneve dhe kapja automatike e klikimeve janë çaktivizuar. Mund ta tërheqësh pëlqimin te Cilësimet e analizave. Kjo ndalon gjurmimin e ardhshëm në atë shfletues, pa fshirë automatikisht ngjarjet e mëparshme. Vizitorët që refuzojnë, bllokojnë gjurmimin ose aktivizojnë Do Not Track nuk maten.",
  },
  ja: {
    title: "任意の利用状況分析",
    details: "利用状況分析の仕組み",
    description:
      "役立つページや機能を把握するため、PostHogの利用を許可しますか？ブラウザー識別子を保存し、利用イベントを米国のPostHogへ送信します。セッション録画は無効です。選択はアカウントの利用に影響しません。",
    accept: "分析を許可",
    decline: "分析を拒否",
    settings: "分析設定",
    privacy: "プライバシー通知",
    notice:
      "同意いただいた場合、CapCarはPostHog Cloud（米国）を使用し、ページ閲覧、チェックリストの保存、登録申請、車両追加、旅行プラン作成などを計測します。ランダムなブラウザー識別子で再訪問を計測しますが、アカウントのメールアドレスとは関連付けません。PostHogはブラウザー・端末情報やIPに基づく位置情報を処理する場合があります。非公開の記録内容、車両識別子、旅行先、認証クエリは除外します。セッション録画と自動クリック収集は無効です。「分析設定」から拒否または同意を撤回できます。撤回後はそのブラウザーの収集を停止しますが、過去のイベントは自動削除されません。拒否、トラッキングブロック、Do Not Trackが有効な訪問者は計測されません。",
  },
};
