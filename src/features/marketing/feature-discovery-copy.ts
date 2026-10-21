import type { AppLocale } from "@/i18n/config";

type FeatureCopy = {
  title: string;
  description: string;
  steps: [string, string][];
  example: [string, string][];
};
type Copy = {
  create: string;
  demo: string;
  example: string;
  related: string;
  read: string;
  account: string;
  plannerLabel: string;
  maintenanceLabel: string;
  planner: FeatureCopy;
  maintenance: FeatureCopy;
};

export const featureDiscoveryCopy: Record<AppLocale, Copy> = {
  en: {
    create: "Create your garage",
    demo: "Try the example garage",
    example: "Illustrative example · BMW 318i E90",
    related: "Keep going",
    read: "Read the practical guide",
    account:
      "Explore the example freely. Create an account to save your own vehicle and records.",
    plannerLabel: "Project car planner",
    maintenanceLabel: "Maintenance tracker",
    planner: {
      title: "Plan the upgrade. Keep the whole cost in view.",
      description:
        "Give each part and workshop task a place in your build. Set a budget, separate estimates from actual spending, and keep progress with the right car.",
      steps: [
        [
          "Start with your exact car",
          "Record the year, generation and engine. Choose one goal and create a build for it. Vehicle details give your research context; they do not confirm that a part fits.",
        ],
        [
          "Budget for the work around the part",
          "Add the planned item, expected cost, priority and stage. Include delivery, tools, labour and supporting work in your estimates. Leave a note for every detail that still needs checking.",
        ],
        [
          "Update the plan as the work happens",
          "Keep planned, ordered and installed stages distinct. Record the actual cost after the job and keep useful photo or receipt references with your notes. Return to the next task from your vehicle workspace.",
        ],
      ],
      example: [
        ["Project budget", "€300"],
        ["Planned filter cost", "€30"],
        ["Actual cost after the job", "€28"],
      ],
    },
    maintenance: {
      title: "Remember what was done. Know what comes next.",
      description:
        "Keep maintenance tasks, costs and owner-recorded service history with your car. A clear entry helps when you return to a job or explain the work to a workshop.",
      steps: [
        [
          "Prepare one maintenance task",
          "Choose the vehicle and define the job. Check the applicable guide, tools, part reference and workspace before starting. Save preparation separately from completed work.",
        ],
        [
          "Record the result",
          "After the real job, record the date, mileage, work and actual cost. Keep part numbers, receipt references and unresolved observations in your notes. Mark the task complete only when the work is done.",
        ],
        [
          "Keep the history understandable",
          "Distinguish your own work from workshop work. Review earlier entries before the next job. Personal records stay private; review the selected information before sharing a Passport.",
        ],
      ],
      example: [
        ["Completed task", "Replace the cabin filter"],
        ["Work recorded by", "Vehicle owner"],
        ["Actual cost", "€28"],
      ],
    },
  },
  de: {
    create: "Garage anlegen",
    demo: "Beispielgarage ausprobieren",
    example: "Illustratives Beispiel · BMW 318i E90",
    related: "Dein nächster Schritt",
    read: "Praktischen Leitfaden lesen",
    account:
      "Erkunde das Beispiel frei. Mit einem Konto speicherst du dein Fahrzeug und deine Einträge.",
    plannerLabel: "Projektwagen-Planer",
    maintenanceLabel: "Wartung dokumentieren",
    planner: {
      title: "Den Umbau planen. Die gesamten Kosten im Blick.",
      description:
        "Gib jedem Teil und jeder Arbeit einen Platz im Umbauplan. Lege ein Budget fest, trenne Schätzungen von tatsächlichen Ausgaben und halte den Fortschritt beim richtigen Auto fest.",
      steps: [
        [
          "Mit deinem genauen Auto beginnen",
          "Erfasse Baujahr, Generation und Motor. Wähle ein Ziel und lege dafür einen Umbauplan an. Die Fahrzeugdaten helfen bei der Recherche; sie bestätigen keine Teilekompatibilität.",
        ],
        [
          "Die Arbeit rund ums Teil einplanen",
          "Ergänze den geplanten Posten, geschätzte Kosten, Priorität und Status. Berücksichtige Versand, Werkzeug, Arbeitszeit und notwendige Begleitarbeiten. Notiere, was du noch prüfen musst.",
        ],
        [
          "Den Plan mit der Arbeit aktualisieren",
          "Unterscheide geplant, bestellt und eingebaut. Erfasse nach der Arbeit die tatsächlichen Kosten und bewahre Foto- oder Belegverweise in deinen Notizen auf. Den nächsten Schritt findest du beim Fahrzeug.",
        ],
      ],
      example: [
        ["Projektbudget", "300 €"],
        ["Geplante Filterkosten", "30 €"],
        ["Tatsächliche Kosten nach der Arbeit", "28 €"],
      ],
    },
    maintenance: {
      title: "Wissen, was gemacht wurde. Den nächsten Schritt finden.",
      description:
        "Bewahre Wartungsaufgaben, Kosten und selbst dokumentierte Servicehistorie bei deinem Auto auf. Ein klarer Eintrag hilft bei der nächsten Arbeit und beim Gespräch mit der Werkstatt.",
      steps: [
        [
          "Eine Wartungsaufgabe vorbereiten",
          "Wähle das Fahrzeug und grenze die Arbeit ein. Prüfe passende Anleitung, Werkzeug, Teilenummer und Arbeitsplatz. Halte Vorbereitung und abgeschlossene Arbeit getrennt.",
        ],
        [
          "Das Ergebnis dokumentieren",
          "Erfasse nach der tatsächlichen Arbeit Datum, Kilometerstand, Tätigkeit und Kosten. Notiere Teilenummern, Belegverweise und offene Beobachtungen. Schließe die Aufgabe erst ab, wenn die Arbeit erledigt ist.",
        ],
        [
          "Die Historie nachvollziehbar halten",
          "Unterscheide eigene Arbeiten von Werkstattarbeiten. Lies frühere Einträge vor der nächsten Aufgabe. Persönliche Daten bleiben privat; prüfe die ausgewählten Angaben vor dem Teilen eines Passports.",
        ],
      ],
      example: [
        ["Abgeschlossene Aufgabe", "Innenraumfilter ersetzen"],
        ["Dokumentiert durch", "Fahrzeughalter"],
        ["Tatsächliche Kosten", "28 €"],
      ],
    },
  },
  el: {
    create: "Δημιούργησε γκαράζ",
    demo: "Δοκίμασε το γκαράζ παραδείγματος",
    example: "Ενδεικτικό παράδειγμα · BMW 318i E90",
    related: "Το επόμενο βήμα",
    read: "Διάβασε τον πρακτικό οδηγό",
    account:
      "Εξερεύνησε ελεύθερα το παράδειγμα. Χρειάζεσαι λογαριασμό για να αποθηκεύσεις το αυτοκίνητο και τις εγγραφές σου.",
    plannerLabel: "Σχεδιασμός μετατροπών",
    maintenanceLabel: "Καταγραφή συντήρησης",
    planner: {
      title: "Σχεδίασε τη μετατροπή. Δες ολόκληρο το κόστος.",
      description:
        "Οργάνωσε κάθε ανταλλακτικό και εργασία στο σχέδιό σου. Όρισε προϋπολογισμό, ξεχώρισε εκτιμήσεις από πραγματικά έξοδα και κράτησε την πρόοδο στο σωστό αυτοκίνητο.",
      steps: [
        [
          "Ξεκίνα με το ακριβές αυτοκίνητο",
          "Κατάγραψε έτος, γενιά και κινητήρα. Διάλεξε έναν στόχο και δημιούργησε σχέδιο. Τα στοιχεία βοηθούν την έρευνα· δεν επιβεβαιώνουν τη συμβατότητα ενός ανταλλακτικού.",
        ],
        [
          "Υπολόγισε και τις συνοδευτικές εργασίες",
          "Πρόσθεσε την αλλαγή, εκτιμώμενο κόστος, προτεραιότητα και στάδιο. Υπολόγισε μεταφορικά, εργαλεία, εργατικά και απαραίτητες πρόσθετες εργασίες. Σημείωσε ό,τι χρειάζεται έλεγχο.",
        ],
        [
          "Ενημέρωνε το σχέδιο καθώς προχωράς",
          "Ξεχώρισε σχεδιασμένα, παραγγελμένα και τοποθετημένα μέρη. Μετά την εργασία γράψε το πραγματικό κόστος και κράτησε αναφορές σε φωτογραφίες ή αποδείξεις στις σημειώσεις. Επέστρεψε στην επόμενη εργασία από το όχημα.",
        ],
      ],
      example: [
        ["Προϋπολογισμός έργου", "300 €"],
        ["Εκτιμώμενο κόστος φίλτρου", "30 €"],
        ["Πραγματικό κόστος μετά την εργασία", "28 €"],
      ],
    },
    maintenance: {
      title: "Θυμήσου τι έγινε. Δες τι ακολουθεί.",
      description:
        "Κράτησε εργασίες συντήρησης, κόστος και ιστορικό ιδιοκτήτη μαζί με το αυτοκίνητο. Μια σαφής εγγραφή βοηθά στην επόμενη εργασία και στην επικοινωνία με συνεργείο.",
      steps: [
        [
          "Προετοίμασε μία εργασία",
          "Διάλεξε όχημα και όρισε την εργασία. Έλεγξε τον κατάλληλο οδηγό, τα εργαλεία, τον κωδικό ανταλλακτικού και τον χώρο πριν ξεκινήσεις. Κράτησε την προετοιμασία χωριστά από την ολοκλήρωση.",
        ],
        [
          "Κατάγραψε το αποτέλεσμα",
          "Μετά την πραγματική εργασία γράψε ημερομηνία, χιλιόμετρα, τι έγινε και τελικό κόστος. Κράτησε κωδικούς, αναφορές αποδείξεων και εκκρεμότητες στις σημειώσεις. Σημείωσε ολοκλήρωση μόνο όταν τελειώσει η εργασία.",
        ],
        [
          "Κράτησε κατανοητό ιστορικό",
          "Ξεχώρισε προσωπικές εργασίες από εργασίες συνεργείου. Διάβασε παλιότερες εγγραφές πριν την επόμενη δουλειά. Τα προσωπικά δεδομένα παραμένουν ιδιωτικά· έλεγξέ τα πριν μοιραστείς ένα Passport.",
        ],
      ],
      example: [
        ["Ολοκληρωμένη εργασία", "Αλλαγή φίλτρου καμπίνας"],
        ["Καταγραφή από", "Ιδιοκτήτη οχήματος"],
        ["Πραγματικό κόστος", "28 €"],
      ],
    },
  },
  sq: {
    create: "Krijo garazhin",
    demo: "Provo garazhin shembull",
    example: "Shembull ilustrues · BMW 318i E90",
    related: "Hapi tjetër",
    read: "Lexo udhëzuesin praktik",
    account:
      "Eksploro shembullin lirisht. Krijo një llogari për të ruajtur makinën dhe shënimet e tua.",
    plannerLabel: "Planifikues projekti për makinën",
    maintenanceLabel: "Regjistri i mirëmbajtjes",
    planner: {
      title: "Planifiko modifikimin. Shiko koston e plotë.",
      description:
        "Organizo çdo pjesë dhe punë në planin e makinës. Cakto buxhetin, ndaj vlerësimet nga shpenzimet reale dhe mbaje progresin me makinën e duhur.",
      steps: [
        [
          "Fillo me makinën e saktë",
          "Shëno vitin, gjeneratën dhe motorin. Zgjidh një qëllim dhe krijo planin për të. Të dhënat ndihmojnë kërkimin; nuk konfirmojnë përshtatjen e një pjese.",
        ],
        [
          "Llogarit edhe punën përreth pjesës",
          "Shto ndryshimin, koston e pritshme, përparësinë dhe fazën. Përfshi transportin, veglat, punën dhe ndërhyrjet mbështetëse. Shëno çdo detaj që duhet kontrolluar.",
        ],
        [
          "Përditëso planin gjatë punës",
          "Dallo pjesët e planifikuara, të porositura dhe të montuara. Pas punës regjistro koston reale dhe mbaj referenca fotografish ose faturash në shënime. Kthehu te detyra tjetër nga makina.",
        ],
      ],
      example: [
        ["Buxheti i projektit", "300 €"],
        ["Kostoja e planifikuar e filtrit", "30 €"],
        ["Kostoja reale pas punës", "28 €"],
      ],
    },
    maintenance: {
      title: "Kujto çfarë u bë. Dije çfarë vjen më pas.",
      description:
        "Mbaj detyrat e mirëmbajtjes, kostot dhe historikun e dokumentuar nga pronari me makinën. Një shënim i qartë ndihmon për punën e ardhshme dhe bisedën me servisin.",
      steps: [
        [
          "Përgatit një detyrë mirëmbajtjeje",
          "Zgjidh makinën dhe përcakto punën. Kontrollo udhëzuesin përkatës, veglat, kodin e pjesës dhe vendin e punës. Mbaje përgatitjen veç nga puna e përfunduar.",
        ],
        [
          "Regjistro rezultatin",
          "Pas punës reale shëno datën, kilometrat, punën dhe koston përfundimtare. Mbaj kodet e pjesëve, referencat e faturave dhe problemet e hapura në shënime. Shëno përfundimin vetëm kur puna të ketë mbaruar.",
        ],
        [
          "Mbaje historikun të kuptueshëm",
          "Dallo punën tënde nga ajo e servisit. Lexo shënimet e mëparshme para detyrës tjetër. Regjistrimet personale mbeten private; kontrollo informacionin para se të ndash një Passport.",
        ],
      ],
      example: [
        ["Detyra e përfunduar", "Ndërrimi i filtrit të kabinës"],
        ["Regjistruar nga", "Pronari i makinës"],
        ["Kostoja reale", "28 €"],
      ],
    },
  },
  ja: {
    create: "ガレージを作成",
    demo: "サンプルガレージを試す",
    example: "参考例 · BMW 318i E90",
    related: "次のステップ",
    read: "実用ガイドを読む",
    account:
      "サンプルは自由に閲覧できます。自分の車と記録の保存にはアカウントが必要です。",
    plannerLabel: "プロジェクトカー計画",
    maintenanceLabel: "整備記録",
    planner: {
      title: "カスタムを計画し、総費用を把握する。",
      description:
        "パーツと作業をビルド計画にまとめましょう。予算を設定し、見積額と実際の支出を分け、車ごとに進捗を残せます。",
      steps: [
        [
          "正確な車両情報から始める",
          "年式、世代、エンジンを記録し、目的をひとつ選んでビルドを作成します。車両情報は調査の手がかりであり、部品の適合を保証するものではありません。",
        ],
        [
          "パーツ以外の費用も計画する",
          "変更内容、予想費用、優先度、段階を追加します。送料、工具、工賃、付随作業も見積もりに含め、確認が必要な点をメモしましょう。",
        ],
        [
          "実際の作業に合わせて更新する",
          "計画、注文、取り付けを区別します。作業後に実費を記録し、写真や領収書の参照情報をメモに残します。車両画面から次の作業に戻れます。",
        ],
      ],
      example: [
        ["プロジェクト予算", "€300"],
        ["フィルターの予定費用", "€30"],
        ["作業後の実費", "€28"],
      ],
    },
    maintenance: {
      title: "行った整備を記録し、次の作業につなげる。",
      description:
        "整備タスク、費用、オーナーが記録した履歴を車と一緒に管理します。明確な記録は、次の作業や整備工場への説明に役立ちます。",
      steps: [
        [
          "ひとつの整備タスクを準備する",
          "車と作業内容を選び、適用できる手順、工具、部品番号、作業場所を確認します。準備と完了した作業を区別して保存しましょう。",
        ],
        [
          "実際の結果を記録する",
          "作業後に日付、走行距離、内容、実費を記録します。部品番号、領収書の参照情報、未解決の症状をメモに残し、実際に終わってから完了にします。",
        ],
        [
          "履歴を分かりやすく保つ",
          "自分の作業と工場での作業を区別し、次の整備前に過去の記録を確認します。個人の記録は非公開です。Passportで共有する前に、選択した情報を確認してください。",
        ],
      ],
      example: [
        ["完了した作業", "キャビンフィルターの交換"],
        ["記録した人", "車両オーナー"],
        ["実費", "€28"],
      ],
    },
  },
};
