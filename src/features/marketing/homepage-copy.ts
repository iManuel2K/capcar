import type { AppLocale } from "@/i18n/config";

const en = {
  eyebrow: "CapCar — Digital Garage",
  headline: "See the build. Make it happen.",
  description: "Visualize upgrades. Plan the parts, budget and work.",
  create: "Create your garage",
  openGarage: "Open garage",
  undo: "Undo completion",
  explore: "Try the demo",
  support: "Start with the car you already own.",
  account: "Explore freely. Create an account to save your car.",
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
    "Find a guide, plan the next job and keep a record of the work and cost.",
  maintainAccess:
    "Guides are public. An account saves your tasks and vehicle records.",
  maintainAction: "Plan a maintenance task",
  guides: "Read a practical guide",
  guideName: "Plan a BMW weekend project",
  due: "Next up",
  done: "Recorded",
  completedTask: "Wiper blades replaced",
  build: "Plan your build",
  buildText:
    "Plan the parts and tasks for your build. Track your budget, planned costs and actual spending as you go.",
  buildAccess:
    "Try the example below. Create an account to save your own build.",
  buildAction: "Start a build plan",
  drives: "Find your next drive",
  drivesText:
    "Find places and routes in Roadbook, then use AI trip planning to organize your drive.",
  drivesAccess:
    "Roadbook is open without an account. AI trip planning requires an account and a connected AI service; provider charges may apply.",
  drivesAction: "Explore Roadbook",
  trip: "Open AI trip planner",
  route: "A Sunday in the Rheingau",
  routeDetail: "A drive idea · Places, stops and a route to explore",
  drivePhoto:
    "Roadbook preview showing driving places across Europe; map data © OpenStreetMap contributors, OpenFreeMap and OpenMapTiles",
  storyEyebrow: "Maintenance example",
  storyTitle: "From a planned job to your vehicle history.",
  storyText:
    "Follow a cabin-filter replacement on an example BMW 318i (E90). All costs shown are illustrative, not quotes.",
  idea: "Save the idea",
  ideaText: "Add a cabin-filter replacement to your plan.",
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
  demoTitle: "Try a job on the example BMW.",
  demoText:
    "Compare a part and see how it changes the BMW build budget. This uses example data; nothing is bought or saved.",
  demoHint:
    "Open Vehicle Passport to see the planned part in the example record.",
  toolsEyebrow: "There when you need them",
  toolsTitle: "Models, sound and vehicle records",
  visual: "Visualizer",
  visualText:
    "Explore interactive reference car models and concept previews. These do not guarantee fitment or model your exact car.",
  sound: "Sound Studio",
  soundText:
    "Listen to engine and exhaust recordings. Compare a stock take with another recording or your own audio locally, without an account.",
  diagnostics: "Diagnostics",
  diagnosticsText:
    "Save fault codes and notes with your car. Manual entries are available; native OBD scanning is a preview.",
  passport: "Passport",
  passportText:
    "Keep vehicle details and owner-recorded history together. Share only what you choose.",
  open: "Explore",
  preview: "Preview",
  finalTitle: "Add your car and save your first plan.",
  finalText:
    "Add the essentials, choose your goal and save a first task or drive idea. You can fill in the rest later.",
} as const;
export type HomepageCopy = { [K in keyof typeof en]: string };

