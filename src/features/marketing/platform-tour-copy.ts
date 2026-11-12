import type { AppLocale } from "@/i18n/config";

type TourStep = {
  title: string;
  body: string;
  labels: [string, string, string];
  note?: string;
};

type TourCopy = {
  label: string;
  step: string;
  back: string;
  play: string;
  pause: string;
  next: string;
  skip: string;
  start: string;
  steps: [TourStep, TourStep, TourStep, TourStep, TourStep];
};

export const platformTourCopy: Record<AppLocale, TourCopy> = {
  en: {
    label: "How CapCar works",
    step: "Step {current} of {total}",
    back: "Back",
    play: "Play",
    pause: "Pause",
    next: "Next",
    skip: "Skip to the tools",
    start: "Start your garage",
    steps: [
      {
        title: "Start with the car you own.",
        body: "Add your car to a private garage. Its plans, maintenance history and the drives you want to take are easy to find from there.",
        labels: ["Build plans", "Maintenance", "Drives"],
      },
      {
        title: "Give the next job a plan.",
        body: "Pick a job, compare parts and set a budget. Explore an available Concept Studio preview if you want to try a different look.",
        labels: ["Pick a job", "Compare parts", "Set a budget"],
        note: "Concept Studio previews are for visual reference. Confirm part fitment separately.",
      },
      {
        title: "Keep the work with the car.",
        body: "Log the job when it’s done. Add what you spent and a photo so you can find the details again in your vehicle history.",
        labels: ["Log the job", "Add cost and photos", "Vehicle history"],
        note: "Work is recorded by the owner. Sharing your Vehicle Passport is optional.",
      },
      {
        title: "Find a reason to get out.",
        body: "Find scenic roads in Roadbook. Give the AI Trip Planner a starting point, your time and any stops you want to make, then review its draft.",
        labels: ["Find a road", "Describe the trip", "Review the route"],
        note: "Roadbook is public. Personal AI plans need a CapCar account and a connected AI service. Provider charges may apply.",
      },
      {
        title: "Where we want to take CapCar.",
        body: "We want to make it easier to buy from participating sellers, preview more changes on your exact model, and keep records verified by workshops.",
        labels: [
          "Seller checkout",
          "Exact-car previews",
          "Verified workshop records",
        ],
        note: "These are roadmap goals. Availability will depend on development and partners.",
      },
    ],
  },
  de: {
    label: "So funktioniert CapCar",
    step: "Schritt {current} von {total}",
    back: "Zurück",
    play: "Abspielen",
    pause: "Pausieren",
    next: "Weiter",
    skip: "Direkt zu den Werkzeugen",
    start: "Deine Garage starten",
    steps: [
      {
        title: "Fang mit deinem eigenen Auto an.",
        body: "Füge dein Auto zu einer privaten Garage hinzu. Dort findest du deine Pläne, die Wartungshistorie und Ideen für deine nächsten Fahrten.",
        labels: ["Umbaupläne", "Wartung", "Ausfahrten"],
      },
      {
        title: "Mach einen Plan für den nächsten Job.",
        body: "Wähle eine Aufgabe, vergleiche Teile und lege ein Budget fest. Im Concept Studio kannst du verfügbare Vorschauen ansehen.",
        labels: ["Aufgabe wählen", "Teile vergleichen", "Budget festlegen"],
        note: "Die Vorschauen im Concept Studio dienen der Orientierung. Prüfe die Passgenauigkeit separat.",
      },
      {
        title: "Die Arbeit bleibt beim Auto.",
        body: "Trage die fertige Arbeit ein. Ergänze Kosten und ein Foto, damit du die Details später in der Fahrzeughistorie findest.",
        labels: ["Arbeit eintragen", "Kosten und Fotos", "Fahrzeughistorie"],
        note: "Arbeiten werden vom Halter eingetragen. Du entscheidest, ob du den Fahrzeugpass teilst.",
      },
      {
        title: "Finde einen Grund für eine Ausfahrt.",
        body: "Entdecke schöne Straßen in Roadbook. Gib der KI-Reiseplanung deinen Startort, deine verfügbare Zeit und gewünschte Stopps und prüfe dann den Entwurf.",
        labels: ["Straße finden", "Fahrt beschreiben", "Route prüfen"],
        note: "Roadbook ist öffentlich. Persönliche KI-Pläne brauchen ein CapCar-Konto und einen verbundenen KI-Dienst. Beim Anbieter können Kosten anfallen.",
      },
      {
        title: "Wohin wir CapCar entwickeln wollen.",
        body: "Wir wollen den Kauf bei teilnehmenden Händlern erleichtern, mehr Vorschauen für dein genaues Modell anbieten und von Werkstätten bestätigte Nachweise ermöglichen.",
        labels: [
          "Kauf beim Händler",
          "Modellgenaue Vorschau",
          "Bestätigte Werkstattnachweise",
        ],
        note: "Das sind Ziele auf unserer Roadmap. Die Verfügbarkeit hängt von Entwicklung und Partnern ab.",
      },
    ],
  },
  el: {
    label: "Πώς λειτουργεί το CapCar",
    step: "Βήμα {current} από {total}",
    back: "Πίσω",
    play: "Αναπαραγωγή",
    pause: "Παύση",
    next: "Επόμενο",
    skip: "Μετάβαση στα εργαλεία",
    start: "Άνοιξε το γκαράζ σου",
    steps: [
      {
        title: "Ξεκίνα με το δικό σου αυτοκίνητο.",
        body: "Πρόσθεσε το αυτοκίνητό σου σε ιδιωτικό γκαράζ. Εκεί βρίσκεις τα σχέδια, το ιστορικό συντήρησης και τις βόλτες που θέλεις να κάνεις.",
        labels: ["Σχέδια βελτίωσης", "Συντήρηση", "Διαδρομές"],
      },
      {
        title: "Οργάνωσε την επόμενη δουλειά.",
        body: "Διάλεξε μια εργασία, σύγκρινε ανταλλακτικά και όρισε προϋπολογισμό. Δες τις διαθέσιμες προεπισκοπήσεις στο Concept Studio.",
        labels: [
          "Επιλογή εργασίας",
          "Σύγκριση ανταλλακτικών",
          "Προϋπολογισμός",
        ],
        note: "Οι προεπισκοπήσεις του Concept Studio είναι οπτικές αναφορές. Έλεγξε ξεχωριστά τη συμβατότητα.",
      },
      {
        title: "Κράτησε την εργασία στο ιστορικό.",
        body: "Κατάγραψε την εργασία μόλις τελειώσει. Πρόσθεσε κόστος και φωτογραφία για να τα βρίσκεις στο ιστορικό του οχήματος.",
        labels: [
          "Καταγραφή εργασίας",
          "Κόστος και φωτογραφίες",
          "Ιστορικό οχήματος",
        ],
        note: "Τις εργασίες τις καταγράφει ο ιδιοκτήτης. Η κοινοποίηση του διαβατηρίου οχήματος είναι προαιρετική.",
      },
      {
        title: "Βρες έναν λόγο να βγεις για βόλτα.",
        body: "Ανακάλυψε όμορφους δρόμους στο Roadbook. Δώσε στην AI την αφετηρία, τον χρόνο και τις στάσεις σου και έλεγξε το προσχέδιο.",
        labels: ["Βρες δρόμο", "Περιέγραψε τη βόλτα", "Έλεγξε τη διαδρομή"],
        note: "Το Roadbook είναι δημόσιο. Τα προσωπικά πλάνα AI χρειάζονται λογαριασμό CapCar και συνδεδεμένη υπηρεσία AI. Ο πάροχος μπορεί να χρεώνει.",
      },
      {
        title: "Πού θέλουμε να φτάσει το CapCar.",
        body: "Θέλουμε ευκολότερες αγορές από συνεργαζόμενους πωλητές, περισσότερες προεπισκοπήσεις για το ακριβές μοντέλο σου και καταγραφές επιβεβαιωμένες από συνεργεία.",
        labels: [
          "Αγορά από πωλητή",
          "Προεπισκόπηση ανά μοντέλο",
          "Επιβεβαίωση συνεργείου",
        ],
        note: "Αυτοί είναι στόχοι του οδικού χάρτη. Η διαθεσιμότητα εξαρτάται από την ανάπτυξη και τους συνεργάτες.",
      },
    ],
  },
  sq: {
    label: "Si funksionon CapCar",
    step: "Hapi {current} nga {total}",
    back: "Mbrapa",
    play: "Luaj",
    pause: "Ndalo përkohësisht",
    next: "Përpara",
    skip: "Kalo te mjetet",
    start: "Krijo garazhin tënd",
    steps: [
      {
        title: "Fillo me makinën tënde.",
        body: "Shto makinën në një garazh privat. Aty gjen planet, historikun e mirëmbajtjes dhe udhëtimet që do të bësh.",
        labels: ["Planet e projektit", "Mirëmbajtja", "Udhëtimet"],
      },
      {
        title: "Bëj një plan për punën e radhës.",
        body: "Zgjidh një punë, krahaso pjesët dhe cakto buxhetin. Në Concept Studio mund të shohësh pamjet paraprake që janë në dispozicion.",
        labels: ["Zgjidh punën", "Krahaso pjesët", "Cakto buxhetin"],
        note: "Pamjet e Concept Studio shërbejnë si referencë vizuale. Kontrollo veçmas përputhshmërinë e pjesëve.",
      },
      {
        title: "Ruaje punën te makina.",
        body: "Regjistro punën kur të përfundojë. Shto koston dhe një foto që t’i gjesh më vonë në historikun e makinës.",
        labels: ["Regjistro punën", "Kostoja dhe fotot", "Historiku i makinës"],
        note: "Punët regjistrohen nga pronari. Ndarja e pasaportës së makinës është opsionale.",
      },
      {
        title: "Gjej një arsye për të dalë.",
        body: "Zbulo rrugë piktoreske në Roadbook. Jep pikënisjen, kohën dhe ndalesat që do, pastaj kontrollo propozimin e planifikuesit me AI.",
        labels: [
          "Gjej një rrugë",
          "Përshkruaj udhëtimin",
          "Kontrollo itinerarin",
        ],
        note: "Roadbook është publik. Planet personale me AI kërkojnë llogari CapCar dhe një shërbim AI të lidhur. Ofruesi mund të aplikojë tarifa.",
      },
      {
        title: "Ku duam ta çojmë CapCar.",
        body: "Duam ta bëjmë më të lehtë blerjen te shitësit pjesëmarrës, të ofrojmë më shumë pamje për modelin tënd dhe të mundësojmë regjistra të verifikuar nga serviset.",
        labels: [
          "Blerje te shitësi",
          "Pamje sipas modelit",
          "Regjistra të verifikuar",
        ],
        note: "Këto janë synime të planit të zhvillimit. Disponueshmëria varet nga zhvillimi dhe partnerët.",
      },
    ],
  },
  ja: {
    label: "CapCarの使い方",
    step: "ステップ {current} / {total}",
    back: "戻る",
    play: "再生",
    pause: "一時停止",
    next: "次へ",
    skip: "機能一覧へ",
    start: "ガレージを作る",
    steps: [
      {
        title: "まずは、今乗っている愛車から。",
        body: "非公開のガレージに愛車を登録。カスタム計画や整備履歴、次に行きたいドライブをひとつの場所から探せます。",
        labels: ["カスタム計画", "メンテナンス", "ドライブ"],
      },
      {
        title: "次の作業を計画する。",
        body: "作業を決め、パーツを比較し、予算を設定。見た目を検討するときは、コンセプトスタジオの対応プレビューを見られます。",
        labels: ["作業を選ぶ", "パーツを比較", "予算を設定"],
        note: "プレビューは見た目の参考です。パーツの適合は別途確認してください。",
      },
      {
        title: "作業の記録を愛車に残す。",
        body: "作業が終わったら、費用や写真と一緒に記録。あとから車両履歴で確認できます。",
        labels: ["作業を記録", "費用と写真を追加", "車両履歴"],
        note: "作業はオーナー自身が記録します。車両パスポートの共有は任意です。",
      },
      {
        title: "次のドライブを見つける。",
        body: "Roadbookで景色のいい道を探しましょう。出発地、使える時間、立ち寄り先をAIに伝え、提案されたプランを確認できます。",
        labels: ["道を探す", "希望を伝える", "ルートを確認"],
        note: "Roadbookは公開されています。個別のAIプランにはCapCarアカウントとAIサービスの連携が必要です。提供元の料金がかかる場合があります。",
      },
      {
        title: "CapCarが目指すこれから。",
        body: "参加販売店での購入、車種ごとのより充実したプレビュー、整備工場が確認した作業記録を目指しています。",
        labels: ["販売店での購入", "車種別プレビュー", "整備工場による確認"],
        note: "これらはロードマップ上の目標です。提供は開発状況とパートナーに左右されます。",
      },
    ],
  },
};
