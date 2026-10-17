import type { AppLocale } from "@/i18n/config";

type Copy = {
  title: string;
  intro: string;
  job: string;
  notes: string;
  draft: string;
  continue: string;
  selectVehicle: string;
  choose: string;
  addVehicle: string;
  save: string;
  saved: string;
  error: string;
  empty: string;
  heading: string;
  edit: string;
  back: string;
  article: string;
  features: [string, string, string, string];
  checks: {
    plan: string[];
    workspace: string[];
    history: string[];
    trip: string[];
    guide: string[];
  };
};
export const checklistUI: Record<AppLocale, Copy> = {
  en: {
    title: "Put this into practice",
    intro:
      "Make the checklist your own, then attach it to your vehicle in CapCar.",
    job: "Your job or plan",
    notes: "Your notes",
    draft:
      "Your unassigned draft stays on this browser for 24 hours when you continue. Sign in to attach it to a vehicle.",
    continue: "Continue with my vehicle",
    selectVehicle: "Choose the vehicle for this checklist",
    choose: "Select a vehicle",
    addVehicle: "Add a vehicle and return",
    save: "Save checklist to vehicle",
    saved: "Checklist saved to this vehicle.",
    error:
      "Could not save. Check the title, selected vehicle and browser storage, then try again.",
    empty: "No saved checklists for this vehicle yet.",
    heading: "Journal checklists",
    edit: "Edit checklist",
    back: "Back to vehicle",
    article: "Read the article",
    features: [
      "Open build planner",
      "Open vehicle guides",
      "Open maintenance",
      "Open AI trip planner",
    ],
    checks: {
      plan: [
        "One job and its purpose are defined",
        "Instructions match the exact vehicle",
        "Parts and tools are checked",
        "Workspace, support and time buffer are arranged",
        "Backup transport and final checks are planned",
      ],
      workspace: [
        "The workspace is suitable and permitted",
        "Required tools and lifting equipment are available",
        "Support, opening hours and overnight options are confirmed",
        "Total costs and waste disposal are clarified",
        "The task matches my experience",
      ],
      history: [
        "Work date and mileage are recorded",
        "Work performed is described precisely",
        "Parts and receipt references are noted",
        "DIY and workshop work are distinguished",
        "Checks and unresolved issues are recorded",
      ],
      trip: [
        "Stops and current visitor information are checked",
        "Navigation and parking are reviewed",
        "Fuel, time and budget are planned",
        "Weather and opening hours are checked",
        "The vehicle and a flexible return plan are ready",
      ],
      guide: [
        "The guide matches my vehicle variant",
        "I have read the prerequisites and required tools",
        "I know where qualified help is needed",
        "I will follow the applicable checks",
        "I will record the actual result and remaining issues",
      ],
    },
  },
  de: {
    title: "Setze es direkt um",
    intro:
      "Passe die Checkliste an und speichere sie bei deinem Fahrzeug in CapCar.",
    job: "Deine Arbeit oder dein Plan",
    notes: "Deine Notizen",
    draft:
      "Beim Fortfahren bleibt dein noch nicht zugeordneter Entwurf 24 Stunden in diesem Browser. Melde dich an, um ihn einem Fahrzeug zuzuordnen.",
    continue: "Mit meinem Fahrzeug fortfahren",
    selectVehicle: "Wähle das Fahrzeug für diese Checkliste",
    choose: "Fahrzeug auswählen",
    addVehicle: "Fahrzeug hinzufügen und zurückkehren",
    save: "Checkliste beim Fahrzeug speichern",
    saved: "Checkliste bei diesem Fahrzeug gespeichert.",
    error:
      "Speichern fehlgeschlagen. Prüfe Titel, Fahrzeug und Browserspeicher und versuche es erneut.",
    empty: "Für dieses Fahrzeug gibt es noch keine gespeicherten Checklisten.",
    heading: "Journal-Checklisten",
    edit: "Checkliste bearbeiten",
    back: "Zurück zum Fahrzeug",
    article: "Artikel lesen",
    features: [
      "Build-Planer öffnen",
      "Fahrzeuganleitungen öffnen",
      "Wartung öffnen",
      "KI-Reiseplaner öffnen",
    ],
    checks: {
      plan: [
        "Eine konkrete Arbeit und ihr Zweck stehen fest",
        "Die Anleitung passt zur genauen Fahrzeugvariante",
        "Teile und Werkzeuge sind geprüft",
        "Arbeitsplatz, Hilfe und Zeitpuffer sind organisiert",
        "Ersatzmobilität und Abschlussprüfungen sind geplant",
      ],
      workspace: [
        "Der Arbeitsplatz ist geeignet und erlaubt",
        "Werkzeuge und benötigte Hebetechnik sind vorhanden",
        "Hilfe, Öffnungszeiten und Übernachtungsmöglichkeiten sind geklärt",
        "Gesamtkosten und Entsorgung sind geklärt",
        "Die Arbeit passt zu meiner Erfahrung",
      ],
      history: [
        "Arbeitsdatum und Kilometerstand sind erfasst",
        "Die ausgeführte Arbeit ist genau beschrieben",
        "Teile und Belegverweise sind notiert",
        "Eigenarbeit und Werkstattarbeit sind unterschieden",
        "Prüfungen und offene Punkte sind dokumentiert",
      ],
      trip: [
        "Stopps und aktuelle Besucherinformationen sind geprüft",
        "Navigation und Parkmöglichkeiten sind geprüft",
        "Kraftstoff, Zeit und Budget sind geplant",
        "Wetter und Öffnungszeiten sind geprüft",
        "Fahrzeug und flexibler Rückweg sind vorbereitet",
      ],
      guide: [
        "Die Anleitung passt zu meiner Fahrzeugvariante",
        "Voraussetzungen und Werkzeuge sind bekannt",
        "Ich weiß, wo qualifizierte Hilfe nötig ist",
        "Ich werde die vorgeschriebenen Prüfungen durchführen",
        "Ich werde Ergebnis und offene Punkte dokumentieren",
      ],
    },
  },
  el: {
    title: "Πέρασε στην πράξη",
    intro: "Προσάρμοσε τη λίστα και αποθήκευσέ τη στο όχημά σου στο CapCar.",
    job: "Η εργασία ή το σχέδιό σου",
    notes: "Οι σημειώσεις σου",
    draft:
      "Όταν συνεχίσεις, το μη αντιστοιχισμένο πρόχειρο παραμένει σε αυτό το πρόγραμμα περιήγησης για 24 ώρες. Συνδέσου για να το αντιστοιχίσεις σε όχημα.",
    continue: "Συνέχεια με το όχημά μου",
    selectVehicle: "Επίλεξε όχημα για αυτή τη λίστα",
    choose: "Επιλογή οχήματος",
    addVehicle: "Προσθήκη οχήματος και επιστροφή",
    save: "Αποθήκευση λίστας στο όχημα",
    saved: "Η λίστα αποθηκεύτηκε σε αυτό το όχημα.",
    error:
      "Η αποθήκευση απέτυχε. Έλεγξε τίτλο, όχημα και χώρο αποθήκευσης του προγράμματος περιήγησης και δοκίμασε ξανά.",
    empty: "Δεν υπάρχουν ακόμη αποθηκευμένες λίστες για αυτό το όχημα.",
    heading: "Λίστες του Journal",
    edit: "Επεξεργασία λίστας",
    back: "Επιστροφή στο όχημα",
    article: "Διάβασε το άρθρο",
    features: [
      "Άνοιγμα σχεδιασμού βελτιώσεων",
      "Άνοιγμα οδηγών οχήματος",
      "Άνοιγμα συντήρησης",
      "Άνοιγμα σχεδιαστή ταξιδιών AI",
    ],
    checks: {
      plan: [
        "Έχει οριστεί μία εργασία και ο σκοπός της",
        "Οι οδηγίες ταιριάζουν στην ακριβή έκδοση του οχήματος",
        "Έχουν ελεγχθεί ανταλλακτικά και εργαλεία",
        "Έχουν οργανωθεί χώρος, βοήθεια και χρονικό περιθώριο",
        "Έχουν προγραμματιστεί εναλλακτική μετακίνηση και τελικοί έλεγχοι",
      ],
      workspace: [
        "Ο χώρος είναι κατάλληλος και επιτρέπεται η χρήση του",
        "Υπάρχουν τα απαιτούμενα εργαλεία και ανυψωτικά μέσα",
        "Έχουν επιβεβαιωθεί βοήθεια, ωράριο και παραμονή τη νύχτα",
        "Έχουν διευκρινιστεί συνολικό κόστος και διάθεση αποβλήτων",
        "Η εργασία ανταποκρίνεται στην εμπειρία μου",
      ],
      history: [
        "Έχουν καταγραφεί ημερομηνία και χιλιόμετρα",
        "Η εργασία περιγράφεται με ακρίβεια",
        "Έχουν σημειωθεί ανταλλακτικά και παραστατικά",
        "Διαχωρίζονται προσωπική εργασία και εργασία συνεργείου",
        "Έχουν καταγραφεί έλεγχοι και εκκρεμότητες",
      ],
      trip: [
        "Έχουν ελεγχθεί στάσεις και τρέχουσες πληροφορίες επισκεπτών",
        "Έχουν ελεγχθεί πλοήγηση και στάθμευση",
        "Έχουν σχεδιαστεί καύσιμα, χρόνος και προϋπολογισμός",
        "Έχουν ελεγχθεί καιρός και ωράρια",
        "Είναι έτοιμα όχημα και ευέλικτο σχέδιο επιστροφής",
      ],
      guide: [
        "Ο οδηγός ταιριάζει στην έκδοση του οχήματός μου",
        "Διάβασα προϋποθέσεις και εργαλεία",
        "Γνωρίζω πού χρειάζεται ειδικός",
        "Θα ακολουθήσω τους απαιτούμενους ελέγχους",
        "Θα καταγράψω αποτέλεσμα και εκκρεμότητες",
      ],
    },
  },
  sq: {
    title: "Kaloje në praktikë",
    intro: "Përshtate listën dhe ruaje te automjeti yt në CapCar.",
    job: "Puna ose plani yt",
    notes: "Shënimet e tua",
    draft:
      "Kur vazhdon, drafti i pacaktuar ruhet në këtë shfletues për 24 orë. Hyr për ta lidhur me një automjet.",
    continue: "Vazhdo me automjetin tim",
    selectVehicle: "Zgjidh automjetin për këtë listë",
    choose: "Zgjidh një automjet",
    addVehicle: "Shto automjet dhe kthehu",
    save: "Ruaje listën te automjeti",
    saved: "Lista u ruajt te ky automjet.",
    error:
      "Ruajtja dështoi. Kontrollo titullin, automjetin dhe hapësirën e shfletuesit, pastaj provo përsëri.",
    empty: "Ende nuk ka lista të ruajtura për këtë automjet.",
    heading: "Listat e Journal",
    edit: "Ndrysho listën",
    back: "Kthehu te automjeti",
    article: "Lexo artikullin",
    features: [
      "Hap planifikuesin e modifikimeve",
      "Hap udhëzuesit e automjetit",
      "Hap mirëmbajtjen",
      "Hap planifikuesin AI të udhëtimeve",
    ],
    checks: {
      plan: [
        "Kam përcaktuar një punë dhe qëllimin e saj",
        "Udhëzimet përputhen me variantin e saktë të automjetit",
        "Kam kontrolluar pjesët dhe veglat",
        "Kam organizuar vendin, ndihmën dhe kohën rezervë",
        "Kam planifikuar transport alternativ dhe kontrollet përfundimtare",
      ],
      workspace: [
        "Vendi është i përshtatshëm dhe i lejuar",
        "Veglat dhe pajisjet e ngritjes janë të disponueshme",
        "Kam konfirmuar ndihmën, orarin dhe qëndrimin gjatë natës",
        "Kam sqaruar koston totale dhe largimin e mbetjeve",
        "Puna përputhet me përvojën time",
      ],
      history: [
        "Kam shënuar datën dhe kilometrat",
        "Puna e kryer është përshkruar saktë",
        "Kam shënuar pjesët dhe referencat e faturave",
        "Kam dalluar punën time nga puna e servisit",
        "Kam regjistruar kontrollet dhe çështjet e hapura",
      ],
      trip: [
        "Kam kontrolluar ndalesat dhe informacionin aktual për vizitorët",
        "Kam kontrolluar navigimin dhe parkimin",
        "Kam planifikuar karburantin, kohën dhe buxhetin",
        "Kam kontrolluar motin dhe oraret",
        "Automjeti dhe kthimi fleksibël janë gati",
      ],
      guide: [
        "Udhëzuesi përputhet me variantin e automjetit tim",
        "Kam lexuar kërkesat dhe veglat e nevojshme",
        "E di kur duhet ndihmë profesionale",
        "Do të kryej kontrollet e kërkuara",
        "Do të regjistroj rezultatin dhe çështjet e mbetura",
      ],
    },
  },
  ja: {
    title: "記事の内容を実践する",
    intro: "チェックリストを編集し、CapCarの車両に保存できます。",
    job: "作業または計画",
    notes: "メモ",
    draft:
      "続行すると、未割り当ての下書きをこのブラウザーに24時間保存します。ログインして車両に関連付けてください。",
    continue: "自分の車両で続ける",
    selectVehicle: "このチェックリストの車両を選択",
    choose: "車両を選択",
    addVehicle: "車両を追加して戻る",
    save: "車両にチェックリストを保存",
    saved: "この車両にチェックリストを保存しました。",
    error:
      "保存できませんでした。タイトル、車両、ブラウザーの保存領域を確認し、再試行してください。",
    empty: "この車両にはまだチェックリストがありません。",
    heading: "Journalチェックリスト",
    edit: "チェックリストを編集",
    back: "車両に戻る",
    article: "記事を読む",
    features: [
      "カスタム計画を開く",
      "車両ガイドを開く",
      "メンテナンスを開く",
      "AI旅行プランナーを開く",
    ],
    checks: {
      plan: [
        "作業を一つに絞り目的を決めた",
        "正確な車両仕様に合う手順を確認した",
        "部品と工具を確認した",
        "作業場所、支援、余裕時間を確保した",
        "代替交通手段と最終点検を計画した",
      ],
      workspace: [
        "作業場所が適切で利用許可がある",
        "必要な工具とリフト設備がある",
        "支援、営業時間、夜間保管を確認した",
        "総費用と廃棄方法を確認した",
        "自分の経験に合う作業を選んだ",
      ],
      history: [
        "作業日と走行距離を記録した",
        "実施内容を具体的に記録した",
        "部品と領収書の参照先を記録した",
        "自分の作業と整備工場の作業を区別した",
        "点検結果と未解決事項を記録した",
      ],
      trip: [
        "立ち寄り先と最新の訪問情報を確認した",
        "ナビと駐車場所を確認した",
        "燃料、所要時間、予算を計画した",
        "天気と営業時間を確認した",
        "車両と柔軟な帰路計画を準備した",
      ],
      guide: [
        "ガイドが自分の車両仕様に合っている",
        "前提条件と必要工具を読んだ",
        "専門家の支援が必要な箇所を把握した",
        "必要な確認手順に従う",
        "実際の結果と残る課題を記録する",
      ],
    },
  },
};

export function checklistKind(slug: string): keyof Copy["checks"] {
  if (slug === "bmw-wartung-ohne-garage") return "workspace";
  if (slug === "bmw-diy-wartung-dokumentieren") return "history";
  if (slug === "ruesselsheim-rheingau-tagesausflug") return "trip";
  if (slug === "guide-to-vehicle-history") return "guide";
  return "plan";
}
export function checklistItems(slug: string, locale: AppLocale) {
  const kind = checklistKind(slug);
  return checklistUI[locale].checks[kind].map((label, index) => ({
    id: `${kind}-${index}`,
    label,
  }));
}
export function featureLabel(slug: string, locale: AppLocale) {
  const kind = checklistKind(slug);
  return checklistUI[locale].features[
    kind === "trip"
      ? 3
      : kind === "history"
        ? 2
        : kind === "workspace" || kind === "guide"
          ? 1
          : 0
  ];
}