export const homepageCopy: Record<AppLocale, HomepageCopy> = {
  en,
  de: {
    eyebrow: "CapCar — Digitale Garage",
    headline: "Sieh den Umbau. Mach ihn möglich.",
    description: "Visualisiere Ideen. Plane Teile, Budget und Arbeiten.",
    create: "Garage erstellen",
    openGarage: "Garage öffnen",
    undo: "Abschluss rückgängig machen",
    explore: "Demo ausprobieren",
    support: "Fang mit dem Auto an, das du schon hast.",
    account: "Ohne Konto umsehen. Mit Konto dein Auto speichern.",
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
      "Finde eine Anleitung, plane die nächste Arbeit und dokumentiere Aufwand und Kosten.",
    maintainAccess:
      "Anleitungen sind frei zugänglich. Aufgaben und Fahrzeugdaten speicherst du mit Konto.",
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
      "Probiere das Beispiel unten aus. Deinen eigenen Umbau speicherst du mit Konto.",
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
    storyTitle: "Von der geplanten Arbeit zur Fahrzeughistorie.",
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
    demoTitle: "Probiere eine Arbeit an der Beispiel-BMW aus.",
    demoText:
      "Vergleiche ein Teil und sieh, wie sich das BMW-Budget ändert. Nur Beispieldaten; kein Kauf und keine Speicherung.",
    demoHint:
      "Öffne den Fahrzeugpass und sieh das geplante Teil im Beispieleintrag.",
    toolsEyebrow: "Da, wenn du sie brauchst",
    toolsTitle: "Modelle, Sound und Fahrzeugeinträge",
    visual: "Visualizer",
    visualText:
      "Erkunde interaktive Referenzmodelle und Designideen. Eine Konzeptvorschau, keine Passgarantie und kein Modell deines exakten Autos.",
    sound: "Sound Studio",
    soundText:
      "Höre Motor- und Auspuffaufnahmen. Vergleiche Serienklang mit einer anderen oder deiner eigenen Aufnahme lokal, ohne Konto.",
    diagnostics: "Diagnose",
    diagnosticsText:
      "Speichere Fehlercodes und Notizen beim Auto. Manuelle Einträge sind verfügbar; natives OBD-Scanning ist eine Vorschau.",
    passport: "Fahrzeugpass",
    passportText:
      "Fahrzeugdaten und selbst dokumentierte Historie an einem Ort. Teile nur, was du möchtest.",
    open: "Entdecken",
    preview: "Vorschau",
    finalTitle: "Ein Auto genügt. Speichere, was du als Nächstes vorhast.",
    finalText:
      "Trage das Wichtigste ein, wähle dein Ziel und speichere eine erste Aufgabe oder Ausflugsidee. Den Rest kannst du später ergänzen.",
  },
  el: {
    eyebrow: "CapCar — Ψηφιακό γκαράζ",
    headline: "Δες την ιδέα. Κάν’ την πράξη.",
    description: "Δες τις αλλαγές. Οργάνωσε ανταλλακτικά, κόστος και εργασίες.",
    create: "Δημιούργησε το γκαράζ σου",
    openGarage: "Άνοιγμα γκαράζ",
    undo: "Αναίρεση ολοκλήρωσης",
    explore: "Δοκίμασε το demo",
    support: "Ξεκίνα με το αυτοκίνητο που ήδη έχεις.",
    account:
      "Εξερεύνησε ελεύθερα. Δημιούργησε λογαριασμό για να αποθηκεύσεις το αυτοκίνητό σου.",
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
      "Βρες οδηγό, σχεδίασε την επόμενη εργασία και κατέγραψε τη δουλειά και το κόστος.",
    maintainAccess:
      "Οι οδηγοί είναι δημόσιοι. Ο λογαριασμός αποθηκεύει εργασίες και στοιχεία οχήματος.",
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
      "Δοκίμασε το παράδειγμα παρακάτω. Με λογαριασμό αποθηκεύεις το δικό σου πρότζεκτ.",
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
    storyTitle:
      "Από μια προγραμματισμένη εργασία στο ιστορικό του αυτοκινήτου.",
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
    demoTitle: "Δοκίμασε μια εργασία στην BMW του παραδείγματος.",
    demoText:
      "Σύγκρινε ένα ανταλλακτικό και δες τον προϋπολογισμό της BMW να αλλάζει. Μόνο ενδεικτικά δεδομένα· χωρίς αγορά ή αποθήκευση.",
    demoHint:
      "Άνοιξε το Διαβατήριο οχήματος για να δεις το προγραμματισμένο ανταλλακτικό στην εγγραφή-παράδειγμα.",
    toolsEyebrow: "Εκεί όταν τα χρειάζεσαι",
    toolsTitle: "Μοντέλα, ήχος και αρχεία αυτοκινήτου",
    visual: "Visualizer",
    visualText:
      "Εξερεύνησε διαδραστικά μοντέλα αναφοράς και οπτικές ιδέες. Προεπισκόπηση ιδέας, όχι εγγύηση συμβατότητας ή ακριβές μοντέλο του αυτοκινήτου σου.",
    sound: "Sound Studio",
    soundText:
      "Άκου ηχογραφήσεις κινητήρων και εξατμίσεων. Σύγκρινε εργοστασιακό ήχο με άλλη ή δική σου ηχογράφηση τοπικά, χωρίς λογαριασμό.",
    diagnostics: "Διαγνωστικά",
    diagnosticsText:
      "Αποθήκευσε κωδικούς βλαβών και σημειώσεις στο όχημα. Διατίθεται χειροκίνητη καταγραφή· η σύνδεση OBD είναι προεπισκόπηση.",
    passport: "Διαβατήριο οχήματος",
    passportText:
      "Κράτα μαζί στοιχεία οχήματος και ιστορικό που καταγράφεις. Μοιράσου μόνο ό,τι επιλέξεις.",
    open: "Εξερεύνησε",
    preview: "Προεπισκόπηση",
    finalTitle:
      "Ξεκίνα με ένα αυτοκίνητο. Αποθήκευσε αυτό που θέλεις να κάνεις μετά.",
    finalText:
      "Πρόσθεσε τα βασικά, διάλεξε στόχο και αποθήκευσε μια πρώτη εργασία ή ιδέα διαδρομής. Τα υπόλοιπα συμπληρώνονται αργότερα.",
  },
  sq: {
    eyebrow: "CapCar — Garazh digjital",
    headline: "Shihe idenë. Bëje realitet.",
    description: "Shiko ndryshimet. Planifiko pjesët, buxhetin dhe punën.",
    create: "Krijo garazhin tënd",
    openGarage: "Hap garazhin",
    undo: "Anulo përfundimin",
    explore: "Provo demonstrimin",
    support: "Fillo me makinën që ke tashmë.",
    account: "Eksploro lirisht. Krijo llogari për të ruajtur makinën tënde.",
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
      "Gjej një udhëzues, planifiko punën e radhës dhe regjistro punën e koston.",
    maintainAccess:
      "Udhëzuesit janë publikë. Llogaria ruan detyrat dhe të dhënat e makinës.",
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
      "Provo shembullin më poshtë. Krijo llogari për të ruajtur projektin tënd.",
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
    storyTitle: "Nga një punë e planifikuar te historiku i makinës.",
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
    demoTitle: "Provo një punë në BMW-në shembull.",
    demoText:
      "Krahaso një pjesë dhe shiko si ndryshon buxheti i BMW-së. Vetëm të dhëna shembull; asgjë nuk blihet ose ruhet.",
    demoHint:
      "Hap Pasaportën e makinës për të parë pjesën e planifikuar në regjistrin shembull.",
    toolsEyebrow: "Aty kur të duhen",
    toolsTitle: "Modele, tinguj dhe regjistra të makinës",
    visual: "Visualizer",
    visualText:
      "Eksploro modele interaktive reference dhe ide pamjeje. Parapamje koncepti, jo garanci përshtatshmërie apo model i saktë i makinës tënde.",
    sound: "Sound Studio",
    soundText:
      "Dëgjo regjistrime motorësh dhe marmitash. Krahaso tingullin standard me një regjistrim tjetër ose tëndin lokalisht, pa llogari.",
    diagnostics: "Diagnostikimi",
    diagnosticsText:
      "Ruaj kodet e defekteve dhe shënimet te makina. Regjistrimi manual është i disponueshëm; skanimi OBD është pamje paraprake.",
    passport: "Pasaporta",
    passportText:
      "Mbaji bashkë të dhënat e makinës dhe historikun që regjistron vetë. Ndaj vetëm çfarë dëshiron.",
    open: "Eksploro",
    preview: "Parapamje",
    finalTitle: "Fillo me një makinë. Ruaj atë që do të bësh më pas.",
    finalText:
      "Shto të dhënat bazë, zgjidh synimin dhe ruaj një detyrë ose ide udhëtimi. Pjesën tjetër mund ta plotësosh më vonë.",
  },
  ja: {
    eyebrow: "CapCar — デジタルガレージ",
    headline: "理想の一台を、計画から。",
    description: "カスタムをイメージして、パーツ・予算・作業をひとつに。",
    create: "ガレージを作成",
    openGarage: "ガレージを開く",
    undo: "完了を取り消す",
    explore: "デモを試す",
    support: "今乗っている車から始めましょう。",
    account: "自由に見て回れます。愛車の保存にはアカウントが必要です。",
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
      "ガイドを探し、次の作業を計画して、作業内容と費用を記録しましょう。",
    maintainAccess:
      "ガイドは公開されています。作業と車両記録の保存にはアカウントが必要です。",
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
      "下の例を試してみましょう。自分の計画の保存にはアカウントが必要です。",
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
    storyTitle: "作業の計画から、愛車の履歴へ。",
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
    demoTitle: "サンプルのBMWで、ひとつの作業を試そう。",
    demoText:
      "パーツを比較してBMWの予算がどう変わるか試せます。参考データのみで、購入や保存は行いません。",
    demoHint: "車両パスポートを開くと、予定のパーツが記録の例に表示されます。",
    toolsEyebrow: "必要なときに、必要な道具を",
    toolsTitle: "モデル、サウンド、車両記録",
    visual: "Visualizer",
    visualText:
      "参考用のインタラクティブな車両モデルや外観アイデアを確認。コンセプトのプレビューであり、適合保証や愛車そのもののモデルではありません。",
    sound: "Sound Studio",
    soundText:
      "エンジンや排気音の録音を試聴。純正音と別の録音や自分の音源を端末内で比較できます。アカウントは不要です。",
    diagnostics: "診断",
    diagnosticsText:
      "故障コードやメモを愛車にまとめます。手動記録に対応し、OBDスキャンはプレビュー段階です。",
    passport: "車両パスポート",
    passportText:
      "車両情報と自分で記録した履歴を一か所に。選んだ情報だけを共有できます。",
    open: "詳しく見る",
    preview: "プレビュー",
    finalTitle: "まずは1台。次にやりたいことを保存しましょう。",
    finalText:
      "基本情報と目標を選び、最初のタスクやドライブのアイデアを保存。詳しい情報は後から追加できます。",
  },
};
