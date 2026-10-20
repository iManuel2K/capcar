import type { AppLocale } from "@/i18n/config";
const en = {
  modelYear: "US model year to research",
  yearHint:
    "Starts with the production year you entered. Production year and US model year can differ; confirm the model year before applying a recall.",
  title: "Official recall references",
  intro:
    "Fetched on demand from NHTSA, the US vehicle-safety authority. These are US model-year references, not confirmed faults or open recalls for your exact car.",
  loading: "Checking the official source…",
  failed:
    "The official source is temporarily unavailable. Existing reviewed references below are still available. Try again later.",
  retry: "Try again",
  unsupported:
    "This source does not cover this exact model or model year. We have not substituted a different car.",
  concept:
    "This choice is a concept/prototype, not a production model. We will not attach production-car faults to it.",
  historic: "No reviewed live source is configured for this historic model.",
  unknown:
    "This configuration does not match a selectable catalog entry. Check the model, generation and year before looking up records.",
  empty:
    "No records were returned for this US model-year lookup. This does not mean the car has no faults or recalls in other markets.",
  scope: "US source model",
  checked: "Source retrieved",
  stale:
    "Cached results are older than six hours. Confirm current information with the official source.",
  evidence: "Official US recall · confirm applicability",
  details: "Read source details and remedy",
  consequence: "Safety consequence",
  remedy: "Manufacturer remedy",
  reportDate: "Reported by source",
  open: "Open official campaign record",
  more: "Show more records",
  fewer: "Show fewer records",
  market: "Check your own vehicle",
  marketText:
    "US records can differ from European or Japanese cars, engines and production dates. The manufacturer or an authorised workshop must confirm your VIN and recall completion. No VIN is sent by this lookup.",
  kba: "German official recall search (KBA)",
  nhtsa: "US official recall search (NHTSA)",
  original: "Original source wording; not AI-generated or translated.",
  cache:
    "Shared server cache · refreshed every six hours when requested. No full reports, images or new data copies are stored in your garage.",
  park: "Source warning: do not drive. Read the official campaign and contact the manufacturer.",
  outside:
    "Source warning: park outside. Read the official campaign instructions.",
  local: "Reviewed problem summaries",
  localNote:
    "These separate inspection reports and technical bulletins remain available while live recall information loads.",
  localEmpty:
    "No reviewed common-problem summaries currently match this configuration. That is a coverage gap, not a clean bill of health.",
  coverage: "Source coverage for every selectable car",
  coverageNote:
    "Every catalog choice has an explicit source policy. Live lookup availability is not a claim that problems exist or that every engine and market is covered.",
  lookup: "US model-index lookup; exact applicability must be confirmed",
  gap: "US data not mapped; see official searches and reviewed references",
  prototype: "Concept: no production-fault claims",
  history: "Historic model: further source review needed",
};
type Copy = { [K in keyof typeof en]: string };
export const problemSourceCopy: Record<AppLocale, Copy> = {
  en,
  de: {
    modelYear: "US-Modelljahr für die Recherche",
    yearHint:
      "Beginnt mit deinem eingetragenen Baujahr. Baujahr und US-Modelljahr können abweichen; vor Anwendung eines Rückrufs das Modelljahr bestätigen.",
    title: "Offizielle Rückrufreferenzen",
    intro:
      "Bei Bedarf von der US-Verkehrssicherheitsbehörde NHTSA abgerufen. US-Modelljahr-Referenzen, keine bestätigten Defekte oder offenen Rückrufe für dein konkretes Auto.",
    loading: "Offizielle Quelle wird geprüft…",
    failed:
      "Die offizielle Quelle ist vorübergehend nicht erreichbar. Die geprüften Referenzen unten bleiben verfügbar. Versuche es später erneut.",
    retry: "Erneut versuchen",
    unsupported:
      "Diese Quelle deckt das genaue Modell oder Modelljahr nicht ab. Es wurde kein anderes Auto als Ersatz verwendet.",
    concept:
      "Diese Auswahl ist ein Konzept/Prototyp, kein Serienmodell. Ihr werden keine Fehler von Serienautos zugeordnet.",
    historic:
      "Für dieses historische Modell ist keine geprüfte Live-Quelle eingerichtet.",
    unknown:
      "Diese Konfiguration passt zu keinem auswählbaren Katalogeintrag. Prüfe Modell, Generation und Baujahr.",
    empty:
      "Die US-Modelljahr-Abfrage ergab keine Einträge. Das bedeutet nicht, dass das Auto keine Mängel oder Rückrufe in anderen Märkten hat.",
    scope: "US-Quellenmodell",
    checked: "Quelle abgerufen",
    stale:
      "Die zwischengespeicherten Ergebnisse sind älter als sechs Stunden. Prüfe aktuelle Informationen bei der offiziellen Quelle.",
    evidence: "Offizieller US-Rückruf · Betroffenheit prüfen",
    details: "Quelldetails und Abhilfe lesen",
    consequence: "Sicherheitsfolge",
    remedy: "Abhilfe des Herstellers",
    reportDate: "Meldedatum der Quelle",
    open: "Offiziellen Rückrufeintrag öffnen",
    more: "Weitere Einträge zeigen",
    fewer: "Weniger Einträge zeigen",
    market: "Dein eigenes Fahrzeug prüfen",
    marketText:
      "US-Daten können von europäischen oder japanischen Autos, Motoren und Produktionsdaten abweichen. Hersteller oder Vertragswerkstatt müssen VIN und Rückrufstatus prüfen. Diese Abfrage überträgt keine VIN.",
    kba: "Offizielle deutsche Rückrufsuche (KBA)",
    nhtsa: "Offizielle US-Rückrufsuche (NHTSA)",
    original: "Originalwortlaut der Quelle; nicht KI-generiert oder übersetzt.",
    cache:
      "Gemeinsamer Server-Cache · bei Bedarf alle sechs Stunden aktualisiert. Keine vollständigen Berichte, Bilder oder neuen Datenkopien in deiner Garage.",
    park: "Warnung der Quelle: nicht fahren. Offiziellen Rückruf lesen und Hersteller kontaktieren.",
    outside:
      "Warnung der Quelle: im Freien parken. Offizielle Rückrufanweisungen lesen.",
    local: "Geprüfte Problemzusammenfassungen",
    localNote:
      "Diese getrennten Prüfberichte und technischen Hinweise bleiben verfügbar, während Live-Rückrufdaten geladen werden.",
    localEmpty:
      "Keine geprüften Zusammenfassungen häufiger Probleme passen derzeit zu dieser Konfiguration. Das ist eine Abdeckungslücke, keine Unbedenklichkeitsbescheinigung.",
    coverage: "Quellenabdeckung für alle auswählbaren Autos",
    coverageNote:
      "Jede Katalogauswahl hat eine ausdrückliche Quellenzuordnung. Ein verfügbarer Abruf bedeutet weder, dass Probleme bestehen, noch dass alle Motoren und Märkte abgedeckt sind.",
    lookup: "US-Modellindex-Abfrage; genaue Betroffenheit prüfen",
    gap: "US-Daten nicht zugeordnet; offizielle Suchen und geprüfte Referenzen nutzen",
    prototype: "Konzept: keine Serienfehler behauptet",
    history: "Historisches Modell: weitere Quellenprüfung nötig",
  },
  el: {
    modelYear: "Έτος μοντέλου ΗΠΑ για έρευνα",
    yearHint:
      "Ξεκινά από το έτος παραγωγής που δήλωσες. Το έτος παραγωγής μπορεί να διαφέρει από το έτος μοντέλου ΗΠΑ· επιβεβαίωσέ το πριν εφαρμόσεις μια ανάκληση.",
    title: "Επίσημες αναφορές ανακλήσεων",
    intro:
      "Ανάκτηση όταν χρειάζεται από τη NHTSA, την αμερικανική αρχή ασφάλειας οχημάτων. Αναφορές για μοντέλα και έτη αγοράς ΗΠΑ, όχι επιβεβαιωμένες βλάβες ή ανοιχτές ανακλήσεις για το δικό σου αυτοκίνητο.",
    loading: "Έλεγχος επίσημης πηγής…",
    failed:
      "Η επίσημη πηγή δεν είναι προσωρινά διαθέσιμη. Οι ελεγμένες αναφορές παρακάτω παραμένουν διαθέσιμες. Δοκίμασε αργότερα.",
    retry: "Δοκίμασε ξανά",
    unsupported:
      "Η πηγή δεν καλύπτει το συγκεκριμένο μοντέλο ή έτος μοντέλου. Δεν αντικαταστήσαμε το αυτοκίνητο με κάποιο άλλο.",
    concept:
      "Αυτή η επιλογή είναι πρωτότυπο, όχι μοντέλο παραγωγής. Δεν θα της αποδώσουμε βλάβες αυτοκινήτων παραγωγής.",
    historic:
      "Δεν έχει ρυθμιστεί ελεγμένη ζωντανή πηγή για αυτό το ιστορικό μοντέλο.",
    unknown:
      "Η διαμόρφωση δεν αντιστοιχεί σε επιλογή καταλόγου. Έλεγξε μοντέλο, γενιά και έτος.",
    empty:
      "Δεν επιστράφηκαν εγγραφές για αυτό το μοντέλο και έτος ΗΠΑ. Αυτό δεν σημαίνει ότι δεν υπάρχουν βλάβες ή ανακλήσεις σε άλλες αγορές.",
    scope: "Μοντέλο στην πηγή ΗΠΑ",
    checked: "Ανάκτηση πηγής",
    stale:
      "Τα αποθηκευμένα αποτελέσματα είναι παλαιότερα από έξι ώρες. Επιβεβαίωσε τις τρέχουσες πληροφορίες στην επίσημη πηγή.",
    evidence: "Επίσημη ανάκληση ΗΠΑ · επιβεβαίωσε την εφαρμογή",
    details: "Διάβασε λεπτομέρειες και αποκατάσταση",
    consequence: "Συνέπεια για την ασφάλεια",
    remedy: "Αποκατάσταση κατασκευαστή",
    reportDate: "Ημερομηνία αναφοράς πηγής",
    open: "Άνοιξε την επίσημη εγγραφή ανάκλησης",
    more: "Περισσότερες εγγραφές",
    fewer: "Λιγότερες εγγραφές",
    market: "Έλεγξε το δικό σου όχημα",
    marketText:
      "Οι εγγραφές ΗΠΑ μπορεί να διαφέρουν από ευρωπαϊκά ή ιαπωνικά αυτοκίνητα, κινητήρες και ημερομηνίες παραγωγής. Ο κατασκευαστής ή εξουσιοδοτημένο συνεργείο πρέπει να επιβεβαιώσει VIN και ολοκλήρωση ανάκλησης. Η αναζήτηση δεν στέλνει VIN.",
    kba: "Επίσημη γερμανική αναζήτηση ανακλήσεων (KBA)",
    nhtsa: "Επίσημη αναζήτηση ανακλήσεων ΗΠΑ (NHTSA)",
    original: "Αρχικό κείμενο πηγής· δεν παράγεται ούτε μεταφράζεται με AI.",
    cache:
      "Κοινή προσωρινή αποθήκευση στον διακομιστή · ανανέωση ανά έξι ώρες όταν ζητηθεί. Χωρίς πλήρεις αναφορές, εικόνες ή νέα αντίγραφα δεδομένων στο γκαράζ σου.",
    park: "Προειδοποίηση πηγής: μην οδηγήσεις. Διάβασε την επίσημη ανάκληση και επικοινώνησε με τον κατασκευαστή.",
    outside:
      "Προειδοποίηση πηγής: στάθμευσε έξω. Διάβασε τις επίσημες οδηγίες ανάκλησης.",
    local: "Ελεγμένες περιλήψεις προβλημάτων",
    localNote:
      "Αυτές οι ξεχωριστές αναφορές ελέγχου και τα τεχνικά δελτία παραμένουν διαθέσιμα όσο φορτώνονται οι ανακλήσεις.",
    localEmpty:
      "Δεν ταιριάζουν προς το παρόν ελεγμένες περιλήψεις συχνών προβλημάτων. Είναι κενό κάλυψης, όχι βεβαίωση ότι το όχημα δεν έχει θέματα.",
    coverage: "Κάλυψη πηγών για κάθε επιλέξιμο αυτοκίνητο",
    coverageNote:
      "Κάθε επιλογή καταλόγου έχει ρητή πολιτική πηγών. Η δυνατότητα αναζήτησης δεν σημαίνει ότι υπάρχουν προβλήματα ή ότι καλύπτονται όλοι οι κινητήρες και οι αγορές.",
    lookup:
      "Αναζήτηση στο ευρετήριο μοντέλων ΗΠΑ· απαιτείται επιβεβαίωση εφαρμογής",
    gap: "Δεν αντιστοιχίστηκαν δεδομένα ΗΠΑ· δες επίσημες αναζητήσεις και ελεγμένες αναφορές",
    prototype: "Πρωτότυπο: χωρίς ισχυρισμούς βλαβών παραγωγής",
    history: "Ιστορικό μοντέλο: χρειάζεται πρόσθετος έλεγχος πηγών",
  },
  sq: {
    modelYear: "Viti i modelit amerikan për kërkim",
    yearHint:
      "Fillon me vitin e prodhimit që vendose. Viti i prodhimit mund të ndryshojë nga viti i modelit amerikan; konfirmoje përpara se të zbatosh një tërheqje.",
    title: "Referenca zyrtare të tërheqjeve",
    intro:
      "Merren sipas nevojës nga NHTSA, autoriteti amerikan i sigurisë së automjeteve. Janë referenca për modele dhe vite të tregut amerikan, jo defekte apo tërheqje të hapura të konfirmuara për makinën tënde.",
    loading: "Po kontrollohet burimi zyrtar…",
    failed:
      "Burimi zyrtar është përkohësisht i padisponueshëm. Referencat e shqyrtuara më poshtë mbeten të disponueshme. Provo më vonë.",
    retry: "Provo përsëri",
    unsupported:
      "Ky burim nuk e mbulon modelin ose vitin e saktë. Nuk është zëvendësuar me një makinë tjetër.",
    concept:
      "Kjo zgjedhje është koncept/prototip, jo model prodhimi. Nuk do t’i atribuojmë defekte të makinave të prodhimit.",
    historic:
      "Nuk është konfiguruar burim i drejtpërdrejtë i shqyrtuar për këtë model historik.",
    unknown:
      "Ky konfigurim nuk përputhet me një zgjedhje katalogu. Kontrollo modelin, gjeneratën dhe vitin.",
    empty:
      "Nuk u kthyen të dhëna për këtë model dhe vit amerikan. Kjo nuk do të thotë se makina nuk ka defekte ose tërheqje në tregje të tjera.",
    scope: "Modeli në burimin amerikan",
    checked: "Burimi u mor",
    stale:
      "Rezultatet e ruajtura janë më të vjetra se gjashtë orë. Konfirmo informacionin aktual te burimi zyrtar.",
    evidence: "Tërheqje zyrtare SHBA · konfirmo zbatueshmërinë",
    details: "Lexo hollësitë dhe zgjidhjen e burimit",
    consequence: "Pasoja për sigurinë",
    remedy: "Zgjidhja e prodhuesit",
    reportDate: "Data sipas burimit",
    open: "Hap të dhënën zyrtare të tërheqjes",
    more: "Shfaq më shumë",
    fewer: "Shfaq më pak",
    market: "Kontrollo automjetin tënd",
    marketText:
      "Të dhënat amerikane mund të ndryshojnë nga makinat evropiane ose japoneze, motorët dhe datat e prodhimit. Prodhuesi ose servisi i autorizuar duhet të konfirmojë VIN-in dhe kryerjen e tërheqjes. Kjo kërkesë nuk dërgon VIN.",
    kba: "Kërkimi zyrtar gjerman i tërheqjeve (KBA)",
    nhtsa: "Kërkimi zyrtar amerikan i tërheqjeve (NHTSA)",
    original:
      "Teksti origjinal i burimit; nuk është krijuar ose përkthyer nga AI.",
    cache:
      "Memorie e përbashkët në server · rifreskim çdo gjashtë orë kur kërkohet. Nuk ruhen raporte të plota, imazhe apo kopje të reja në garazhin tënd.",
    park: "Paralajmërim i burimit: mos e drejto makinën. Lexo tërheqjen zyrtare dhe kontakto prodhuesin.",
    outside:
      "Paralajmërim i burimit: parko jashtë. Lexo udhëzimet zyrtare të tërheqjes.",
    local: "Përmbledhje problemesh të shqyrtuara",
    localNote:
      "Këto raporte kontrolli dhe buletine teknike të veçanta mbeten të disponueshme gjatë ngarkimit të të dhënave të drejtpërdrejta.",
    localEmpty:
      "Nuk ka aktualisht përmbledhje të shqyrtuara që përputhen me këtë konfigurim. Ky është boshllëk mbulimi, jo garanci se makina nuk ka probleme.",
    coverage: "Mbulimi i burimeve për çdo makinë të zgjedhshme",
    coverageNote:
      "Çdo zgjedhje katalogu ka politikë të qartë burimi. Kërkimi i disponueshëm nuk nënkupton probleme apo mbulim të çdo motori dhe tregu.",
    lookup: "Kërkim në indeksin amerikan; zbatueshmëria duhet konfirmuar",
    gap: "Pa përputhje të të dhënave amerikane; shiko kërkimet zyrtare dhe referencat e shqyrtuara",
    prototype: "Koncept: pa pretendime për defekte prodhimi",
    history: "Model historik: duhen shqyrtuar burime të tjera",
  },
  ja: {
    modelYear: "調べる米国モデルイヤー",
    yearHint:
      "入力した生産年を初期値にしています。生産年と米国モデルイヤーは異なる場合があります。リコール適用前に確認してください。",
    title: "公式リコール情報",
    intro:
      "米国の車両安全当局NHTSAから必要時に取得します。米国向けモデル・モデルイヤーの参考情報であり、愛車の不具合や未実施リコールを確認したものではありません。",
    loading: "公式情報を確認中…",
    failed:
      "現在、公式情報を取得できません。下の確認済み参考資料は引き続き利用できます。後ほどお試しください。",
    retry: "再試行",
    unsupported:
      "この情報源は該当するモデルまたはモデルイヤーに対応していません。別の車種の情報で代用していません。",
    concept:
      "この選択肢はコンセプトカー・試作車で、量産モデルではありません。量産車の不具合を流用しません。",
    historic:
      "このヒストリックモデルに対応する確認済みのライブ情報源は設定されていません。",
    unknown:
      "この仕様は選択可能なカタログ車両に一致しません。モデル・世代・年式を確認してください。",
    empty:
      "この米国モデルイヤーの照会では記録が返されませんでした。不具合や他市場のリコールがないという意味ではありません。",
    scope: "米国情報源のモデル名",
    checked: "取得日時",
    stale:
      "キャッシュの取得から6時間以上経過しています。最新情報は公式情報源で確認してください。",
    evidence: "米国の公式リコール・適用確認が必要",
    details: "原文の詳細と改善措置を読む",
    consequence: "安全上の影響",
    remedy: "メーカーの改善措置",
    reportDate: "情報源の報告日",
    open: "公式リコール記録を開く",
    more: "さらに表示",
    fewer: "表示を減らす",
    market: "自分の車両への適用を確認",
    marketText:
      "米国の記録は欧州・日本向け車両、エンジン、生産日とは異なる場合があります。車台番号への適用と実施状況はメーカーや正規販売店に確認してください。この照会では車台番号を送信しません。",
    kba: "ドイツの公式リコール検索（KBA）",
    nhtsa: "米国の公式リコール検索（NHTSA）",
    original: "情報源の原文です。AIによる生成や翻訳はしていません。",
    cache:
      "共有サーバーキャッシュ・アクセス時に6時間ごとに更新。報告書全体、画像、新しいデータのコピーはガレージに保存しません。",
    park: "情報源からの警告：運転しないでください。公式リコールを読み、メーカーに連絡してください。",
    outside:
      "情報源からの警告：屋外に駐車してください。公式リコールの指示を確認してください。",
    local: "確認済みの不具合参考情報",
    localNote:
      "点検報告と技術情報は、ライブリコール情報の取得中も表示されます。",
    localEmpty:
      "この仕様に一致する確認済みの不具合情報はまだありません。情報の不足であり、安全性の保証ではありません。",
    coverage: "選択可能な全車種の情報源対応状況",
    coverageNote:
      "すべてのカタログ車両に情報源の対応方針を明示しています。照会可能でも、不具合の存在や全エンジン・市場の対応を保証するものではありません。",
    lookup: "米国モデル一覧を照会・正確な適用は要確認",
    gap: "米国データの対応なし・公式検索と確認済み参考資料を参照",
    prototype: "コンセプトカー：量産車の不具合情報を付与しません",
    history: "ヒストリックモデル：情報源の追加確認が必要",
  },
};
