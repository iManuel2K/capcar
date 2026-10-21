import type { AppLocale } from "@/i18n/config";

const en = {
  eyebrow: "CapCar / AI trip planner",
  title: "A good drive starts with a plan.",
  description:
    "Tell CapCar what you drive and where you want to go. Turn your ideas into a day-by-day outline with places, breaks and a route to review.",
  create: "Plan my first drive",
  signIn: "Sign in",
  access:
    "An account and a connected AI service are needed for your own plans. Provider charges may apply.",
  example: "Example trip · Illustrative data",
  promptLabel: "You ask",
  prompt:
    "Plan a relaxed two-day weekend from Rüsselsheim in my BMW 318i. Stop in Mainz, then take a scenic road through the Rheingau.",
  result: "A weekend in the Rheingau",
  stops: [
    "Start in Rüsselsheim",
    "A stop in Mainz",
    "Follow the Rhine through the Rheingau",
    "Finish at the Niederwalddenkmal",
  ],
  routePreview: "Play the example route",
  routeAlt:
    "Illustrative route preview from Rüsselsheim through Mainz and the Rheingau; map data © OpenStreetMap contributors",
  note: "Example outline, not a live route. Check directions, access and opening hours before driving.",
  how: "From an idea to your next drive.",
  steps: [
    "Describe your car, region and the kind of day you want.",
    "Review the suggested stops and adjust the order.",
    "Check the route and save your plan.",
  ],
  roadbook: "Explore Roadbook without an account",
};

