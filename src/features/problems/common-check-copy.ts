import type { AppLocale } from "@/i18n/config";
import type { CommonCheckId } from "./common-checks";

type CheckText = {
  title: string;
  symptom: string;
  tools: string;
  steps: [string, string, string];
  stop: string;
};
type Copy = {
  title: string;
  overview: string;
  intro: string;
  general: string;
  generalNote: string;
  steps: string;
  tools: string;
  stop: string;
  easy: string;
  observe: string;
  manual: string;
  save: string;
  saved: string;
  openPlan: string;
  saveError: string;
  planName: string;
  planDescription: string;
  modelNotes: string;
  modelNote: string;
  noModelNotes: string;
  concept: string;
  symptoms: string;
  nextCheck: string;
  applies: string;
  inspect: string;
  recall: string;
  monitor: string;
  engine: string;
  variant: string;
  checklist: string;
  openCheck: string;
  source: string;
  reviewed: string;
  missing: string;
  maintenance: string;
  parts: string;
  researchLanguage: string;
  evidence: Record<
    "inspection-data" | "technical-bulletin" | "safety-recall",
    string
  >;
  checks: Record<CommonCheckId, CheckText>;
};
export const commonCheckCopy: Record<AppLocale, Copy> = {
  en: {
    title: "Common problems & checks",
    overview: "Vehicle overview",
    intro:
      "Start with what you notice. Try a simple check, then save the next job to your car’s plan.",
    general: "Start here",
    generalNote:
      "Everyday checks for this car. These are general symptoms, not claims that this model has a known defect. Follow your car’s handbook for exact parts and procedures.",
    steps: "What you can do",
    tools: "You’ll need",
    stop: "Stop & get help",
    easy: "Easy DIY",
    observe: "Check only",
    manual: "DIY if the handbook allows",
    save: "Save check to plan",
    saved: "Saved to your plan",
    openPlan: "Open plan",
    saveError: "Couldn’t save. Check browser storage and try again.",
    planName: "My car checks",
    planDescription:
      "Checks I plan to do. No diagnosis, completed repair or cost is recorded by saving a check.",
    modelNotes: "Researched model notes",
    modelNote:
      "References matched to the recorded model, generation and year. Confirm any engine or equipment limits below.",
    noModelNotes:
      "No reviewed model-specific faults match these details yet. You can still use the everyday checks above.",
    concept:
      "This is a concept reference. Production-car checks and fault claims do not apply.",
    symptoms: "What you might notice",
    nextCheck: "Next step",
    applies: "Applies to",
    inspect: "Inspect if symptoms appear",
    recall: "Check recall · verify VIN",
    monitor: "Monitor",
    engine:
      "Confirm your engine code in the car’s documents to see engine-specific notes. Uncertain matches stay hidden.",
    variant:
      "Confirm the engine, gearbox and equipment listed in the source before using this reference.",
    checklist: "Open inspection checklist",
    openCheck: "View check steps",
    source: "Read source",
    reviewed: "Reviewed",
    missing: "Vehicle not found.",
    maintenance: "Maintenance history",
    parts: "Research parts",
    researchLanguage: "Some technical source notes are currently in English.",
    evidence: {
      "inspection-data": "Inspection research",
      "technical-bulletin": "Technical bulletin",
      "safety-recall": "Safety recall",
    },
    checks: {
      tyres: {
        title: "A tyre keeps losing pressure",
        symptom: "A tyre looks low or the pressure warning returns.",
        tools: "Pressure gauge, air pump and handbook.",
        steps: [
          "Park safely. Check cold tyres against the pressures on the car’s label or in its handbook for your load.",
          "Look for cuts, bulges or objects in the tread. Do not pull out nails or screws.",
          "If undamaged, adjust to the stated pressure and recheck later. Reset the warning only as the handbook explains.",
        ],
        stop: "Rapid loss, a bulge, exposed cords or a flat tyre: do not drive. Arrange tyre service.",
      },
      wipers: {
        title: "Wipers leave streaks",
        symptom: "Smears, skipping or poor visibility in rain.",
        tools:
          "Soft cloth, suitable glass cleaner, towel; exact-fit blades if needed.",
        steps: [
          "Clean the glass and rubber lips. Follow the handbook’s service position before lifting an arm.",
          "If rubber is split or still smears, fit the correct blade using its instructions. Protect the glass with a towel; never let a bare arm snap back.",
          "Lower the arms gently. Wet the glass and test while parked.",
        ],
        stop: "A loose arm, failed motor or poor visibility needs attention before driving in rain.",
      },
      starting: {
        title: "The car struggles to start",
        symptom: "Slow cranking, clicks or dim lights when starting.",
        tools: "Handbook and a note of when it happens.",
        steps: [
          "Park safely and switch off unnecessary electrical loads. Note whether the engine turns, clicks or stays silent.",
          "Check the handbook for the starter battery location. Look only for visible damage or leakage; do not disconnect or open it.",
          "If it repeats, book a battery and charging-system test. Keep the symptoms for the technician instead of buying a battery on a guess.",
        ],
        stop: "Smoke, heat, swelling or leakage: keep clear and call assistance. Do not touch high-voltage cables or attempt repeated starts.",
      },
      lights: {
        title: "An outside light is not working",
        symptom: "A dark lamp, rapid indicator flashing or a bulb warning.",
        tools:
          "Handbook, a helper or a safe reflection; correct bulb if owner-replaceable.",
        steps: [
          "Park securely and check the lights one by one. Use a helper or reflection to check brake lights while stationary.",
          "Identify the exact bulb in the handbook. Only replace an accessible conventional bulb if it gives an owner procedure; switch lights off and let it cool first.",
          "Follow the handbook and bulb instructions, refit the cover and test again before driving.",
        ],
        stop: "Xenon, sealed LED units, damaged wiring or repeat failures need a workshop. Do not drive with unsafe lighting.",
      },
    },
  },
  de: {
    title: "Häufige Probleme & Checks",
    overview: "Fahrzeugübersicht",
    intro:
      "Beginne mit dem, was dir auffällt. Prüfe einfache Ursachen und speichere den nächsten Schritt im Fahrzeugplan.",
    general: "Hier anfangen",
    generalNote:
      "Allgemeine Checks für dieses Auto. Sie beschreiben Symptome, keine nachgewiesenen Serienfehler. Genaue Teile und Arbeitsschritte stehen im Bordbuch.",
    steps: "Das kannst du tun",
    tools: "Das brauchst du",
    stop: "Abbrechen & Hilfe holen",
    easy: "Einfach selbst machen",
    observe: "Nur prüfen",
    manual: "Selbst machen, wenn im Bordbuch beschrieben",
    save: "Check im Plan speichern",
    saved: "In deinem Plan gespeichert",
    openPlan: "Plan öffnen",
    saveError:
      "Speichern fehlgeschlagen. Prüfe den Browserspeicher und versuche es erneut.",
    planName: "Meine Fahrzeugchecks",
    planDescription:
      "Geplante Checks. Das Speichern bestätigt keine Diagnose, Reparatur oder entstandenen Kosten.",
    modelNotes: "Recherchierte Modellhinweise",
    modelNote:
      "Quellen passend zu Modell, Generation und Baujahr. Beachte die genannten Grenzen für Motor und Ausstattung.",
    noModelNotes:
      "Zu diesen Angaben liegen noch keine geprüften modellspezifischen Fehlerhinweise vor. Die allgemeinen Checks oben kannst du trotzdem nutzen.",
    concept:
      "Dies ist eine Konzeptreferenz. Checks und Fehleraussagen für Serienautos sind nicht anwendbar.",
    symptoms: "Das könnte dir auffallen",
    nextCheck: "Nächster Schritt",
    applies: "Gilt für",
    inspect: "Bei Symptomen prüfen",
    recall: "Rückruf prüfen · FIN abgleichen",
    monitor: "Beobachten",
    engine:
      "Bestätige den Motorcode anhand der Fahrzeugunterlagen für motorspezifische Hinweise. Unsichere Zuordnungen bleiben ausgeblendet.",
    variant:
      "Gleiche Motor, Getriebe und Ausstattung mit dem Geltungsbereich der Quelle ab.",
    checklist: "Prüfcheckliste öffnen",
    openCheck: "Prüfschritte ansehen",
    source: "Quelle lesen",
    reviewed: "Geprüft",
    missing: "Fahrzeug nicht gefunden.",
    maintenance: "Wartungshistorie",
    parts: "Teile recherchieren",
    researchLanguage:
      "Einige technische Quellenhinweise sind derzeit auf Englisch.",
    evidence: {
      "inspection-data": "Prüfbericht",
      "technical-bulletin": "Technischer Hinweis",
      "safety-recall": "Sicherheitsrückruf",
    },
    checks: {
      tyres: {
        title: "Ein Reifen verliert wiederholt Luft",
        symptom: "Ein Reifen wirkt platt oder die Druckwarnung kommt zurück.",
        tools: "Druckprüfer, Luftpumpe und Bordbuch.",
        steps: [
          "Sicher parken. Den Druck bei kalten Reifen mit dem Fahrzeugaufkleber oder Bordbuch für deine Beladung vergleichen.",
          "Auf Schnitte, Beulen und Fremdkörper achten. Nägel oder Schrauben nicht herausziehen.",
          "Unbeschädigte Reifen auf den angegebenen Druck bringen und später erneut prüfen. Warnung nur nach Bordbuch zurücksetzen.",
        ],
        stop: "Schneller Druckverlust, Beulen, sichtbares Gewebe oder ein platter Reifen: nicht fahren. Reifenservice organisieren.",
      },
      wipers: {
        title: "Scheibenwischer ziehen Schlieren",
        symptom: "Schlieren, Rattern oder schlechte Sicht bei Regen.",
        tools:
          "Weiches Tuch, geeigneter Glasreiniger, Handtuch; bei Bedarf passende Wischerblätter.",
        steps: [
          "Scheibe und Gummilippen reinigen. Vor dem Anheben die Wartungsposition laut Bordbuch beachten.",
          "Rissige oder weiter schmierende Blätter nach Anleitung durch passende ersetzen. Scheibe mit einem Handtuch schützen; den nackten Arm nie zurückschnellen lassen.",
          "Arme vorsichtig ablegen. Scheibe befeuchten und im Stand testen.",
        ],
        stop: "Lockerer Arm, defekter Motor oder schlechte Sicht müssen vor einer Regenfahrt behoben werden.",
      },
      starting: {
        title: "Das Auto startet schlecht",
        symptom:
          "Langsames Drehen, Klicken oder dunkler werdende Lampen beim Start.",
        tools: "Bordbuch und eine Notiz, wann es passiert.",
        steps: [
          "Sicher parken, unnötige Stromverbraucher ausschalten. Notieren, ob der Motor dreht, klickt oder still bleibt.",
          "Position der Starterbatterie im Bordbuch nachsehen. Nur auf sichtbare Schäden oder Flüssigkeitsaustritt achten; nicht abklemmen oder öffnen.",
          "Bei Wiederholung Batterie und Ladesystem prüfen lassen. Symptome mitbringen, statt auf Verdacht eine Batterie zu kaufen.",
        ],
        stop: "Bei Rauch, Hitze, Aufblähung oder Leck Abstand halten und Pannenhilfe rufen. Keine Hochvoltkabel berühren oder wiederholt starten.",
      },
      lights: {
        title: "Eine Außenleuchte funktioniert nicht",
        symptom: "Dunkle Lampe, schnelles Blinken oder Lampenwarnung.",
        tools:
          "Bordbuch, Helfer oder sichere Spiegelung; passende Lampe, falls selbst wechselbar.",
        steps: [
          "Sicher parken und die Leuchten einzeln prüfen. Bremslichter im Stand mit Helfer oder Spiegelung kontrollieren.",
          "Lampentyp im Bordbuch prüfen. Nur zugängliche herkömmliche Lampen nach einer Anleitung für Halter wechseln; Licht ausschalten und abkühlen lassen.",
          "Bordbuch und Lampenanleitung befolgen, Abdeckung schließen und vor der Fahrt erneut testen.",
        ],
        stop: "Xenon, geschlossene LED-Einheiten, beschädigte Kabel oder wiederholte Ausfälle gehören in die Werkstatt. Nicht mit unsicherer Beleuchtung fahren.",
      },
    },
  },
  el: {
    title: "Συχνά προβλήματα & έλεγχοι",
    overview: "Επισκόπηση οχήματος",
    intro:
      "Ξεκίνα από αυτό που παρατηρείς. Κάνε έναν απλό έλεγχο και αποθήκευσε το επόμενο βήμα στο πλάνο του αυτοκινήτου.",
    general: "Ξεκίνα εδώ",
    generalNote:
      "Γενικοί έλεγχοι για αυτό το αυτοκίνητο. Τα συμπτώματα δεν αποδεικνύουν γνωστό ελάττωμα του μοντέλου. Για ακριβή ανταλλακτικά και διαδικασίες ακολούθησε το εγχειρίδιο.",
    steps: "Τι μπορείς να κάνεις",
    tools: "Θα χρειαστείς",
    stop: "Σταμάτα & ζήτησε βοήθεια",
    easy: "Εύκολο DIY",
    observe: "Μόνο έλεγχος",
    manual: "DIY αν το επιτρέπει το εγχειρίδιο",
    save: "Αποθήκευση στο πλάνο",
    saved: "Αποθηκεύτηκε στο πλάνο σου",
    openPlan: "Άνοιγμα πλάνου",
    saveError:
      "Η αποθήκευση απέτυχε. Έλεγξε τον χώρο του προγράμματος περιήγησης και ξαναπροσπάθησε.",
    planName: "Οι έλεγχοι του αυτοκινήτου μου",
    planDescription:
      "Προγραμματισμένοι έλεγχοι. Η αποθήκευση δεν καταγράφει διάγνωση, ολοκληρωμένη επισκευή ή κόστος.",
    modelNotes: "Τεκμηριωμένες σημειώσεις μοντέλου",
    modelNote:
      "Πηγές για το καταγεγραμμένο μοντέλο, τη γενιά και το έτος. Επιβεβαίωσε τους περιορισμούς κινητήρα και εξοπλισμού.",
    noModelNotes:
      "Δεν υπάρχουν ακόμη ελεγμένες σημειώσεις βλαβών για αυτά τα στοιχεία. Μπορείς να χρησιμοποιήσεις τους γενικούς ελέγχους παραπάνω.",
    concept:
      "Αυτή είναι αναφορά πρωτοτύπου. Οι έλεγχοι και οι βλάβες αυτοκινήτων παραγωγής δεν ισχύουν.",
    symptoms: "Τι μπορεί να παρατηρήσεις",
    nextCheck: "Επόμενο βήμα",
    applies: "Ισχύει για",
    inspect: "Έλεγχος αν εμφανιστούν συμπτώματα",
    recall: "Έλεγχος ανάκλησης · επιβεβαίωση VIN",
    monitor: "Παρακολούθηση",
    engine:
      "Επιβεβαίωσε τον κωδικό κινητήρα από τα έγγραφα για ειδικές σημειώσεις. Οι αβέβαιες αντιστοιχίσεις παραμένουν κρυφές.",
    variant: "Επιβεβαίωσε κινητήρα, κιβώτιο και εξοπλισμό σύμφωνα με την πηγή.",
    checklist: "Άνοιγμα λίστας ελέγχου",
    openCheck: "Δες τα βήματα ελέγχου",
    source: "Ανάγνωση πηγής",
    reviewed: "Ελέγχθηκε",
    missing: "Το όχημα δεν βρέθηκε.",
    maintenance: "Ιστορικό συντήρησης",
    parts: "Έρευνα ανταλλακτικών",
    researchLanguage:
      "Ορισμένες τεχνικές σημειώσεις είναι προς το παρόν στα αγγλικά.",
    evidence: {
      "inspection-data": "Έρευνα επιθεώρησης",
      "technical-bulletin": "Τεχνικό δελτίο",
      "safety-recall": "Ανάκληση ασφαλείας",
    },
    checks: {
      tyres: {
        title: "Ένα ελαστικό χάνει πίεση",
        symptom:
          "Το ελαστικό φαίνεται ξεφούσκωτο ή η προειδοποίηση επανέρχεται.",
        tools: "Μανόμετρο, τρόμπα και εγχειρίδιο.",
        steps: [
          "Πάρκαρε με ασφάλεια. Σύγκρινε την πίεση κρύων ελαστικών με την ετικέτα ή το εγχειρίδιο για το φορτίο σου.",
          "Κοίτα για κοψίματα, εξογκώματα ή αντικείμενα στο πέλμα. Μην αφαιρείς καρφιά ή βίδες.",
          "Αν δεν υπάρχει ζημιά, ρύθμισε την προβλεπόμενη πίεση και ξαναέλεγξε αργότερα. Επαναφορά προειδοποίησης μόνο όπως ορίζει το εγχειρίδιο.",
        ],
        stop: "Γρήγορη απώλεια, εξόγκωμα, ορατά λινά ή τελείως ξεφούσκωτο ελαστικό: μην οδηγήσεις. Ζήτησε τεχνική βοήθεια.",
      },
      wipers: {
        title: "Οι υαλοκαθαριστήρες αφήνουν γραμμές",
        symptom: "Θολούρα, τρέμουλο ή κακή ορατότητα στη βροχή.",
        tools:
          "Μαλακό πανί, κατάλληλο καθαριστικό τζαμιών, πετσέτα και σωστά μάκτρα αν χρειάζονται.",
        steps: [
          "Καθάρισε τζάμι και λαστιχένια άκρα. Ακολούθησε τη θέση συντήρησης του εγχειριδίου πριν σηκώσεις βραχίονα.",
          "Αν το λάστιχο σκίστηκε ή συνεχίζει να λερώνει, βάλε σωστό μάκτρο σύμφωνα με τις οδηγίες. Προστάτεψε το τζάμι με πετσέτα· μην αφήσεις γυμνό βραχίονα να πέσει.",
          "Κατέβασε απαλά τους βραχίονες. Βρέξε το τζάμι και δοκίμασε σταματημένος.",
        ],
        stop: "Χαλαρός βραχίονας, βλάβη μοτέρ ή κακή ορατότητα χρειάζονται επισκευή πριν οδηγήσεις στη βροχή.",
      },
      starting: {
        title: "Το αυτοκίνητο δυσκολεύεται να ξεκινήσει",
        symptom: "Αργή μίζα, κλικ ή χαμήλωμα φωτισμού κατά την εκκίνηση.",
        tools: "Εγχειρίδιο και σημείωση για το πότε συμβαίνει.",
        steps: [
          "Πάρκαρε με ασφάλεια και κλείσε περιττές ηλεκτρικές συσκευές. Σημείωσε αν η μίζα γυρίζει, κάνει κλικ ή δεν ακούγεται.",
          "Βρες τη θέση της μπαταρίας εκκίνησης στο εγχειρίδιο. Κοίτα μόνο για εμφανή ζημιά ή διαρροή· μην την αποσυνδέσεις ή ανοίξεις.",
          "Αν επαναληφθεί, κλείσε έλεγχο μπαταρίας και φόρτισης. Δώσε τα συμπτώματα στον τεχνικό αντί να αγοράσεις μπαταρία στα τυφλά.",
        ],
        stop: "Καπνός, ζέστη, φούσκωμα ή διαρροή: κράτα απόσταση και κάλεσε βοήθεια. Μην αγγίζεις καλώδια υψηλής τάσης και μην επιμένεις σε εκκινήσεις.",
      },
      lights: {
        title: "Ένα εξωτερικό φως δεν λειτουργεί",
        symptom: "Σβηστό φως, γρήγορο φλας ή ένδειξη καμένης λάμπας.",
        tools:
          "Εγχειρίδιο, βοηθός ή ασφαλής αντανάκλαση· σωστή λάμπα αν αλλάζεται από τον ιδιοκτήτη.",
        steps: [
          "Ασφάλισε το παρκαρισμένο αυτοκίνητο και έλεγξε τα φώτα ένα ένα. Έλεγξε τα στοπ με βοηθό ή αντανάκλαση, χωρίς κίνηση.",
          "Βρες τον ακριβή τύπο στο εγχειρίδιο. Άλλαξε μόνο προσβάσιμη συμβατική λάμπα αν υπάρχει διαδικασία για ιδιοκτήτες· σβήσε τα φώτα και άφησέ τη να κρυώσει.",
          "Ακολούθησε τις οδηγίες αυτοκινήτου και λάμπας, κλείσε το κάλυμμα και ξαναδοκίμασε πριν οδηγήσεις.",
        ],
        stop: "Xenon, κλειστές μονάδες LED, χαλασμένη καλωδίωση ή επαναλαμβανόμενες βλάβες χρειάζονται συνεργείο. Μην οδηγείς με μη ασφαλή φωτισμό.",
      },
    },
  },
  sq: {
    title: "Probleme të zakonshme & kontrolle",
    overview: "Përmbledhja e makinës",
    intro:
      "Nis nga ajo që vëren. Bëj një kontroll të thjeshtë dhe ruaj punën e radhës në planin e makinës.",
    general: "Fillo këtu",
    generalNote:
      "Kontrolle të përgjithshme për këtë makinë. Simptomat nuk dëshmojnë defekt të njohur të modelit. Për pjesët dhe procedurat e sakta ndiq manualin.",
    steps: "Çfarë mund të bësh",
    tools: "Të duhen",
    stop: "Ndalo & kërko ndihmë",
    easy: "E thjeshtë për ta bërë vetë",
    observe: "Vetëm kontroll",
    manual: "Vetë, nëse e lejon manuali",
    save: "Ruaj kontrollin në plan",
    saved: "U ruajt në planin tënd",
    openPlan: "Hap planin",
    saveError:
      "Ruajtja dështoi. Kontrollo hapësirën e shfletuesit dhe provo sërish.",
    planName: "Kontrollet e makinës sime",
    planDescription:
      "Kontrolle të planifikuara. Ruajtja nuk regjistron diagnozë, riparim të përfunduar apo shpenzim.",
    modelNotes: "Shënime të hulumtuara për modelin",
    modelNote:
      "Burime për modelin, gjeneratën dhe vitin e regjistruar. Konfirmo kufizimet për motorin dhe pajisjet.",
    noModelNotes:
      "Nuk ka ende shënime të verifikuara për defekte që përputhen me këto të dhëna. Mund të përdorësh kontrollet e përgjithshme më sipër.",
    concept:
      "Kjo është referencë koncepti. Kontrollet dhe defektet e makinave të prodhimit nuk zbatohen.",
    symptoms: "Çfarë mund të vëresh",
    nextCheck: "Hapi i radhës",
    applies: "Vlen për",
    inspect: "Kontrollo nëse shfaqen simptoma",
    recall: "Kontrollo tërheqjen · verifiko VIN",
    monitor: "Vëzhgo",
    engine:
      "Konfirmo kodin e motorit në dokumente për shënime specifike. Përputhjet e pasigurta mbeten të fshehura.",
    variant: "Konfirmo motorin, kambion dhe pajisjet sipas fushës së burimit.",
    checklist: "Hap listën e kontrollit",
    openCheck: "Shiko hapat e kontrollit",
    source: "Lexo burimin",
    reviewed: "Shqyrtuar",
    missing: "Makina nuk u gjet.",
    maintenance: "Historiku i mirëmbajtjes",
    parts: "Kërko pjesë",
    researchLanguage: "Disa shënime teknike janë aktualisht në anglisht.",
    evidence: {
      "inspection-data": "Hulumtim inspektimi",
      "technical-bulletin": "Buletin teknik",
      "safety-recall": "Tërheqje sigurie",
    },
    checks: {
      tyres: {
        title: "Një gomë humbet vazhdimisht presion",
        symptom: "Goma duket e shfryrë ose paralajmërimi rikthehet.",
        tools: "Matës presioni, pompë ajri dhe manual.",
        steps: [
          "Parko në vend të sigurt. Krahaso presionin e gomave të ftohta me etiketën ose manualin për ngarkesën tënde.",
          "Shiko për prerje, fryrje ose objekte në shkelës. Mos nxirr gozhda apo vida.",
          "Nëse nuk ka dëmtime, rregullo presionin sipas udhëzimit dhe kontrollo sërish më vonë. Rivendos paralajmërimin vetëm sipas manualit.",
        ],
        stop: "Humbje e shpejtë, fryrje, fije të dukshme apo gomë e shfryrë: mos drejto. Kërko shërbim gomash.",
      },
      wipers: {
        title: "Fshirëset lënë vija",
        symptom: "Njolla, kërcime ose shikim i dobët në shi.",
        tools:
          "Leckë e butë, pastrues xhamash i përshtatshëm, peshqir; fshirëse të sakta nëse duhen.",
        steps: [
          "Pastro xhamin dhe buzët e gomës. Ndiq pozicionin e shërbimit në manual para se të ngresh krahun.",
          "Nëse goma është çarë ose ende lë njolla, vendos fshirësen e saktë sipas udhëzimeve. Mbro xhamin me peshqir; mos e lër krahun pa fshirëse të godasë xhamin.",
          "Uli krahët me kujdes. Lage xhamin dhe provo kur makina është e parkuar.",
        ],
        stop: "Krah i liruar, motor i prishur ose shikim i dobët kërkon ndërhyrje para drejtimit në shi.",
      },
      starting: {
        title: "Makina ndizet me vështirësi",
        symptom:
          "Rrotullim i ngadaltë, klikime ose drita që zbehen gjatë ndezjes.",
        tools: "Manuali dhe shënime kur ndodh.",
        steps: [
          "Parko sigurt dhe fik konsumatorët elektrikë të panevojshëm. Shëno nëse motori rrotullohet, klikon ose hesht.",
          "Gjej baterinë e ndezjes në manual. Vetëm shiko për dëmtime ose rrjedhje të dukshme; mos e shkëput apo hap.",
          "Nëse përsëritet, cakto test të baterisë dhe sistemit të karikimit. Jepja simptomat teknikut në vend që të blesh bateri me hamendje.",
        ],
        stop: "Tym, nxehtësi, fryrje ose rrjedhje: qëndro larg dhe thirr ndihmën. Mos prek kabllot e tensionit të lartë dhe mos provo ndezje të përsëritura.",
      },
      lights: {
        title: "Një dritë e jashtme nuk punon",
        symptom:
          "Llambë e fikur, sinjalizues i shpejtë ose paralajmërim llambe.",
        tools:
          "Manuali, ndihmës ose pasqyrim i sigurt; llamba e saktë nëse lejohet ndërrimi vetë.",
        steps: [
          "Siguro makinën e parkuar dhe kontrollo dritat një nga një. Kontrollo dritat e frenave me ndihmës ose pasqyrim, pa lëvizur.",
          "Gjej llojin e saktë në manual. Ndërro vetëm llambë të zakonshme të arritshme nëse ka procedurë për pronarin; fik dritat dhe lëre të ftohet.",
          "Ndiq manualin dhe udhëzimet e llambës, mbyll kapakun dhe provo sërish para nisjes.",
        ],
        stop: "Xenon, njësi LED të mbyllura, kabllo të dëmtuara ose defekte të përsëritura kërkojnë servis. Mos drejto me ndriçim të pasigurt.",
      },
    },
  },
  ja: {
    title: "よくある症状と点検",
    overview: "車両の概要",
    intro:
      "気になる症状から簡単な点検を始めましょう。次の作業は車両のプランに保存できます。",
    general: "まずはここから",
    generalNote:
      "この車で確認できる一般的な症状です。車種固有の欠陥を示すものではありません。適合部品と正確な手順は取扱説明書で確認してください。",
    steps: "自分でできること",
    tools: "必要なもの",
    stop: "作業を止めて相談",
    easy: "簡単なDIY",
    observe: "確認のみ",
    manual: "取扱説明書で認められる場合のみDIY",
    save: "点検をプランに保存",
    saved: "プランに保存済み",
    openPlan: "プランを開く",
    saveError:
      "保存できませんでした。ブラウザーの保存領域を確認して再試行してください。",
    planName: "愛車の点検プラン",
    planDescription:
      "これから行う点検です。保存しても診断、修理完了、支出は記録されません。",
    modelNotes: "調査済みの車種別情報",
    modelNote:
      "登録されたモデル、世代、年式に合う資料です。エンジンや装備の対象範囲も確認してください。",
    noModelNotes:
      "この条件に合う車種別の不具合情報はまだ確認されていません。上の一般的な点検は利用できます。",
    concept:
      "これはコンセプトカーの参考資料です。量産車の点検や不具合情報は適用されません。",
    symptoms: "気づく可能性のある症状",
    nextCheck: "次の手順",
    applies: "対象",
    inspect: "症状がある場合に点検",
    recall: "リコール確認・VIN照合",
    monitor: "経過を確認",
    engine:
      "エンジン固有の情報を見るには車両書類でエンジンコードを確認してください。不確かな一致は表示しません。",
    variant: "資料の対象エンジン、変速機、装備を確認してから使用してください。",
    checklist: "点検チェックリストを開く",
    openCheck: "点検手順を見る",
    source: "出典を読む",
    reviewed: "確認日",
    missing: "車両が見つかりません。",
    maintenance: "整備履歴",
    parts: "部品を調べる",
    researchLanguage: "一部の技術情報は現在英語で提供されています。",
    evidence: {
      "inspection-data": "点検調査",
      "technical-bulletin": "技術情報",
      "safety-recall": "安全リコール",
    },
    checks: {
      tyres: {
        title: "タイヤの空気圧が繰り返し下がる",
        symptom: "タイヤがつぶれて見える、または空気圧警告が再び出る。",
        tools: "空気圧計、空気入れ、取扱説明書。",
        steps: [
          "安全に駐車します。タイヤが冷えた状態で、積載量に対応した車両ラベルや説明書の指定空気圧と比較します。",
          "切れ、膨らみ、溝の異物を目で確認します。釘やねじは抜かないでください。",
          "損傷がなければ指定圧に調整し、後で再確認します。警告のリセットは説明書の手順に従います。",
        ],
        stop: "急な空気漏れ、膨らみ、コードの露出、パンクがある場合は走行せず、タイヤの専門業者に依頼してください。",
      },
      wipers: {
        title: "ワイパーに拭き残しがある",
        symptom: "すじ、びびり、雨の日の見えにくさ。",
        tools:
          "柔らかい布、適切なガラスクリーナー、タオル。必要に応じて適合ブレード。",
        steps: [
          "ガラスとゴムの縁を清掃します。アームを上げる前に説明書の整備位置の手順を確認します。",
          "ゴムが裂けている、または拭き残しが続く場合は適合ブレードを説明書どおりに交換します。タオルでガラスを保護し、ブレードのないアームを跳ね戻さないでください。",
          "アームを静かに戻し、ガラスをぬらして駐車中に動作確認します。",
        ],
        stop: "アームの緩み、モーター故障、視界不良がある場合は雨の中を走行する前に修理してください。",
      },
      starting: {
        title: "車が始動しにくい",
        symptom: "セルの回転が遅い、クリック音、始動時にライトが暗くなる。",
        tools: "取扱説明書と症状が出た状況のメモ。",
        steps: [
          "安全に駐車し、不要な電装品を切ります。エンジンが回る、クリック音がする、無音のどれかを記録します。",
          "説明書で始動用バッテリーの位置を確認します。目に見える損傷や液漏れの確認だけにとどめ、端子を外したり開けたりしないでください。",
          "繰り返す場合はバッテリーと充電系統の点検を依頼します。推測でバッテリーを購入せず、症状を整備士に伝えます。",
        ],
        stop: "煙、発熱、膨張、液漏れがある場合は近づかず救援を呼んでください。高電圧ケーブルに触れたり始動を繰り返したりしないでください。",
      },
      lights: {
        title: "外側のライトが点灯しない",
        symptom: "不点灯、方向指示器の速い点滅、球切れ警告。",
        tools:
          "取扱説明書、補助する人または安全な反射面。自分で交換可能な場合は適合電球。",
        steps: [
          "確実に駐車して各ライトを確認します。ブレーキランプは停車したまま補助者や反射で確認します。",
          "説明書で電球の型式を確認します。所有者向け交換手順がある、手の届く従来型電球だけを対象とし、消灯して冷ましてから作業します。",
          "車両と電球の説明書に従い、カバーを戻して走行前に再確認します。",
        ],
        stop: "キセノン、密閉型LED、配線損傷、繰り返す故障は整備工場に相談してください。安全な照明が確保できない状態で走行しないでください。",
      },
    },
  },
};
