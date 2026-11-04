import type { AppLocale } from "@/i18n/config";
import type { ModelProblemTopic } from "./model-problem-profiles";

type TopicCopy = { title: string; notice: string; check: string; help: string };
type Copy = {
  intro: string;
  scope: string;
  petrol: string;
  diesel: string;
  mixed: string;
  electric: string;
  candidate: string;
  noPattern: string;
  registrationYears: string;
  yearHint: string;
  notice: string;
  check: string;
  help: string;
  guidance: string;
  topics: Record<ModelProblemTopic, TopicCopy>;
};
export const modelProblemCopy: Record<AppLocale, Copy> = {
  en: {
    intro:
      "Worth checking on this generation, according to the linked ADAC used-car report.",
    scope: "Report covers",
    petrol: "Petrol versions",
    diesel: "Diesel versions",
    mixed: "Petrol and diesel versions",
    electric: "Electric versions",
    candidate:
      "Confirm your fuel type and version. A model-level pattern does not mean your car has this fault.",
    noPattern:
      "No recurring fault note is available here for this year within the reviewed report. Continue with the everyday checks; this is not an all-clear.",
    registrationYears: "Source registration years",
    yearHint:
      "Production and first-registration years can differ. Confirm the year before applying this note.",
    notice: "What you might notice",
    check: "Check yourself",
    help: "When to get help",
    guidance:
      "CapCar’s first checks help you record symptoms. They are not a repair procedure or a diagnosis.",
    topics: {
      oil: {
        title: "Oil leaks",
        notice: "Fresh oily marks under the car or a falling oil level.",
        check:
          "On level ground, check the oil as your handbook describes. Photograph visible traces and note mileage and top-ups. Stay clear of hot parts.",
        help: "Ask a workshop to locate the leak before buying seals. Stop the engine for a red oil-pressure warning; topping up is not a diagnosis.",
      },
      brakes: {
        title: "Brake wear or poor braking",
        notice:
          "Grinding, vibration, a warning light or a change in pedal feel.",
        check:
          "Read the last inspection report and note when the symptom happens. With the car parked, look through the wheel for obvious disc damage; do not dismantle the brakes.",
        help: "Reduced braking, a sinking pedal or a red brake warning: stop safely and arrange assistance. A technician must measure wear and check brake performance.",
      },
      springs: {
        title: "Suspension spring damage",
        notice: "One corner sits lower, or a new knock appears over bumps.",
        check:
          "Park on flat ground and compare ride height from outside. Photograph any visible broken spring end without reaching into the suspension or lifting the car.",
        help: "A broken spring can damage a tyre. If a spring is displaced, a tyre rubs or handling changes, stop driving and arrange inspection.",
      },
      joints: {
        title: "Suspension joint wear",
        notice:
          "Knocking, uneven tyre wear or a loose feeling from the chassis.",
        check:
          "Note which corner makes noise and photograph tyre wear. Do not crawl under a car supported only by a jack or loosen suspension parts.",
        help: "A workshop should check joint play and alignment. Stop driving if a wheel looks displaced or the car becomes unstable.",
      },
      steering: {
        title: "Steering joint wear",
        notice:
          "New steering play, knocking or difficulty holding a straight line.",
        check:
          "Record the symptom and any recent impact with a kerb. Look for uneven tyre wear from outside; do not adjust steering joints yourself.",
        help: "Changed steering control or heavy steering needs prompt professional assessment. If control is impaired, arrange recovery rather than a test drive.",
      },
      exhaust: {
        title: "Exhaust system deterioration",
        notice: "New rattling, louder exhaust noise or visible corrosion.",
        check:
          "With the engine off and exhaust cold, look from outside for a loose tailpipe or visible rust. Do not run the engine in an enclosed space.",
        help: "Exhaust fumes in the cabin or a hanging pipe need immediate attention. A workshop can check leaks and mounts; surface rust alone does not prove failure.",
      },
      lights: {
        title: "Lighting faults",
        notice:
          "A failed lamp, flickering, a warning or poorly aimed headlights.",
        check:
          "Park safely and check lights and indicators with a helper or a reflection. Clean the lenses. Replace a bulb only if the handbook gives an owner procedure.",
        help: "Have headlight aim measured. Sealed LED, xenon or repeated electrical faults need a technician; avoid driving when required lighting is unavailable.",
      },
      battery: {
        title: "Low-voltage battery trouble",
        notice:
          "Slow cranking, repeated no-starts or a failure to enter READY.",
        check:
          "Note warnings, battery age and how long the car stood. Follow the handbook for assistance; do not improvise jump-start connections or touch orange high-voltage cables.",
        help: "Ask for a battery and charging-system test before replacement. A starting problem does not prove the hybrid traction battery has failed.",
      },
      parkingBrake: {
        title: "Parking brake does not hold properly",
        notice: "The brake no longer holds as expected or shows a warning.",
        check:
          "Note the warning and the conditions of an already observed problem. Do not deliberately test it on a slope or adjust cables yourself.",
        help: "Keep the car secured using the handbook’s parking procedure and arrange a brake inspection. If you cannot secure it, request assistance.",
      },
      brakeHoses: {
        title: "Ageing brake hoses",
        notice:
          "Cracks seen during an inspection, fluid traces or changed pedal feel.",
        check:
          "Review previous inspection notes. Photograph only what is visible from a safe position; do not flex, disconnect or pressure-test brake hoses yourself.",
        help: "A workshop must inspect and replace damaged hoses. Fluid leakage or reduced braking means stop safely and arrange recovery.",
      },
      starter: {
        title: "Starter trouble",
        notice: "A click or no cranking when you try to start.",
        check:
          "Record the message and whether dashboard lights dim. Check the handbook’s starting procedure; do not bridge starter terminals or keep trying repeatedly.",
        help: "Have the battery, connections and starter tested. A no-start alone does not justify replacing the starter.",
      },
      injection: {
        title: "Fuel-injection trouble",
        notice: "Uneven running, difficult starting or an engine warning.",
        check:
          "Save the exact warning and any existing fault-code report. Note whether the engine was cold or warm. Do not open fuel lines or order injectors from symptoms alone.",
        help: "A workshop must diagnose the fuel system. Stop safely for fuel smell or a flashing engine warning; do not drive to reproduce the fault.",
      },
      tpms: {
        title: "Tyre-pressure monitoring fault",
        notice:
          "A pressure-system warning persists after correct tyre pressures are confirmed.",
        check:
          "Measure all tyres cold with a gauge, using the vehicle’s pressure label. Inspect for damage. Reset the system only as described in the handbook after correcting pressure.",
        help: "Repeated pressure loss needs a tyre inspection; a persistent system fault needs diagnosis. Never reset a warning to hide a possible puncture.",
      },
    },
  },
  de: {
    intro:
      "Darauf lohnt sich bei dieser Generation ein Blick – laut verlinktem ADAC-Gebrauchtwagenbericht.",
    scope: "Bericht gilt für",
    petrol: "Benziner",
    diesel: "Diesel",
    mixed: "Benziner und Diesel",
    electric: "Elektrofahrzeuge",
    candidate:
      "Kraftstoffart und Variante bestätigen. Ein Modelltrend ist kein bestätigter Defekt an deinem Auto.",
    noPattern:
      "Für dieses Jahr liegt hier kein Hinweis auf einen wiederkehrenden Defekt aus dem geprüften Bericht vor. Nutze die allgemeinen Checks; das ist keine Entwarnung.",
    registrationYears: "Erstzulassungsjahre der Quelle",
    yearHint:
      "Baujahr und Erstzulassung können abweichen. Prüfe das Jahr, bevor du diesen Hinweis anwendest.",
    notice: "Was du bemerkst",
    check: "Selbst prüfen",
    help: "Wann du Hilfe brauchst",
    guidance:
      "Die ersten CapCar-Checks helfen beim Festhalten von Symptomen. Sie sind keine Reparaturanleitung oder Diagnose.",
    topics: {
      oil: {
        title: "Ölverlust",
        notice: "Frische ölige Flecken unter dem Auto oder sinkender Ölstand.",
        check:
          "Prüfe den Ölstand auf ebener Fläche nach Handbuch. Fotografiere sichtbare Spuren und notiere Kilometerstand und Nachfüllmengen. Halte Abstand zu heißen Teilen.",
        help: "Lass die Leckstelle vor dem Teilekauf bestimmen. Bei roter Öldruckwarnung Motor abstellen; Nachfüllen ersetzt keine Diagnose.",
      },
      brakes: {
        title: "Bremsverschleiß oder schwache Bremswirkung",
        notice:
          "Schleifen, Vibrationen, Warnleuchten oder ein verändertes Pedalgefühl.",
        check:
          "Lies den letzten Prüfbericht und notiere, wann das Symptom auftritt. Schaue beim geparkten Auto durch die Felge nach sichtbaren Scheibenschäden; zerlege die Bremse nicht.",
        help: "Bei schwacher Bremswirkung, absinkendem Pedal oder roter Bremswarnung sicher anhalten und Hilfe holen. Verschleiß und Bremsleistung müssen fachgerecht gemessen werden.",
      },
      springs: {
        title: "Beschädigte Fahrwerksfedern",
        notice: "Eine Ecke steht tiefer oder es klopft neu auf Unebenheiten.",
        check:
          "Vergleiche die Fahrzeughöhe auf ebener Fläche von außen. Fotografiere sichtbare abgebrochene Federenden, ohne ins Fahrwerk zu greifen oder das Auto anzuheben.",
        help: "Eine gebrochene Feder kann den Reifen beschädigen. Bei verrutschter Feder, schleifendem Reifen oder verändertem Fahrverhalten nicht weiterfahren und prüfen lassen.",
      },
      joints: {
        title: "Verschlissene Fahrwerksgelenke",
        notice:
          "Klopfen, ungleichmäßiger Reifenabrieb oder ein loses Fahrgefühl.",
        check:
          "Notiere die betroffene Ecke und fotografiere den Reifenabrieb. Krieche nie unter ein nur vom Wagenheber gehaltenes Auto und löse keine Fahrwerksteile.",
        help: "Eine Werkstatt sollte Gelenkspiel und Achsgeometrie prüfen. Bei versetztem Rad oder instabilem Fahrverhalten nicht weiterfahren.",
      },
      steering: {
        title: "Verschlissene Lenkgelenke",
        notice:
          "Neues Lenkspiel, Klopfen oder Schwierigkeiten beim Geradeausfahren.",
        check:
          "Notiere das Symptom und einen möglichen Bordsteinkontakt. Prüfe den Reifenabrieb von außen; stelle Lenkgelenke nicht selbst ein.",
        help: "Veränderte Lenkbarkeit oder schwergängige Lenkung zeitnah prüfen lassen. Bei eingeschränkter Kontrolle Abschlepphilfe statt Probefahrt.",
      },
      exhaust: {
        title: "Verschleiß an der Abgasanlage",
        notice: "Neues Rasseln, lautere Abgasgeräusche oder sichtbarer Rost.",
        check:
          "Schaue bei ausgeschaltetem Motor und kaltem Auspuff von außen nach einem losen Endrohr oder Rost. Lass den Motor nicht in geschlossenen Räumen laufen.",
        help: "Abgase im Innenraum oder ein herabhängendes Rohr erfordern sofortige Hilfe. Die Werkstatt prüft Dichtheit und Halter; Oberflächenrost allein beweist keinen Defekt.",
      },
      lights: {
        title: "Beleuchtungsprobleme",
        notice:
          "Eine Lampe fällt aus, flackert, meldet einen Fehler oder leuchtet falsch.",
        check:
          "Prüfe Licht und Blinker im sicher geparkten Auto mit einer Hilfsperson oder Spiegelung. Reinige die Leuchten. Tausche Leuchtmittel nur nach einer Handbuchanleitung für Halter.",
        help: "Lass die Scheinwerfereinstellung messen. Geschlossene LED-, Xenon- oder wiederkehrende Elektrikfehler gehören in die Werkstatt; fahre nicht ohne benötigte Beleuchtung.",
      },
      battery: {
        title: "Probleme mit der Bordnetzbatterie",
        notice:
          "Langsames Starten, wiederholte Startausfälle oder kein READY-Zustand.",
        check:
          "Notiere Warnungen, Batteriealter und Standzeit. Folge dem Handbuch bei Starthilfe; improvisiere keine Anschlüsse und berühre keine orangefarbenen Hochvoltkabel.",
        help: "Lass Batterie und Ladesystem vor einem Tausch testen. Ein Startproblem beweist keinen Defekt am Hybrid-Antriebsakku.",
      },
      parkingBrake: {
        title: "Feststellbremse hält nicht richtig",
        notice: "Die Bremse hält nicht wie gewohnt oder zeigt eine Warnung.",
        check:
          "Notiere Warnung und Umstände eines bereits beobachteten Problems. Teste nicht absichtlich am Hang und stelle keine Seilzüge selbst nach.",
        help: "Sichere das Auto nach der Parkanleitung im Handbuch und lass die Bremse prüfen. Kannst du es nicht sicher abstellen, hole Hilfe.",
      },
      brakeHoses: {
        title: "Gealterte Bremsschläuche",
        notice:
          "Risse im Prüfbericht, Flüssigkeitsspuren oder verändertes Pedalgefühl.",
        check:
          "Prüfe frühere Inspektionsberichte. Fotografiere nur sicher sichtbare Stellen; biege, löse oder teste Bremsschläuche nicht selbst unter Druck.",
        help: "Beschädigte Schläuche muss eine Werkstatt prüfen und ersetzen. Bei Flüssigkeitsverlust oder schwacher Bremswirkung sicher anhalten und abschleppen lassen.",
      },
      starter: {
        title: "Anlasserprobleme",
        notice: "Beim Startversuch klickt es nur oder der Motor dreht nicht.",
        check:
          "Notiere die Meldung und ob Anzeigen dunkler werden. Prüfe den Startablauf im Handbuch; überbrücke keine Anlasserklemmen und versuche es nicht ständig erneut.",
        help: "Lass Batterie, Anschlüsse und Anlasser testen. Ein Startausfall allein rechtfertigt keinen Anlassertausch.",
      },
      injection: {
        title: "Probleme mit der Einspritzung",
        notice: "Unruhiger Motorlauf, schwieriger Start oder Motorwarnung.",
        check:
          "Sichere die genaue Warnung und vorhandene Fehlercodeberichte. Notiere, ob der Motor kalt oder warm war. Öffne keine Kraftstoffleitungen und kaufe keine Injektoren auf Verdacht.",
        help: "Die Werkstatt muss das Kraftstoffsystem diagnostizieren. Bei Kraftstoffgeruch oder blinkender Motorwarnung sicher anhalten; den Fehler nicht durch Weiterfahren provozieren.",
      },
      tpms: {
        title: "Fehler der Reifendrucküberwachung",
        notice:
          "Die Systemwarnung bleibt trotz bestätigtem korrektem Reifendruck bestehen.",
        check:
          "Miss alle Reifen kalt mit einem Messgerät nach dem Druckschild am Auto. Suche nach Schäden. Setze das System erst nach Druckkorrektur gemäß Handbuch zurück.",
        help: "Wiederholter Druckverlust erfordert eine Reifenprüfung, eine bleibende Systemwarnung eine Diagnose. Setze nie eine Warnung zurück, um einen möglichen Platten zu verdecken.",
      },
    },
  },
  sq: {
    intro:
      "Pika që ia vlen të kontrollohen në këtë gjeneratë, sipas raportit të lidhur të ADAC.",
    scope: "Raporti mbulon",
    petrol: "Versionet me benzinë",
    diesel: "Versionet me naftë",
    mixed: "Versionet me benzinë dhe naftë",
    electric: "Versionet elektrike",
    candidate:
      "Konfirmo karburantin dhe variantin. Një prirje e modelit nuk është defekt i konfirmuar te makina jote.",
    noPattern:
      "Për këtë vit nuk kemi këtu një shënim për defekt të përsëritur nga raporti i shqyrtuar. Vazhdo me kontrollet e përgjithshme; kjo nuk garanton mungesë defektesh.",
    registrationYears: "Vitet e regjistrimit në burim",
    yearHint:
      "Viti i prodhimit mund të ndryshojë nga regjistrimi i parë. Konfirmoje para se ta zbatosh këtë shënim.",
    notice: "Çfarë mund të vëresh",
    check: "Kontrolloje vetë",
    help: "Kur të kërkosh ndihmë",
    guidance:
      "Kontrollet e para të CapCar të ndihmojnë të regjistrosh simptomat. Nuk janë procedurë riparimi apo diagnozë.",
    topics: {
      oil: {
        title: "Rrjedhje vaji",
        notice: "Njolla të freskëta vaji poshtë makinës ose nivel që bie.",
        check:
          "Në terren të sheshtë, mat vajin sipas manualit. Fotografo gjurmët e dukshme dhe shëno kilometrat e sasinë e shtuar. Qëndro larg pjesëve të nxehta.",
        help: "Servisi duhet të gjejë rrjedhjen para blerjes së guarnicioneve. Fike motorin për paralajmërim të kuq të presionit të vajit; shtimi i vajit nuk është diagnozë.",
      },
      brakes: {
        title: "Konsumim ose frenim i dobët",
        notice:
          "Zhurmë fërkimi, dridhje, paralajmërim ose ndjesi e ndryshuar e pedalit.",
        check:
          "Lexo raportin e fundit të kontrollit dhe shëno kur ndodh simptoma. Në parkim shiko përmes rrotës për dëmtime të dukshme të diskut; mos çmonto frenat.",
        help: "Nëse frenimi dobësohet, pedali fundoset ose ndizet paralajmërimi i kuq, ndalo sigurt dhe kërko ndihmë. Konsumimi dhe frenimi duhen matur nga tekniku.",
      },
      springs: {
        title: "Susta të dëmtuara të amortizimit",
        notice: "Një cep qëndron më poshtë ose dëgjohet trokitje në gropa.",
        check:
          "Parko në terren të sheshtë dhe krahaso lartësinë nga jashtë. Fotografo ndonjë fund suste të thyer pa futur duart në mekanizëm dhe pa ngritur makinën.",
        help: "Susta e thyer mund të dëmtojë gomën. Nëse është zhvendosur, goma fërkohet ose drejtimi ndryshon, mos vazhdo; kërko kontroll.",
      },
      joints: {
        title: "Konsumim i nyjeve të varjes",
        notice:
          "Trokitje, konsumim i pabarabartë i gomave ose ndjesi paqëndrueshmërie.",
        check:
          "Shëno cepin ku dëgjohet zhurma dhe fotografo gomat. Mos u fut poshtë makinës së mbajtur vetëm me krik dhe mos liro pjesë të varjes.",
        help: "Servisi duhet të kontrollojë lojën e nyjeve dhe gjeometrinë. Mos vazhdo nëse rrota duket e zhvendosur ose makina bëhet e paqëndrueshme.",
      },
      steering: {
        title: "Konsumim i nyjeve të drejtimit",
        notice:
          "Lojë e re në timon, trokitje ose vështirësi për të mbajtur drejtimin.",
        check:
          "Regjistro simptomën dhe ndonjë goditje të fundit në bordurë. Shiko konsumimin e gomave nga jashtë; mos rregullo vetë nyjet e drejtimit.",
        help: "Drejtimi i rënduar ose i ndryshuar kërkon kontroll profesional. Nëse kontrolli është cenuar, kërko transport të makinës, jo provë në rrugë.",
      },
      exhaust: {
        title: "Dëmtime të sistemit të shkarkimit",
        notice:
          "Zhurmë metalike, shkarkim më i zhurmshëm ose ndryshk i dukshëm.",
        check:
          "Me motor të fikur dhe marmitë të ftohtë, shiko nga jashtë për tub të liruar ose ndryshk. Mos ndiz motorin në hapësirë të mbyllur.",
        help: "Gazrat në kabinë ose tubi i varur kërkojnë ndërhyrje të menjëhershme. Servisi kontrollon rrjedhjet dhe mbajtëset; ndryshku sipërfaqësor nuk provon defekt.",
      },
      lights: {
        title: "Defekte të ndriçimit",
        notice:
          "Dritë që nuk punon, pulson, jep paralajmërim ose ndriçon gabim.",
        check:
          "Në parkim të sigurt kontrollo dritat dhe sinjalet me një ndihmës ose pasqyrim. Pastro mbulesat. Ndërro llambën vetëm nëse manuali jep udhëzime për pronarin.",
        help: "Kërko matjen e drejtimit të fenerëve. LED të mbyllura, xenon dhe defekte elektrike të përsëritura kërkojnë teknik; shmang drejtimin pa ndriçimin e nevojshëm.",
      },
      battery: {
        title: "Probleme me baterinë e tensionit të ulët",
        notice:
          "Ndezje e ngadaltë, mosndezje e përsëritur ose mungesë e gjendjes READY.",
        check:
          "Shëno paralajmërimet, moshën e baterisë dhe kohën pa përdorim. Ndiq manualin për ndihmë në ndezje; mos improvizo lidhje dhe mos prek kabllot portokalli të tensionit të lartë.",
        help: "Kërko test të baterisë dhe sistemit të karikimit para zëvendësimit. Mosndezja nuk provon defekt të baterisë së tërheqjes së hibridit.",
      },
      parkingBrake: {
        title: "Frena e parkimit nuk mban siç duhet",
        notice: "Frena nuk mban si më parë ose shfaq paralajmërim.",
        check:
          "Shëno paralajmërimin dhe rrethanat e problemit të vërejtur. Mos e testo qëllimisht në pjerrësi dhe mos rregullo vetë kabllot.",
        help: "Siguro makinën sipas procedurës së parkimit në manual dhe kërko kontroll. Nëse nuk e siguron dot, kërko ndihmë.",
      },
      brakeHoses: {
        title: "Tuba fleksibël frenash të vjetruar",
        notice:
          "Çarje të shënuara në kontroll, gjurmë lëngu ose ndjesi tjetër e pedalit.",
        check:
          "Lexo raportet e mëparshme. Fotografo vetëm nga pozicion i sigurt; mos përkul, shkëput apo testo nën presion tubat vetë.",
        help: "Servisi duhet të kontrollojë dhe zëvendësojë tubat e dëmtuar. Në rast rrjedhjeje ose frenimi të dobët, ndalo sigurt dhe kërko transport.",
      },
      starter: {
        title: "Probleme me motorinon",
        notice: "Një klikim ose motori nuk rrotullohet kur provon ta ndezësh.",
        check:
          "Regjistro mesazhin dhe nëse dritat e panelit zbehen. Kontrollo procedurën në manual; mos lidh drejtpërdrejt terminalet e motorinos dhe mos provo pa pushim.",
        help: "Kërko testim të baterisë, lidhjeve dhe motorinos. Mosndezja vetëm nuk justifikon zëvendësimin e motorinos.",
      },
      injection: {
        title: "Probleme me injektimin",
        notice:
          "Punë e parregullt e motorit, ndezje e vështirë ose paralajmërim motori.",
        check:
          "Ruaj paralajmërimin e saktë dhe raportet ekzistuese të kodeve. Shëno nëse motori ishte i ftohtë apo i ngrohtë. Mos hap linjat e karburantit dhe mos porosit injektorë vetëm nga simptomat.",
        help: "Servisi duhet të diagnostikojë sistemin. Nëse ndien karburant ose paralajmërimi i motorit pulson, ndalo sigurt; mos e riprodho defektin duke drejtuar.",
      },
      tpms: {
        title: "Defekt i monitorimit të presionit të gomave",
        notice: "Paralajmërimi mbetet edhe pasi konfirmohen presionet e sakta.",
        check:
          "Mat të gjitha gomat të ftohta sipas etiketës së makinës. Kontrollo dëmtimet. Rivendose sistemin sipas manualit vetëm pasi të kesh korrigjuar presionin.",
        help: "Humbja e përsëritur e presionit kërkon kontroll të gomës; defekti i vazhdueshëm kërkon diagnozë. Mos fshi paralajmërimin për të fshehur një shpim të mundshëm.",
      },
    },
  },
  el: {
    intro:
      "Σημεία που αξίζει να ελέγξεις σε αυτή τη γενιά, σύμφωνα με τη συνδεδεμένη έκθεση μεταχειρισμένων του ADAC.",
    scope: "Η έκθεση καλύπτει",
    petrol: "Εκδόσεις βενζίνης",
    diesel: "Εκδόσεις diesel",
    mixed: "Εκδόσεις βενζίνης και diesel",
    electric: "Ηλεκτρικές εκδόσεις",
    candidate:
      "Επιβεβαίωσε καύσιμο και έκδοση. Μια τάση του μοντέλου δεν είναι επιβεβαιωμένη βλάβη στο αυτοκίνητό σου.",
    noPattern:
      "Δεν υπάρχει εδώ σημείωση επαναλαμβανόμενης βλάβης για αυτό το έτος από την εξετασμένη έκθεση. Συνέχισε με τους γενικούς ελέγχους· αυτό δεν εγγυάται απουσία βλαβών.",
    registrationYears: "Έτη πρώτης ταξινόμησης της πηγής",
    yearHint:
      "Το έτος παραγωγής μπορεί να διαφέρει από την πρώτη ταξινόμηση. Επιβεβαίωσέ το πριν εφαρμόσεις τη σημείωση.",
    notice: "Τι μπορεί να παρατηρήσεις",
    check: "Έλεγξε μόνος σου",
    help: "Πότε χρειάζεται βοήθεια",
    guidance:
      "Οι πρώτοι έλεγχοι του CapCar βοηθούν στην καταγραφή συμπτωμάτων. Δεν αποτελούν διαδικασία επισκευής ή διάγνωση.",
    topics: {
      oil: {
        title: "Διαρροές λαδιού",
        notice: "Φρέσκοι λεκέδες κάτω από το όχημα ή πτώση στάθμης λαδιού.",
        check:
          "Σε επίπεδο έδαφος, μέτρησε τη στάθμη όπως λέει το εγχειρίδιο. Φωτογράφισε ορατά ίχνη και σημείωσε χιλιόμετρα και συμπληρώσεις. Μείνε μακριά από καυτά μέρη.",
        help: "Ζήτησε εντοπισμό της διαρροής πριν αγοράσεις τσιμούχες. Σβήσε τον κινητήρα σε κόκκινη ένδειξη πίεσης λαδιού· η συμπλήρωση δεν είναι διάγνωση.",
      },
      brakes: {
        title: "Φθορά φρένων ή μειωμένη πέδηση",
        notice: "Τρίξιμο, κραδασμοί, ένδειξη ή αλλαγή στην αίσθηση του πεντάλ.",
        check:
          "Διάβασε τον τελευταίο έλεγχο και σημείωσε πότε εμφανίζεται το σύμπτωμα. Με το όχημα σταθμευμένο, κοίτα μέσα από τη ζάντα για εμφανή ζημιά· μην αποσυναρμολογήσεις τα φρένα.",
        help: "Με μειωμένη πέδηση, πεντάλ που βυθίζεται ή κόκκινη ένδειξη, σταμάτησε με ασφάλεια και ζήτησε βοήθεια. Τεχνικός πρέπει να μετρήσει φθορά και απόδοση.",
      },
      springs: {
        title: "Ζημιά στα ελατήρια ανάρτησης",
        notice:
          "Μια γωνία κάθεται χαμηλότερα ή ακούγεται νέος χτύπος στις ανωμαλίες.",
        check:
          "Στάθμευσε σε επίπεδο έδαφος και σύγκρινε το ύψος από έξω. Φωτογράφισε ορατό σπασμένο άκρο χωρίς να βάλεις χέρια στην ανάρτηση ή να σηκώσεις το όχημα.",
        help: "Σπασμένο ελατήριο μπορεί να καταστρέψει το ελαστικό. Αν έχει μετακινηθεί, τρίβεται το ελαστικό ή αλλάζει η συμπεριφορά, μην συνεχίσεις· ζήτησε έλεγχο.",
      },
      joints: {
        title: "Φθορά αρθρώσεων ανάρτησης",
        notice: "Χτύποι, ανομοιόμορφη φθορά ελαστικών ή αίσθηση αστάθειας.",
        check:
          "Σημείωσε από ποια γωνία ακούγεται και φωτογράφισε τα ελαστικά. Μην μπεις κάτω από όχημα που στηρίζεται μόνο σε γρύλο και μη λύσεις εξαρτήματα ανάρτησης.",
        help: "Συνεργείο πρέπει να ελέγξει τζόγους και ευθυγράμμιση. Μην οδηγήσεις αν τροχός φαίνεται μετατοπισμένος ή το όχημα είναι ασταθές.",
      },
      steering: {
        title: "Φθορά αρθρώσεων διεύθυνσης",
        notice: "Νέος τζόγος, χτύποι ή δυσκολία διατήρησης ευθείας πορείας.",
        check:
          "Κατέγραψε το σύμπτωμα και τυχόν πρόσφατο χτύπημα σε κράσπεδο. Κοίτα τη φθορά των ελαστικών από έξω· μην ρυθμίσεις μόνος σου τις αρθρώσεις.",
        help: "Βαρύ τιμόνι ή αλλαγή στον έλεγχο χρειάζεται επαγγελματική εκτίμηση. Αν ο έλεγχος έχει επηρεαστεί, ζήτησε μεταφορά αντί για δοκιμαστική οδήγηση.",
      },
      exhaust: {
        title: "Φθορά συστήματος εξάτμισης",
        notice: "Νέος μεταλλικός θόρυβος, δυνατότερη εξάτμιση ή ορατή σκουριά.",
        check:
          "Με σβηστό κινητήρα και κρύα εξάτμιση, κοίτα από έξω για χαλαρό σωλήνα ή σκουριά. Μη λειτουργείς τον κινητήρα σε κλειστό χώρο.",
        help: "Καυσαέρια στην καμπίνα ή σωλήνας που κρέμεται χρειάζονται άμεση προσοχή. Το συνεργείο ελέγχει διαρροές και στηρίγματα· η επιφανειακή σκουριά μόνη της δεν αποδεικνύει βλάβη.",
      },
      lights: {
        title: "Βλάβες φωτισμού",
        notice:
          "Λάμπα που δεν ανάβει, τρεμοπαίζει, δίνει ένδειξη ή φωτίζει λάθος.",
        check:
          "Σε ασφαλή στάθμευση, έλεγξε φώτα και φλας με βοηθό ή αντανάκλαση. Καθάρισε τους φακούς. Άλλαξε λάμπα μόνο αν το εγχειρίδιο δίνει διαδικασία για τον ιδιοκτήτη.",
        help: "Ζήτησε μέτρηση της δέσμης. Κλειστά LED, xenon ή επαναλαμβανόμενες ηλεκτρικές βλάβες χρειάζονται τεχνικό· απόφυγε οδήγηση χωρίς τον απαραίτητο φωτισμό.",
      },
      battery: {
        title: "Προβλήματα μπαταρίας χαμηλής τάσης",
        notice:
          "Αργή μίζα, επαναλαμβανόμενη αδυναμία εκκίνησης ή απουσία READY.",
        check:
          "Σημείωσε ενδείξεις, ηλικία μπαταρίας και χρόνο ακινησίας. Ακολούθησε το εγχειρίδιο για βοήθεια εκκίνησης· μην αυτοσχεδιάζεις συνδέσεις ή αγγίζεις πορτοκαλί καλώδια υψηλής τάσης.",
        help: "Ζήτησε έλεγχο μπαταρίας και φόρτισης πριν την αντικατάσταση. Η αδυναμία εκκίνησης δεν αποδεικνύει βλάβη της υβριδικής μπαταρίας κίνησης.",
      },
      parkingBrake: {
        title: "Το χειρόφρενο δεν συγκρατεί σωστά",
        notice: "Δεν συγκρατεί όπως πριν ή εμφανίζει προειδοποίηση.",
        check:
          "Σημείωσε την ένδειξη και τις συνθήκες ήδη παρατηρημένου προβλήματος. Μην το δοκιμάσεις επίτηδες σε πλαγιά και μη ρυθμίσεις ντίζες μόνος σου.",
        help: "Ασφάλισε το όχημα όπως ορίζει το εγχειρίδιο και κλείσε έλεγχο. Αν δεν μπορείς να το ασφαλίσεις, ζήτησε βοήθεια.",
      },
      brakeHoses: {
        title: "Γηρασμένα εύκαμπτα σωληνάκια φρένων",
        notice: "Ρωγμές σε έκθεση ελέγχου, ίχνη υγρού ή αλλαγή στο πεντάλ.",
        check:
          "Διάβασε προηγούμενες εκθέσεις. Φωτογράφισε μόνο από ασφαλή θέση· μη λυγίσεις, αποσυνδέσεις ή δοκιμάσεις τα σωληνάκια υπό πίεση.",
        help: "Συνεργείο πρέπει να ελέγξει και να αντικαταστήσει τα φθαρμένα σωληνάκια. Με διαρροή ή μειωμένη πέδηση, σταμάτησε με ασφάλεια και ζήτησε μεταφορά.",
      },
      starter: {
        title: "Προβλήματα μίζας",
        notice: "Ακούγεται κλικ ή ο κινητήρας δεν περιστρέφεται στην εκκίνηση.",
        check:
          "Σημείωσε το μήνυμα και αν χαμηλώνουν τα φώτα του πίνακα. Έλεγξε τη διαδικασία εκκίνησης στο εγχειρίδιο· μη γεφυρώσεις ακροδέκτες ή επιμένεις σε συνεχείς προσπάθειες.",
        help: "Ζήτησε έλεγχο μπαταρίας, συνδέσεων και μίζας. Η μη εκκίνηση μόνη της δεν δικαιολογεί αλλαγή μίζας.",
      },
      injection: {
        title: "Προβλήματα ψεκασμού καυσίμου",
        notice: "Ακανόνιστη λειτουργία, δύσκολη εκκίνηση ή ένδειξη κινητήρα.",
        check:
          "Αποθήκευσε την ακριβή ένδειξη και υπάρχουσες αναφορές κωδικών. Σημείωσε αν ο κινητήρας ήταν κρύος ή ζεστός. Μην ανοίξεις σωληνώσεις καυσίμου ή αγοράσεις μπεκ μόνο από συμπτώματα.",
        help: "Το συνεργείο πρέπει να διαγνώσει το σύστημα. Σε οσμή καυσίμου ή ένδειξη κινητήρα που αναβοσβήνει, σταμάτησε με ασφάλεια· μην οδηγήσεις για να αναπαράγεις τη βλάβη.",
      },
      tpms: {
        title: "Βλάβη παρακολούθησης πίεσης ελαστικών",
        notice: "Η ένδειξη παραμένει αφού επιβεβαιωθούν οι σωστές πιέσεις.",
        check:
          "Μέτρησε όλα τα ελαστικά κρύα με μανόμετρο σύμφωνα με την ετικέτα του οχήματος. Έλεγξε για ζημιές. Κάνε επαναφορά μόνο μετά τη διόρθωση, σύμφωνα με το εγχειρίδιο.",
        help: "Επαναλαμβανόμενη απώλεια πίεσης χρειάζεται έλεγχο ελαστικού· επίμονη βλάβη συστήματος χρειάζεται διάγνωση. Μη σβήσεις ένδειξη για να κρύψεις πιθανό τρύπημα.",
      },
    },
  },
  ja: {
    intro:
      "リンク先のADAC中古車レポートに基づく、この世代で確認しておきたい項目です。",
    scope: "レポートの対象",
    petrol: "ガソリン仕様",
    diesel: "ディーゼル仕様",
    mixed: "ガソリン・ディーゼル仕様",
    electric: "電気自動車仕様",
    candidate:
      "燃料の種類と仕様を確認してください。モデル全体の傾向は、あなたの車の故障を意味しません。",
    noPattern:
      "確認したレポートから、この年に対応する反復的な故障の注記はここにはありません。一般点検を続けてください。異常なしの保証ではありません。",
    registrationYears: "出典の初度登録年",
    yearHint:
      "製造年と初度登録年は異なる場合があります。この注記を当てはめる前に確認してください。",
    notice: "気づくことがある症状",
    check: "自分で確認できること",
    help: "専門家に相談する目安",
    guidance:
      "CapCarの初期チェックは症状を記録するためのものです。修理手順や診断ではありません。",
    topics: {
      oil: {
        title: "オイル漏れ",
        notice: "車の下の新しい油染み、またはオイル量の低下。",
        check:
          "水平な場所で取扱説明書に従って油量を確認します。見える跡を撮影し、走行距離と補充量を記録します。熱い部品に近づかないでください。",
        help: "シール類を買う前に整備工場で漏れ箇所を特定します。赤い油圧警告ではエンジンを停止してください。補充だけでは原因は分かりません。",
      },
      brakes: {
        title: "ブレーキの摩耗・制動力低下",
        notice: "擦れる音、振動、警告、ペダルの感触の変化。",
        check:
          "前回の点検記録を読み、症状が出る条件を記録します。駐車中にホイール越しにディスクの明らかな損傷を確認します。ブレーキは分解しないでください。",
        help: "効きの低下、ペダルの沈み、赤いブレーキ警告があれば安全に停止して救援を依頼します。摩耗量と制動性能は整備士の測定が必要です。",
      },
      springs: {
        title: "サスペンションスプリングの損傷",
        notice: "車体の一角が低い、段差で新たな打音がする。",
        check:
          "平らな場所に駐車し、外から車高を比較します。見える折れた端を撮影します。サスペンションに手を入れたり、車を持ち上げたりしないでください。",
        help: "折れたスプリングはタイヤを傷つけることがあります。位置のずれ、タイヤの接触、挙動の変化があれば運転を中止し、点検を依頼します。",
      },
      joints: {
        title: "サスペンションジョイントの摩耗",
        notice: "打音、タイヤの偏摩耗、車体の不安定な感覚。",
        check:
          "音がする場所を記録し、タイヤの摩耗を撮影します。ジャッキだけで支えた車の下に入らず、足回りの部品を緩めないでください。",
        help: "整備工場でジョイントのがたとアライメントを確認します。車輪の位置がずれたり、車が不安定になったりしたら運転を中止します。",
      },
      steering: {
        title: "ステアリングジョイントの摩耗",
        notice: "新たなハンドルのがた、打音、直進のしにくさ。",
        check:
          "症状と最近の縁石への接触を記録します。外からタイヤの偏摩耗を確認します。ステアリングのジョイントを自分で調整しないでください。",
        help: "操舵の変化や重さは早急に専門家へ相談します。車を制御しにくい場合は試運転せず、搬送を依頼してください。",
      },
      exhaust: {
        title: "排気系の劣化",
        notice: "新たな金属音、大きくなった排気音、見えるさび。",
        check:
          "エンジンを切り、排気系が冷めてから外側より出口の緩みやさびを確認します。閉じた場所でエンジンをかけないでください。",
        help: "車内の排気臭や垂れ下がったパイプは直ちに対処が必要です。工場で漏れと取付部を点検します。表面のさびだけで故障とは断定できません。",
      },
      lights: {
        title: "灯火類の不具合",
        notice: "不点灯、ちらつき、警告、ヘッドライトの照射方向の異常。",
        check:
          "安全に駐車し、協力者や反射を使って灯火と方向指示器を確認します。レンズを清掃します。取扱説明書に所有者向け手順がある場合だけ電球を交換します。",
        help: "光軸は測定してもらいます。密閉LED、キセノン、繰り返す電気系の不具合は整備士に依頼します。必要な灯火が使えない状態での運転は避けてください。",
      },
      battery: {
        title: "低電圧バッテリーの不調",
        notice: "始動時の回転が遅い、始動できない状態が続く、READYにならない。",
        check:
          "警告、バッテリーの使用年数、放置期間を記録します。救援始動は説明書に従います。接続を自己判断せず、オレンジ色の高電圧ケーブルには触れないでください。",
        help: "交換前にバッテリーと充電系統を検査してもらいます。始動の問題だけでハイブリッド駆動用バッテリーの故障とは言えません。",
      },
      parkingBrake: {
        title: "パーキングブレーキの保持力不足",
        notice: "以前のように車を保持しない、または警告が出る。",
        check:
          "既に起きた問題の警告と条件を記録します。坂で故意に試したり、ケーブルを自分で調整したりしないでください。",
        help: "説明書の駐車手順に従って車を確実に固定し、点検を依頼します。安全に固定できなければ救援を求めてください。",
      },
      brakeHoses: {
        title: "ブレーキホースの経年劣化",
        notice: "点検で見つかったひび、液体の跡、ペダル感触の変化。",
        check:
          "過去の点検記録を確認します。安全な位置から見える部分だけ撮影します。ホースを曲げたり、外したり、加圧テストしたりしないでください。",
        help: "損傷したホースの点検・交換は工場に依頼します。液漏れや制動力低下があれば安全に停止し、搬送を手配します。",
      },
      starter: {
        title: "スターターの不調",
        notice: "始動操作でクリック音だけがする、またはエンジンが回らない。",
        check:
          "メッセージとメーター照明が暗くなるかを記録します。説明書の始動手順を確認します。端子を短絡させず、何度も始動を繰り返さないでください。",
        help: "バッテリー、接続部、スターターを検査してもらいます。始動しないことだけを理由にスターターを交換しないでください。",
      },
      injection: {
        title: "燃料噴射系の不調",
        notice: "回転の乱れ、始動困難、エンジン警告。",
        check:
          "正確な警告と既存の故障コード記録を保存します。冷間時か暖機後かを記録します。燃料配管を開けず、症状だけでインジェクターを注文しないでください。",
        help: "燃料系は工場で診断が必要です。燃料臭や点滅するエンジン警告があれば安全に停止します。故障を再現するために運転しないでください。",
      },
      tpms: {
        title: "タイヤ空気圧監視システムの不具合",
        notice: "正しい空気圧を確認してもシステム警告が残る。",
        check:
          "冷えた全タイヤをゲージで測り、車両の指定空気圧に合わせます。損傷を確認します。空気圧を修正してから説明書どおりにリセットします。",
        help: "繰り返す空気圧低下はタイヤ点検、残るシステム警告は診断が必要です。パンクの可能性を隠すために警告をリセットしないでください。",
      },
    },
  },
};
