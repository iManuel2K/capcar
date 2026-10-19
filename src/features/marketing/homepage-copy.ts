import type { AppLocale } from "@/i18n/config";

const en = {
  eyebrow: "A home for the car you own",
  headline: "Your car. Every idea, job and journey in one place.",
  description:
    "Plan upgrades, track costs, follow DIY guides and keep your car’s history together. Find your next drive when you’re ready to get out.",
  create: "Create your garage",
  explore: "Explore an example garage",
  support: "Start with the car you already own.",
  account:
    "Explore without an account. Create one when you’re ready to save your own car.",
  sample: "Example garage · Illustrative data",
  photo: "Black BMW E90 photographed beside a concrete bridge",
  active: "Active build",
  project: "A better daily driver",
  budget: "Project budget",
  planned: "Planned work",
  actual: "Actual spending",
  next: "Next task",
  task: "Replace the cabin filter",
  progress: "1 of 3 tasks completed",
  progressNote: "Progress counts completed tasks, not money spent.",
  usesEyebrow: "One car. Three starting points.",
  usesTitle: "What would you like to do next?",
  maintain: "Maintain your car",
  maintainText:
    "Find relevant DIY guides, keep maintenance records and line up the next job. Keep what you did, when you did it and what it cost.",
  maintainAccess:
    "Read Journal guides without an account. Saving tasks and vehicle records requires a garage account.",
  maintainAction: "Plan a maintenance task",
  guides: "Read a practical guide",
  guideName: "Plan a BMW weekend project",
  due: "Next up",
  done: "Recorded",
  completedTask: "Wiper blades replaced",
  build: "Plan your build",
  buildText:
    "Turn an idea into parts and tasks. Keep your budget, planned costs and actual spending in view as the project moves forward.",
  buildAccess:
    "Try the example below without registering. Your own saved plans need a garage account. Confirm fitment separately.",
  buildAction: "Start a build plan",
  drives: "Find your next drive",
  drivesText:
    "Explore Roadbook places and routes, then use AI trip planning to put a drive together around your plans.",
  drivesAccess:
    "Roadbook is open without an account. AI trip planning requires an account and a connected AI service; provider charges may apply.",
  drivesAction: "Explore Roadbook",
  trip: "Open AI trip planner",
  route: "A Sunday in the Rheingau",
  routeDetail: "A drive idea · Places, stops and a route to explore",
  drivePhoto:
    "Roadbook preview showing driving places across Europe; map data © OpenStreetMap contributors, OpenFreeMap and OpenMapTiles",
  storyEyebrow: "One example. The whole picture.",
  storyTitle: "From “one day” to part of your car’s story.",
  storyText:
    "Example BMW 318i · E90. A cabin-filter job shows how a plan becomes a record. All costs below are illustrative, not quotes.",
  idea: "Save the idea",
  ideaText:
    "Freshen up the daily driver. Put a cabin-filter replacement in the plan.",
  parts: "Organize parts and budget",
  partsText:
    "Example: €30 planned for the filter, within a €300 project budget. Check the exact part against your car.",
  guide: "Prepare with a guide",
  guideText:
    "Use the BMW weekend-project guide and checklist to organize the job. Follow the correct workshop procedure for your car.",
  record: "Record completed work",
  recordText:
    "Mark the task complete. Add a date, an optional photo and the actual cost: €28 in this example.",
  history: "See it in vehicle history",
  historyText:
    "The completed task joins the timeline. Actual spending is €28; reopening the task corrects the record.",
  ownerRecorded:
    "Owner-recorded work, not professional verification. Sharing stays optional.",
  demoTitle: "Look around before you make it yours.",
  demoText:
    "A read-only example of the BMW garage, with a local planning sandbox. Change a part or compare costs: nothing is purchased, saved to an account or written to a real owner’s garage.",
  demoHint:
    "Try Parts comparison, then Vehicle Passport to see how a planned part changes the example budget. Demo choices do not transfer to your own garage.",
  toolsEyebrow: "There when you need them",
  toolsTitle: "A few more tools for the detail-minded.",
  visual: "Visualizer",
  visualText:
    "Explore interactive reference car models and visual directions. A concept preview, not a guarantee of fitment or a model of your exact car.",
  sound: "Sound Studio",
  soundText:
    "Listen to engine and exhaust recordings. Compare a stock take with another recording or your own audio locally, without an account.",
  diagnostics: "Diagnostics",
  diagnosticsText:
    "Keep fault codes and your notes with the car. Requires a garage account. Native OBD connection is a preview; manual recording is available.",
  passport: "Passport",
  passportText:
    "Keep vehicle information and owner-recorded history together, with optional sharing. Create it in your garage; private details stay excluded by default.",
  open: "Explore",
  preview: "Preview",
  finalTitle: "Start with one car. Save the next thing you want to do.",
  finalText:
    "Add the essentials, choose your goal and save a first task or drive idea. You can fill in the rest later.",
} as const;
export type HomepageCopy = { [K in keyof typeof en]: string };