export const aiPreviewCopy: Record<AppLocale, typeof en> = {
  en,
  de: {
    eyebrow: "CapCar / KI-Reiseplanung",
    title: "Eine gute Fahrt beginnt mit einem Plan.",
    description:
      "Sag CapCar, welches Auto du fährst und wohin du möchtest. Aus deinen Ideen wird ein Tagesplan mit Orten, Pausen und einer Route zum Prüfen.",
    create: "Meine erste Tour planen",
    signIn: "Anmelden",
    access:
      "Für eigene Pläne brauchst du ein Konto und einen verbundenen KI-Dienst. Beim Anbieter können Kosten entstehen.",
    example: "Beispieltour · Illustrative Daten",
    promptLabel: "Du fragst",
    prompt:
      "Plane ein entspanntes Wochenende mit zwei Tagen ab Rüsselsheim mit meinem BMW 318i. Ein Stopp in Mainz, danach eine schöne Strecke durch den Rheingau.",
    result: "Ein Wochenende im Rheingau",
    stops: [
      "Start in Rüsselsheim",
      "Ein Stopp in Mainz",
      "Am Rhein durch den Rheingau",
      "Abschluss am Niederwalddenkmal",
    ],
    routePreview: "Beispielroute abspielen",
    routeAlt:
      "Illustrative Route von Rüsselsheim über Mainz durch den Rheingau; Kartendaten © OpenStreetMap-Mitwirkende",
    note: "Beispielplan, keine live berechnete Route. Prüfe Strecke, Zugang und Öffnungszeiten vor der Fahrt.",
    how: "Von der Idee zur nächsten Tour.",
    steps: [
      "Beschreibe Auto, Region und deinen Wunschtag.",
      "Prüfe die vorgeschlagenen Stopps und passe ihre Reihenfolge an.",
      "Prüfe die Route und speichere deinen Plan.",
    ],
    roadbook: "Roadbook ohne Konto entdecken",
  },
  el: {
    eyebrow: "CapCar / Σχεδιασμός διαδρομών με AI",
    title: "Μια ωραία διαδρομή αρχίζει με σχέδιο.",
    description:
      "Πες στο CapCar τι οδηγείς και πού θέλεις να πας. Οι ιδέες σου γίνονται ημερήσιο πλάνο με μέρη, διαλείμματα και διαδρομή για έλεγχο.",
    create: "Σχεδίασε την πρώτη μου βόλτα",
    signIn: "Σύνδεση",
    access:
      "Για δικά σου πλάνα χρειάζεσαι λογαριασμό και συνδεδεμένη υπηρεσία AI. Ενδέχεται να υπάρχουν χρεώσεις παρόχου.",
    example: "Παράδειγμα εκδρομής · Ενδεικτικά δεδομένα",
    promptLabel: "Εσύ ζητάς",
    prompt:
      "Σχεδίασε ένα χαλαρό διήμερο από το Rüsselsheim με την BMW 318i μου. Στάση στο Mainz και μετά μια όμορφη διαδρομή στο Rheingau.",
    result: "Ένα διήμερο στο Rheingau",
    stops: [
      "Αφετηρία στο Rüsselsheim",
      "Στάση στο Mainz",
      "Δίπλα στον Ρήνο μέσα από το Rheingau",
      "Τερματισμός στο Niederwalddenkmal",
    ],
    routePreview: "Προβολή της διαδρομής-παραδείγματος",
    routeAlt:
      "Ενδεικτική διαδρομή από Rüsselsheim μέσω Mainz και Rheingau· δεδομένα χάρτη © συντελεστές OpenStreetMap",
    note: "Ενδεικτικό πλάνο, όχι ζωντανός υπολογισμός. Έλεγξε οδηγίες, πρόσβαση και ώρες λειτουργίας πριν φύγεις.",
    how: "Από την ιδέα στην επόμενη βόλτα.",
    steps: [
      "Περιέγραψε αυτοκίνητο, περιοχή και τι μέρα θέλεις.",
      "Έλεγξε τις προτεινόμενες στάσεις και άλλαξε τη σειρά τους.",
      "Έλεγξε τη διαδρομή και αποθήκευσε το πλάνο σου.",
    ],
    roadbook: "Εξερεύνησε το Roadbook χωρίς λογαριασμό",
  },
  sq: {
    eyebrow: "CapCar / Planifikuesi AI i udhëtimeve",
    title: "Një shëtitje e mirë fillon me plan.",
    description:
      "Tregoji CapCar çfarë makine ke dhe ku dëshiron të shkosh. Ktheji idetë në një plan ditor me vende, pushime dhe një itinerar për ta kontrolluar.",
    create: "Planifiko shëtitjen time të parë",
    signIn: "Hyr",
    access:
      "Për planet e tua duhen një llogari dhe një shërbim AI i lidhur. Ofruesi mund të aplikojë tarifa.",
    example: "Udhëtim shembull · Të dhëna ilustruese",
    promptLabel: "Ti kërkon",
    prompt:
      "Planifiko një fundjavë të qetë dyditore nga Rüsselsheim me BMW 318i tim. Një ndalesë në Mainz, pastaj një rrugë panoramike në Rheingau.",
    result: "Një fundjavë në Rheingau",
    stops: [
      "Nisja nga Rüsselsheim",
      "Një ndalesë në Mainz",
      "Përgjatë Rinit përmes Rheingau",
      "Përfundimi te Niederwalddenkmal",
    ],
    routePreview: "Shfaq itinerarin shembull",
    routeAlt:
      "Itinerar ilustrues nga Rüsselsheim përmes Mainz dhe Rheingau; të dhënat e hartës © kontribuesit e OpenStreetMap",
    note: "Plan shembull, jo itinerar i llogaritur drejtpërdrejt. Kontrollo rrugën, hyrjen dhe oraret para nisjes.",
    how: "Nga ideja te shëtitja e radhës.",
    steps: [
      "Përshkruaj makinën, zonën dhe ditën që dëshiron.",
      "Shiko ndalesat e propozuara dhe ndrysho rendin e tyre.",
      "Kontrollo itinerarin dhe ruaj planin.",
    ],
    roadbook: "Eksploro Roadbook pa llogari",
  },
  ja: {
    eyebrow: "CapCar / AIドライブプランナー",
    title: "いいドライブは、いい計画から。",
    description:
      "愛車と行きたい場所をCapCarに伝えてください。立ち寄り先や休憩、確認用のルートを含む日ごとのプランにまとめます。",
    create: "最初のドライブを計画",
    signIn: "ログイン",
    access:
      "自分のプランの作成にはアカウントとAIサービスの接続が必要です。提供元の料金が発生する場合があります。",
    example: "ドライブの例 · 参考データ",
    promptLabel: "こんなふうに聞く",
    prompt:
      "BMW 318iでリュッセルスハイムからのんびり週末2日間のドライブを計画して。マインツに寄り、その後ラインガウの景色のよい道を走りたい。",
    result: "ラインガウで過ごす週末",
    stops: [
      "リュッセルスハイムを出発",
      "マインツに立ち寄る",
      "ライン川沿いにラインガウを走る",
      "ニーダーヴァルト記念碑で締めくくる",
    ],
    routePreview: "ルートの例を再生",
    routeAlt:
      "リュッセルスハイムからマインツとラインガウを通る参考ルート。地図データ © OpenStreetMap contributors",
    note: "実際に計算されたルートではなく参考例です。出発前に経路、アクセス、営業時間をご確認ください。",
    how: "アイデアを、次のドライブへ。",
    steps: [
      "愛車、地域、どんな一日にしたいかを伝える。",
      "提案された立ち寄り先を確認し、順番を調整する。",
      "ルートを確認してプランを保存する。",
    ],
    roadbook: "アカウントなしでRoadbookを見る",
  },
};