export const homepageCopy: Record<AppLocale, HomepageCopy> = {
  en,
  de: {
    eyebrow: "Ein Zuhause für dein Auto",
    headline: "Dein Auto. Jede Idee, jede Arbeit, jede Fahrt an einem Ort.",
    description:
      "Plane Umbauten, behalte Kosten im Blick, nutze DIY-Anleitungen und sammle die Geschichte deines Autos. Und wenn du losfahren willst, finde deine nächste Tour.",
    create: "Garage erstellen",
    explore: "Beispielgarage ansehen",
    support: "Fang mit dem Auto an, das du schon hast.",
    account:
      "Ohne Konto umsehen. Erstelle eines, wenn du dein eigenes Auto speichern möchtest.",
    sample: "Beispielgarage · Illustrative Daten",
    photo: "Schwarzer BMW E90 neben einer Betonbrücke",
    active: "Aktives Projekt",
    project: "Ein besserer Alltagswagen",
    budget: "Projektbudget",
    planned: "Geplante Arbeiten",
    actual: "Tatsächliche Ausgaben",
    next: "Nächste Aufgabe",
    task: "Innenraumfilter wechseln",
    progress: "1 von 3 Aufgaben erledigt",
    progressNote:
      "Der Fortschritt zählt erledigte Aufgaben, nicht ausgegebenes Geld.",
    usesEyebrow: "Ein Auto. Drei Möglichkeiten.",
    usesTitle: "Was möchtest du als Nächstes machen?",
    maintain: "Dein Auto warten",
    maintainText:
      "Finde passende DIY-Anleitungen, dokumentiere Wartungen und plane die nächste Arbeit. Halte fest, was du wann gemacht hast und was es gekostet hat.",
    maintainAccess:
      "Journal-Anleitungen sind ohne Konto lesbar. Zum Speichern von Aufgaben und Fahrzeugdaten brauchst du ein Garagenkonto.",
    maintainAction: "Wartungsaufgabe planen",
    guides: "Praktische Anleitung lesen",
    guideName: "Ein BMW-Wochenendprojekt planen",
    due: "Als Nächstes",
    done: "Dokumentiert",
    completedTask: "Wischerblätter ersetzt",
    build: "Deinen Umbau planen",
    buildText:
      "Mach aus einer Idee konkrete Teile und Aufgaben. Behalte Budget, geplante Kosten und tatsächliche Ausgaben im Blick, während dein Projekt wächst.",
    buildAccess:
      "Das Beispiel unten funktioniert ohne Anmeldung. Eigene Pläne erfordern ein Garagenkonto. Prüfe die Passgenauigkeit separat.",
    buildAction: "Umbau planen",
    drives: "Deine nächste Tour finden",
    drivesText:
      "Entdecke Orte und Routen im Roadbook. Stelle anschließend mit der KI-Reiseplanung eine Fahrt nach deinen Vorstellungen zusammen.",
    drivesAccess:
      "Das Roadbook ist ohne Konto zugänglich. Die KI-Reiseplanung benötigt ein Konto und einen verbundenen KI-Dienst; beim Anbieter können Kosten entstehen.",
    drivesAction: "Roadbook entdecken",
    trip: "KI-Reiseplanung öffnen",
    route: "Ein Sonntag im Rheingau",
    routeDetail:
      "Eine Ausflugsidee · Orte, Stopps und eine Route zum Entdecken",
    drivePhoto:
      "Roadbook-Vorschau mit Ausflugszielen in Europa; Kartendaten © OpenStreetMap-Mitwirkende, OpenFreeMap und OpenMapTiles",
    storyEyebrow: "Ein Beispiel. Der ganze Zusammenhang.",
    storyTitle: "Von „irgendwann“ zur Geschichte deines Autos.",
    storyText:
      "Beispiel: BMW 318i · E90. Ein Innenraumfilterwechsel zeigt, wie aus einem Plan ein Eintrag wird. Alle Kosten sind illustrative Beispiele, keine Angebote.",
    idea: "Idee festhalten",
    ideaText:
      "Den Alltagswagen auffrischen. Einen Innenraumfilterwechsel in den Plan aufnehmen.",
    parts: "Teile und Budget ordnen",
    partsText:
      "Beispiel: 30 € für den Filter bei 300 € Projektbudget. Prüfe das genaue Teil anhand deines Autos.",
    guide: "Mit einer Anleitung vorbereiten",
    guideText:
      "Organisiere die Arbeit mit der BMW-Wochenendprojekt-Anleitung und Checkliste. Beachte das passende Werkstattverfahren für dein Auto.",
    record: "Erledigte Arbeit dokumentieren",
    recordText:
      "Aufgabe abschließen. Datum, optionales Foto und tatsächliche Kosten hinzufügen: hier 28 €.",
    history: "In der Fahrzeughistorie sehen",
    historyText:
      "Die erledigte Aufgabe erscheint in der Zeitleiste. Tatsächlich ausgegeben: 28 €. Wiederöffnen korrigiert den Eintrag.",
    ownerRecorded:
      "Vom Halter dokumentiert, nicht fachlich verifiziert. Teilen ist freiwillig.",
    demoTitle: "Erst umsehen. Dann deine eigene Garage starten.",
    demoText:
      "Eine schreibgeschützte BMW-Beispielgarage mit lokalem Planungsbereich. Ändere ein Teil oder vergleiche Kosten: Es wird nichts gekauft, in einem Konto gespeichert oder in eine echte Garage geschrieben.",
    demoHint:
      "Probiere den Teilevergleich und danach den Fahrzeugpass aus. So siehst du, wie ein geplantes Teil das Beispielbudget verändert. Die Auswahl wird nicht in deine Garage übernommen.",
    toolsEyebrow: "Da, wenn du sie brauchst",
    toolsTitle: "Mehr Werkzeuge für die Details.",
    visual: "Visualizer",
    visualText:
      "Erkunde interaktive Referenzmodelle und Designideen. Eine Konzeptvorschau, keine Passgarantie und kein Modell deines exakten Autos.",
    sound: "Sound Studio",
    soundText:
      "Höre Motor- und Auspuffaufnahmen. Vergleiche Serienklang mit einer anderen oder deiner eigenen Aufnahme lokal, ohne Konto.",
    diagnostics: "Diagnose",
    diagnosticsText:
      "Sammle Fehlercodes und Notizen beim Auto. Garagenkonto erforderlich. Die native OBD-Verbindung ist eine Vorschau; manuelle Einträge sind möglich.",
    passport: "Fahrzeugpass",
    passportText:
      "Fahrzeugdaten und selbst dokumentierte Historie zusammenhalten und optional teilen. In der Garage erstellen; private Angaben bleiben standardmäßig ausgeschlossen.",
    open: "Entdecken",
    preview: "Vorschau",
    finalTitle: "Ein Auto genügt. Speichere, was du als Nächstes vorhast.",
    finalText:
      "Trage das Wichtigste ein, wähle dein Ziel und speichere eine erste Aufgabe oder Ausflugsidee. Den Rest kannst du später ergänzen.",
  },
  el: {
    eyebrow: "Ένας χώρος για το αυτοκίνητό σου",
    headline:
      "Το αυτοκίνητό σου. Κάθε ιδέα, εργασία και διαδρομή σε ένα μέρος.",
    description:
      "Σχεδίασε αναβαθμίσεις, παρακολούθησε έξοδα, ακολούθησε οδηγούς DIY και κράτησε το ιστορικό του αυτοκινήτου σου συγκεντρωμένο. Βρες την επόμενη διαδρομή σου όταν έρθει η ώρα για βόλτα.",
    create: "Δημιούργησε το γκαράζ σου",
    explore: "Δες ένα γκαράζ-παράδειγμα",
    support: "Ξεκίνα με το αυτοκίνητο που ήδη έχεις.",
    account:
      "Περιηγήσου χωρίς λογαριασμό. Δημιούργησε έναν όταν θελήσεις να αποθηκεύσεις το δικό σου αυτοκίνητο.",
    sample: "Γκαράζ-παράδειγμα · Ενδεικτικά δεδομένα",
    photo: "Μαύρη BMW E90 δίπλα σε γέφυρα από σκυρόδεμα",
    active: "Ενεργό πρότζεκτ",
    project: "Καλύτερο αυτοκίνητο για κάθε μέρα",
    budget: "Προϋπολογισμός έργου",
    planned: "Προγραμματισμένες εργασίες",
    actual: "Πραγματικά έξοδα",
    next: "Επόμενη εργασία",
    task: "Αλλαγή φίλτρου καμπίνας",
    progress: "Ολοκληρώθηκε 1 από 3 εργασίες",
    progressNote:
      "Η πρόοδος μετρά ολοκληρωμένες εργασίες, όχι χρήματα που ξοδεύτηκαν.",
    usesEyebrow: "Ένα αυτοκίνητο. Τρεις αφετηρίες.",
    usesTitle: "Τι θέλεις να κάνεις στη συνέχεια;",
    maintain: "Συντήρησε το αυτοκίνητό σου",
    maintainText:
      "Βρες σχετικούς οδηγούς DIY, κράτησε αρχείο συντήρησης και οργάνωσε την επόμενη εργασία. Κατέγραψε τι έκανες, πότε και πόσο κόστισε.",
    maintainAccess:
      "Οι οδηγοί Journal διαβάζονται χωρίς λογαριασμό. Για αποθήκευση εργασιών και αρχείων οχήματος χρειάζεται λογαριασμός γκαράζ.",
    maintainAction: "Προγραμμάτισε μια συντήρηση",
    guides: "Διάβασε έναν πρακτικό οδηγό",
    guideName: "Σχεδίασε ένα πρότζεκτ Σαββατοκύριακου για BMW",
    due: "Στη συνέχεια",
    done: "Καταγράφηκε",
    completedTask: "Αντικαταστάθηκαν οι υαλοκαθαριστήρες",
    build: "Σχεδίασε τις μετατροπές σου",
    buildText:
      "Κάνε μια ιδέα ανταλλακτικά και εργασίες. Κράτησε ορατά τον προϋπολογισμό, τα προγραμματισμένα κόστη και τα πραγματικά έξοδα καθώς προχωρά το έργο.",
    buildAccess:
      "Δοκίμασε το παράδειγμα χωρίς εγγραφή. Τα δικά σου αποθηκευμένα σχέδια χρειάζονται λογαριασμό γκαράζ. Επιβεβαίωσε ξεχωριστά τη συμβατότητα.",
    buildAction: "Ξεκίνα ένα σχέδιο μετατροπών",
    drives: "Βρες την επόμενη διαδρομή σου",
    drivesText:
      "Ανακάλυψε μέρη και διαδρομές στο Roadbook και χρησιμοποίησε τον σχεδιασμό ταξιδιού με AI για μια βόλτα στα μέτρα σου.",
    drivesAccess:
      "Το Roadbook είναι ανοιχτό χωρίς λογαριασμό. Ο σχεδιασμός με AI απαιτεί λογαριασμό και συνδεδεμένη υπηρεσία AI· ενδέχεται να υπάρχουν χρεώσεις παρόχου.",
    drivesAction: "Εξερεύνησε το Roadbook",
    trip: "Άνοιξε τον σχεδιασμό ταξιδιού με AI",
    route: "Μια Κυριακή στο Rheingau",
    routeDetail:
      "Μια ιδέα εκδρομής · Μέρη, στάσεις και μια διαδρομή για εξερεύνηση",
    drivePhoto:
      "Προεπισκόπηση Roadbook με μέρη για οδήγηση στην Ευρώπη· δεδομένα χάρτη © συνεισφέροντες OpenStreetMap, OpenFreeMap και OpenMapTiles",
    storyEyebrow: "Ένα παράδειγμα. Ολόκληρη η εικόνα.",
    storyTitle: "Από το «κάποια μέρα» στην ιστορία του αυτοκινήτου σου.",
    storyText:
      "Παράδειγμα BMW 318i · E90. Η αλλαγή φίλτρου καμπίνας δείχνει πώς ένα σχέδιο γίνεται καταγραφή. Όλα τα κόστη είναι ενδεικτικά, όχι προσφορές.",
    idea: "Κράτησε την ιδέα",
    ideaText:
      "Φρέσκαρε το καθημερινό σου αυτοκίνητο. Πρόσθεσε την αλλαγή φίλτρου καμπίνας στο σχέδιο.",
    parts: "Οργάνωσε ανταλλακτικά και κόστος",
    partsText:
      "Παράδειγμα: 30 € για το φίλτρο, μέσα σε προϋπολογισμό έργου 300 €. Έλεγξε το ακριβές ανταλλακτικό για το αυτοκίνητό σου.",
    guide: "Προετοιμάσου με έναν οδηγό",
    guideText:
      "Οργάνωσε τη δουλειά με τον οδηγό και τη λίστα BMW για το Σαββατοκύριακο. Ακολούθησε τη σωστή διαδικασία συνεργείου για το αυτοκίνητό σου.",
    record: "Κατάγραψε την ολοκληρωμένη εργασία",
    recordText:
      "Ολοκλήρωσε την εργασία. Πρόσθεσε ημερομηνία, προαιρετική φωτογραφία και πραγματικό κόστος: εδώ 28 €.",
    history: "Δες την στο ιστορικό οχήματος",
    historyText:
      "Η ολοκληρωμένη εργασία εμφανίζεται στο χρονολόγιο. Πραγματικά έξοδα: 28 €. Η επαναφορά της εργασίας διορθώνει την καταγραφή.",
    ownerRecorded:
      "Καταγραφή ιδιοκτήτη, όχι επαγγελματική επαλήθευση. Η κοινοποίηση είναι προαιρετική.",
    demoTitle: "Δες πώς λειτουργεί πριν το κάνεις δικό σου.",
    demoText:
      "Ένα γκαράζ BMW μόνο για ανάγνωση, με τοπικό χώρο δοκιμής σχεδιασμού. Άλλαξε ανταλλακτικό ή σύγκρινε κόστη: τίποτα δεν αγοράζεται, δεν αποθηκεύεται σε λογαριασμό και δεν αλλάζει πραγματικό γκαράζ.",
    demoHint:
      "Δοκίμασε τη σύγκριση ανταλλακτικών και μετά το Διαβατήριο οχήματος για να δεις την αλλαγή στον ενδεικτικό προϋπολογισμό. Οι επιλογές δεν μεταφέρονται στο δικό σου γκαράζ.",
    toolsEyebrow: "Εκεί όταν τα χρειάζεσαι",
    toolsTitle: "Εργαλεία για όσους προσέχουν τη λεπτομέρεια.",
    visual: "Visualizer",
    visualText:
      "Εξερεύνησε διαδραστικά μοντέλα αναφοράς και οπτικές ιδέες. Προεπισκόπηση ιδέας, όχι εγγύηση συμβατότητας ή ακριβές μοντέλο του αυτοκινήτου σου.",
    sound: "Sound Studio",
    soundText:
      "Άκου ηχογραφήσεις κινητήρων και εξατμίσεων. Σύγκρινε εργοστασιακό ήχο με άλλη ή δική σου ηχογράφηση τοπικά, χωρίς λογαριασμό.",
    diagnostics: "Διαγνωστικά",
    diagnosticsText:
      "Κράτησε κωδικούς βλαβών και σημειώσεις μαζί με το αυτοκίνητο. Απαιτείται λογαριασμός. Η εγγενής σύνδεση OBD είναι σε προεπισκόπηση· υπάρχει χειροκίνητη καταγραφή.",
    passport: "Διαβατήριο οχήματος",
    passportText:
      "Συγκέντρωσε στοιχεία οχήματος και ιστορικό ιδιοκτήτη, με προαιρετική κοινοποίηση. Δημιουργείται στο γκαράζ· οι ιδιωτικές λεπτομέρειες εξαιρούνται από προεπιλογή.",
    open: "Εξερεύνησε",
    preview: "Προεπισκόπηση",
    finalTitle:
      "Ξεκίνα με ένα αυτοκίνητο. Αποθήκευσε αυτό που θέλεις να κάνεις μετά.",
    finalText:
      "Πρόσθεσε τα βασικά, διάλεξε στόχο και αποθήκευσε μια πρώτη εργασία ή ιδέα διαδρομής. Τα υπόλοιπα συμπληρώνονται αργότερα.",
  },
  sq: {
    eyebrow: "Një vend për makinën tënde",
    headline: "Makina jote. Çdo ide, punë dhe udhëtim në një vend.",
    description:
      "Planifiko përmirësime, ndiq kostot, përdor udhëzues DIY dhe mbaj bashkë historikun e makinës. Gjej rrugën e radhës kur të jesh gati për të dalë.",
    create: "Krijo garazhin tënd",
    explore: "Shiko një garazh shembull",
    support: "Fillo me makinën që ke tashmë.",
    account:
      "Eksploro pa llogari. Krijo një kur të jesh gati të ruash makinën tënde.",
    sample: "Garazh shembull · Të dhëna ilustruese",
    photo: "BMW E90 e zezë pranë një ure betoni",
    active: "Projekt aktiv",
    project: "Një makinë më e mirë për çdo ditë",
    budget: "Buxheti i projektit",
    planned: "Punë të planifikuara",
    actual: "Shpenzime reale",
    next: "Detyra e radhës",
    task: "Ndërro filtrin e kabinës",
    progress: "1 nga 3 detyra të përfunduara",
    progressNote: "Progresi mat detyrat e përfunduara, jo paratë e shpenzuara.",
    usesEyebrow: "Një makinë. Tre pikënisje.",
    usesTitle: "Çfarë do të bësh më pas?",
    maintain: "Mirëmbaj makinën",
    maintainText:
      "Gjej udhëzues DIY të përshtatshëm, mbaj shënime mirëmbajtjeje dhe planifiko punën e radhës. Shëno çfarë bëre, kur dhe sa kushtoi.",
    maintainAccess:
      "Udhëzuesit Journal lexohen pa llogari. Ruajtja e detyrave dhe historikut kërkon llogari garazhi.",
    maintainAction: "Planifiko një detyrë mirëmbajtjeje",
    guides: "Lexo një udhëzues praktik",
    guideName: "Planifiko një projekt fundjave për BMW",
    due: "Në vijim",
    done: "E regjistruar",
    completedTask: "Fshirëset e xhamit u ndërruan",
    build: "Planifiko modifikimet",
    buildText:
      "Ktheje një ide në pjesë dhe detyra. Mbaj parasysh buxhetin, kostot e planifikuara dhe shpenzimet reale gjatë ecurisë së projektit.",
    buildAccess:
      "Provo shembullin më poshtë pa regjistrim. Planet e tua të ruajtura kërkojnë llogari garazhi. Verifiko veçmas përshtatshmërinë e pjesëve.",
    buildAction: "Fillo një plan modifikimesh",
    drives: "Gjej rrugën e radhës",
    drivesText:
      "Zbulo vende dhe rrugë në Roadbook, pastaj përdor planifikimin me AI për të organizuar një shëtitje sipas dëshirës.",
    drivesAccess:
      "Roadbook hapet pa llogari. Planifikimi me AI kërkon llogari dhe një shërbim AI të lidhur; ofruesi mund të ketë tarifa.",
    drivesAction: "Eksploro Roadbook",
    trip: "Hap planifikuesin e udhëtimeve me AI",
    route: "Një e diel në Rheingau",
    routeDetail:
      "Ide udhëtimi · Vende, ndalesa dhe një rrugë për t’u eksploruar",
    drivePhoto:
      "Parapamje Roadbook me vende për udhëtime në Evropë; të dhënat e hartës © kontribuesit e OpenStreetMap, OpenFreeMap dhe OpenMapTiles",
    storyEyebrow: "Një shembull. Pamja e plotë.",
    storyTitle: "Nga «një ditë» në historinë e makinës tënde.",
    storyText:
      "Shembull BMW 318i · E90. Ndërrimi i filtrit të kabinës tregon si plani bëhet shënim historiku. Të gjitha kostot janë ilustruese, jo oferta.",
    idea: "Ruaj idenë",
    ideaText:
      "Rifresko makinën e përditshme. Shto ndërrimin e filtrit të kabinës në plan.",
    parts: "Organizo pjesët dhe buxhetin",
    partsText:
      "Shembull: 30 € për filtrin, brenda një buxheti projekti prej 300 €. Kontrollo pjesën e saktë për makinën tënde.",
    guide: "Përgatitu me një udhëzues",
    guideText:
      "Organizo punën me udhëzuesin dhe listën e projektit BMW për fundjavë. Ndiq procedurën e saktë të servisimit për makinën tënde.",
    record: "Regjistro punën e përfunduar",
    recordText:
      "Shëno detyrën si të përfunduar. Shto datën, një foto sipas dëshirës dhe koston reale: 28 € në këtë shembull.",
    history: "Shikoje në historikun e makinës",
    historyText:
      "Detyra e përfunduar shfaqet në kronologji. Shpenzimi real është 28 €; rihapja e detyrës korrigjon shënimin.",
    ownerRecorded:
      "Punë e regjistruar nga pronari, jo verifikim profesional. Ndarja është fakultative.",
    demoTitle: "Shikoje para se ta bësh tëndin.",
    demoText:
      "Një garazh BMW vetëm për lexim, me një hapësirë lokale për të provuar planet. Ndrysho një pjesë ose krahaso kostot: asgjë nuk blihet, nuk ruhet në llogari dhe nuk ndryshon garazhin e një pronari real.",
    demoHint:
      "Provo krahasimin e pjesëve, pastaj Pasaportën e makinës për të parë ndikimin te buxheti shembull. Zgjedhjet nuk transferohen te garazhi yt.",
    toolsEyebrow: "Aty kur të duhen",
    toolsTitle: "Mjete të tjera për ata që duan detajet.",
    visual: "Visualizer",
    visualText:
      "Eksploro modele interaktive reference dhe ide pamjeje. Parapamje koncepti, jo garanci përshtatshmërie apo model i saktë i makinës tënde.",
    sound: "Sound Studio",
    soundText:
      "Dëgjo regjistrime motorësh dhe marmitash. Krahaso tingullin standard me një regjistrim tjetër ose tëndin lokalisht, pa llogari.",
    diagnostics: "Diagnostikimi",
    diagnosticsText:
      "Mbaj kodet e defekteve dhe shënimet bashkë me makinën. Kërkon llogari garazhi. Lidhja vendase OBD është parapamje; regjistrimi manual është i disponueshëm.",
    passport: "Pasaporta",
    passportText:
      "Mbaj bashkë të dhënat e makinës dhe historikun e regjistruar nga pronari, me ndarje fakultative. Krijoje në garazh; detajet private përjashtohen si parazgjedhje.",
    open: "Eksploro",
    preview: "Parapamje",
    finalTitle: "Fillo me një makinë. Ruaj atë që do të bësh më pas.",
    finalText:
      "Shto të dhënat bazë, zgjidh synimin dhe ruaj një detyrë ose ide udhëtimi. Pjesën tjetër mund ta plotësosh më vonë.",
  },
  ja: {
    eyebrow: "今の愛車に、ひとつの居場所を",
    headline: "愛車のアイデアも、整備も、ドライブも。すべてひとつに。",
    description:
      "カスタムを計画し、費用を記録し、DIYガイドを参考に。愛車の履歴をまとめて残せます。走りに出たくなったら、次のドライブを見つけましょう。",
    create: "ガレージを作成",
    explore: "サンプルガレージを見る",
    support: "今乗っている車から始めましょう。",
    account:
      "閲覧にアカウントは不要です。自分の車を保存するときに作成できます。",
    sample: "サンプルガレージ・架空のデータ",
    photo: "コンクリート橋のそばに停まる黒いBMW E90",
    active: "進行中のプロジェクト",
    project: "毎日の走りを、もっと快適に",
    budget: "プロジェクト予算",
    planned: "予定している作業",
    actual: "実際の支出",
    next: "次のタスク",
    task: "キャビンフィルターを交換",
    progress: "3件中1件のタスクが完了",
    progressNote: "進捗は支出額ではなく、完了したタスク数で計算します。",
    usesEyebrow: "1台の愛車。3つの始め方。",
    usesTitle: "次は何をしましょうか？",
    maintain: "愛車をメンテナンス",
    maintainText:
      "関連するDIYガイドを探し、整備の記録と次の作業を整理。いつ、何をして、いくらかかったかを残せます。",
    maintainAccess:
      "Journalのガイドはアカウントなしで読めます。タスクや車両記録の保存にはガレージ用アカウントが必要です。",
    maintainAction: "整備タスクを計画",
    guides: "実用ガイドを読む",
    guideName: "BMWの週末プロジェクトを計画する",
    due: "次の予定",
    done: "記録済み",
    completedTask: "ワイパーブレード交換済み",
    build: "カスタムを計画",
    buildText:
      "アイデアをパーツとタスクに。プロジェクトを進めながら、予算・予定費用・実際の支出を確認できます。",
    buildAccess:
      "下のサンプルは登録せずに試せます。自分の計画の保存にはアカウントが必要です。適合は別途確認してください。",
    buildAction: "カスタム計画を始める",
    drives: "次のドライブを見つける",
    drivesText:
      "Roadbookでスポットやルートを探し、AI旅行プランナーで予定に合ったドライブを組み立てましょう。",
    drivesAccess:
      "Roadbookはアカウント不要です。AI旅行プランナーにはアカウントとAIサービスの接続が必要です。サービス提供元の料金がかかる場合があります。",
    drivesAction: "Roadbookを見る",
    trip: "AI旅行プランナーを開く",
    route: "ラインガウで過ごす日曜日",
    routeDetail: "ドライブのアイデア・スポットや立ち寄り先、ルートを探す",
    drivePhoto:
      "ヨーロッパのドライブスポットを表示したRoadbookの画面。地図データ © OpenStreetMapの貢献者、OpenFreeMap、OpenMapTiles",
    storyEyebrow: "ひとつの例で、つながりを確認。",
    storyTitle: "「いつかやりたい」を、愛車の履歴に。",
    storyText:
      "サンプル：BMW 318i・E90。キャビンフィルターの交換を例に、計画が記録になる流れをご紹介します。金額はすべて例示で、見積もりではありません。",
    idea: "アイデアを保存",
    ideaText:
      "毎日の愛車をリフレッシュ。キャビンフィルター交換を計画に追加します。",
    parts: "パーツと予算を整理",
    partsText:
      "例：プロジェクト予算300ユーロのうち、フィルターに30ユーロを予定。自分の車に合う品番を確認します。",
    guide: "ガイドで準備",
    guideText:
      "BMW週末プロジェクトのガイドとチェックリストで作業を整理。車両に合った正しい整備手順に従ってください。",
    record: "完了した作業を記録",
    recordText:
      "タスクを完了にし、日付と実費、必要なら写真を追加。実費はこの例では28ユーロです。",
    history: "車両履歴で確認",
    historyText:
      "完了した作業がタイムラインに反映されます。実際の支出は28ユーロ。タスクを再開すれば記録も修正されます。",
    ownerRecorded:
      "オーナーによる記録で、専門家の認証ではありません。共有は任意です。",
    demoTitle: "自分のガレージを作る前に、のぞいてみましょう。",
    demoText:
      "BMWの閲覧専用サンプルと、端末内だけで試せる計画デモです。パーツや費用を変更しても、購入・アカウントへの保存・実在するガレージの変更は行われません。",
    demoHint:
      "パーツ比較の後に車両パスポートを開くと、予定パーツがサンプル予算にどう反映されるか確認できます。選択内容は自分のガレージには引き継がれません。",
    toolsEyebrow: "必要なときに、必要な道具を",
    toolsTitle: "細部までこだわるためのツール。",
    visual: "Visualizer",
    visualText:
      "参考用のインタラクティブな車両モデルや外観アイデアを確認。コンセプトのプレビューであり、適合保証や愛車そのもののモデルではありません。",
    sound: "Sound Studio",
    soundText:
      "エンジンや排気音の録音を試聴。純正音と別の録音や自分の音源を端末内で比較できます。アカウントは不要です。",
    diagnostics: "診断",
    diagnosticsText:
      "故障コードとメモを愛車と一緒に記録。アカウントが必要です。ネイティブOBD接続はプレビュー段階で、手動記録は利用できます。",
    passport: "車両パスポート",
    passportText:
      "車両情報とオーナーの記録をまとめ、任意で共有。ガレージ内で作成でき、非公開情報は初期設定では共有されません。",
    open: "詳しく見る",
    preview: "プレビュー",
    finalTitle: "まずは1台。次にやりたいことを保存しましょう。",
    finalText:
      "基本情報と目標を選び、最初のタスクやドライブのアイデアを保存。詳しい情報は後から追加できます。",
  },
};
