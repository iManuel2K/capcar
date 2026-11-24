import type { AppLocale } from "@/i18n/config";

const en = {
  heading: "Service record review",
  intro:
    "Use your connected AI to read photos of service records. CapCar compares the findings with this car's saved maintenance records and planning intervals.",
  fileLabel: "Service record photos",
  fileHint:
    "Choose up to 3 JPG, PNG or WebP photos of invoices or service book pages.",
  remove: "Remove photo",
  historyHeading: "Vehicle history cross-check",
  historyHelp:
    "Enter a dated odometer reading from a vehicle history report to compare it with the service records.",
  mileage: "Odometer reading in the report (km)",
  date: "Date of the reading",
  recallLink: "Find official recall references",
  consent:
    "I agree to send these photos and the car details needed for this review to my connected AI provider.",
  privacy:
    "Cover names, addresses, VINs and payment details first. CapCar does not save these photos or the review. Your AI provider's charges and data retention rules apply.",
  submit: "Review service records",
  reviewing: "Reviewing service records…",
  cancel: "Cancel review",
  clear: "Clear review",
  connect: "Connect an AI provider",
  results: "Maintenance overview",
  documented: "Documented",
  due: "Due by plan",
  unconfirmed: "Not confirmed",
  intervalNote:
    "Due dates and distances use CapCar's planning intervals, not the manufacturer's schedule. A missing record does not mean the work was skipped.",
  extracted: "What the AI found in the photos",
  garageRecord: "Saved in your garage",
  photo: "Photo",
  noDate: "Date not confirmed",
  noMileage: "Odometer reading not confirmed",
  target: "Next planning target",
  noEvidence: "The AI found no clear record of completed work in these photos.",
  warnings: {
    "history-mileage-conflict":
      "A report reading does not line up with the service records or the car's current odometer reading. Check the dates, units and vehicle before drawing conclusions.",
    "service-mileage-conflict":
      "Some service readings are out of order. Compare them with the original records.",
    "unreadable-photos":
      "One or more photos did not show clear evidence of completed work. Try a sharper photo or another page.",
    "uncertain-service-dates":
      "Some service dates could not be confirmed. Check the originals before relying on a planning target.",
  },
  noPhotos: "Add at least one service record photo.",
  invalidImage: "Choose a JPG, PNG or WebP photo.",
  imageTooLarge: "This photo is too large. Try a smaller copy.",
  imageFailed: "This photo could not be opened. Try a different copy.",
  maxPhotos: "You can review up to 3 photos at a time.",
  missingConsent:
    "Confirm that your connected AI can receive the photos and car details.",
  invalidHistory:
    "Enter a valid report date and an odometer reading in kilometres, or leave both blank.",
  requestFailed: "The review did not finish. Your photos are still selected.",
  connectionRequired:
    "Connect your own AI provider in Account → Connections to run a review.",
  providerUnavailable:
    "Your connected AI could not review the photos. Check that its model supports images, then try again.",
  retry: "Try again",
  notSaved:
    "Check each result against the original document before saving it to Garage.",
};

export const serviceReviewCopy = {
  en,
  de: {
    heading: "Servicenachweise prüfen",
    intro:
      "Dein verbundener KI-Anbieter liest Fotos von Servicenachweisen. CapCar vergleicht die Angaben mit den gespeicherten Wartungseinträgen und Planungsintervallen für dieses Fahrzeug.",
    fileLabel: "Fotos von Servicenachweisen",
    fileHint:
      "Wähle bis zu 3 JPG-, PNG- oder WebP-Fotos von Rechnungen oder Serviceheftseiten.",
    remove: "Foto entfernen",
    historyHeading: "Fahrzeughistorie abgleichen",
    historyHelp:
      "Wenn du einen Bericht zur Fahrzeughistorie hast, gib einen datierten Kilometerstand zum Abgleich ein.",
    mileage: "Kilometerstand laut Bericht (km)",
    date: "Datum der Ablesung",
    recallLink: "Offizielle Rückrufinformationen finden",
    consent:
      "Ich bin damit einverstanden, dass diese Fotos und die für die Prüfung nötigen Fahrzeugdaten an meinen verbundenen KI-Anbieter gesendet werden.",
    privacy:
      "Decke Namen, Adressen, Fahrzeug-Identifizierungsnummern (FIN) und Zahlungsdaten vorher ab. CapCar speichert die Fotos und die Auswertung nicht. Es gelten die Kosten und Aufbewahrungsregeln deines KI-Anbieters.",
    submit: "Servicenachweise prüfen",
    reviewing: "Servicenachweise werden geprüft …",
    cancel: "Prüfung abbrechen",
    clear: "Auswertung zurücksetzen",
    connect: "KI-Anbieter verbinden",
    results: "Wartungsübersicht",
    documented: "Dokumentiert",
    due: "Laut Plan fällig",
    unconfirmed: "Nicht bestätigt",
    intervalNote:
      "Die Termine und Kilometerstände beruhen auf den Planungsintervallen von CapCar, nicht auf Herstellervorgaben. Ein fehlender Eintrag bedeutet nicht, dass die Arbeit unterblieben ist.",
    extracted: "Was die KI auf den Fotos gefunden hat",
    garageRecord: "In deiner Garage gespeichert",
    photo: "Foto",
    noDate: "Datum nicht bestätigt",
    noMileage: "Kilometerstand nicht bestätigt",
    target: "Nächster Planungswert",
    noEvidence:
      "Die KI hat auf diesen Fotos keinen eindeutigen Nachweis für erledigte Arbeiten gefunden.",
    warnings: {
      "history-mileage-conflict":
        "Ein Kilometerstand aus dem Bericht passt nicht zu den Servicenachweisen oder zum aktuellen Kilometerstand. Prüfe Datum, Einheit und Fahrzeug, bevor du daraus Schlüsse ziehst.",
      "service-mileage-conflict":
        "Einige Kilometerstände in den Servicenachweisen passen nicht zur zeitlichen Reihenfolge. Vergleiche sie mit den Originalen.",
      "unreadable-photos":
        "Aus mindestens einem Foto gingen keine erledigten Arbeiten eindeutig hervor. Versuche es mit einem schärferen Foto oder einer anderen Seite.",
      "uncertain-service-dates":
        "Einige Servicedaten ließen sich nicht bestätigen. Prüfe die Originale, bevor du einen Planungswert übernimmst.",
    },
    noPhotos: "Füge mindestens ein Foto eines Servicenachweises hinzu.",
    invalidImage: "Wähle ein JPG-, PNG- oder WebP-Foto.",
    imageTooLarge:
      "Dieses Foto ist zu groß. Versuche es mit einer kleineren Kopie.",
    imageFailed:
      "Dieses Foto konnte nicht geöffnet werden. Versuche es mit einer anderen Kopie.",
    maxPhotos: "Du kannst bis zu 3 Fotos auf einmal prüfen.",
    missingConsent:
      "Bestätige, dass deine verbundene KI die Fotos und Fahrzeugdaten erhalten darf.",
    invalidHistory:
      "Gib ein gültiges Berichtsdatum und einen Kilometerstand in Kilometern ein oder lass beide Felder leer.",
    requestFailed:
      "Die Prüfung wurde nicht abgeschlossen. Deine Fotos bleiben ausgewählt.",
    connectionRequired:
      "Verbinde unter Konto → Verbindungen deinen eigenen KI-Anbieter, um die Prüfung zu starten.",
    providerUnavailable:
      "Deine verbundene KI konnte die Fotos nicht prüfen. Prüfe, ob das Modell Bilder unterstützt, und versuche es erneut.",
    retry: "Erneut versuchen",
    notSaved: "Vergleiche die Ergebnisse vor dem Speichern mit den Originalen.",
  },
  el: {
    heading: "Έλεγχος αρχείου σέρβις",
    intro:
      "Χρησιμοποίησε τη συνδεδεμένη ΤΝ για να διαβάσεις φωτογραφίες παραστατικών σέρβις. Το CapCar συγκρίνει τα ευρήματα με τις αποθηκευμένες εργασίες συντήρησης και τα διαστήματα προγραμματισμού του οχήματος.",
    fileLabel: "Φωτογραφίες παραστατικών σέρβις",
    fileHint:
      "Επίλεξε έως 3 φωτογραφίες JPG, PNG ή WebP από τιμολόγια ή σελίδες του βιβλίου σέρβις.",
    remove: "Αφαίρεση φωτογραφίας",
    historyHeading: "Διασταύρωση ιστορικού οχήματος",
    historyHelp:
      "Αν έχεις αναφορά ιστορικού οχήματος, πρόσθεσε μια ένδειξη χιλιομετρητή μαζί με την ημερομηνία της για σύγκριση.",
    mileage: "Ένδειξη χιλιομετρητή στην αναφορά (χλμ.)",
    date: "Ημερομηνία καταγραφής",
    recallLink: "Επίσημες πληροφορίες ανακλήσεων",
    consent:
      "Συμφωνώ να σταλούν αυτές οι φωτογραφίες και τα στοιχεία του οχήματος που χρειάζονται για τον έλεγχο στον συνδεδεμένο πάροχο ΤΝ.",
    privacy:
      "Κάλυψε πρώτα ονόματα, διευθύνσεις, αριθμούς πλαισίου (VIN) και στοιχεία πληρωμής. Το CapCar δεν αποθηκεύει τις φωτογραφίες ή την αξιολόγηση. Ισχύουν οι χρεώσεις και οι κανόνες διατήρησης δεδομένων του παρόχου ΤΝ.",
    submit: "Έλεγχος παραστατικών σέρβις",
    reviewing: "Γίνεται έλεγχος παραστατικών σέρβις…",
    cancel: "Ακύρωση ελέγχου",
    clear: "Εκκαθάριση αξιολόγησης",
    connect: "Σύνδεση παρόχου ΤΝ",
    results: "Επισκόπηση συντήρησης",
    documented: "Τεκμηριωμένο",
    due: "Εκκρεμεί βάσει πλάνου",
    unconfirmed: "Μη επιβεβαιωμένο",
    intervalNote:
      "Οι ημερομηνίες και τα χιλιόμετρα βασίζονται στα διαστήματα προγραμματισμού του CapCar, όχι στο πρόγραμμα του κατασκευαστή. Η απουσία καταχώρισης δεν σημαίνει ότι η εργασία δεν έγινε.",
    extracted: "Τι εντόπισε η ΤΝ στις φωτογραφίες",
    garageRecord: "Αποθηκευμένο στο γκαράζ σου",
    photo: "Φωτογραφία",
    noDate: "Μη επιβεβαιωμένη ημερομηνία",
    noMileage: "Μη επιβεβαιωμένη ένδειξη χιλιομετρητή",
    target: "Επόμενος στόχος προγραμματισμού",
    noEvidence:
      "Η ΤΝ δεν εντόπισε σαφές παραστατικό ολοκληρωμένης εργασίας σε αυτές τις φωτογραφίες.",
    warnings: {
      "history-mileage-conflict":
        "Μια ένδειξη της αναφοράς δεν συμφωνεί με τα παραστατικά σέρβις ή τον τρέχοντα χιλιομετρητή. Έλεγξε ημερομηνίες, μονάδες και όχημα πριν βγάλεις συμπέρασμα.",
      "service-mileage-conflict":
        "Ορισμένες ενδείξεις χιλιομετρητή δεν ακολουθούν τη χρονική σειρά. Σύγκρινέ τις με τα πρωτότυπα παραστατικά.",
      "unreadable-photos":
        "Μία ή περισσότερες φωτογραφίες δεν έδειξαν σαφή τεκμήρια ολοκληρωμένης εργασίας. Δοκίμασε πιο καθαρή φωτογραφία ή άλλη σελίδα.",
      "uncertain-service-dates":
        "Ορισμένες ημερομηνίες σέρβις δεν επιβεβαιώθηκαν. Έλεγξε τα πρωτότυπα πριν χρησιμοποιήσεις έναν στόχο προγραμματισμού.",
    },
    noPhotos: "Πρόσθεσε τουλάχιστον μία φωτογραφία παραστατικού σέρβις.",
    invalidImage: "Επίλεξε φωτογραφία JPG, PNG ή WebP.",
    imageTooLarge:
      "Η φωτογραφία είναι πολύ μεγάλη. Δοκίμασε μικρότερο αντίγραφο.",
    imageFailed: "Η φωτογραφία δεν άνοιξε. Δοκίμασε άλλο αντίγραφο.",
    maxPhotos: "Μπορείς να ελέγξεις έως 3 φωτογραφίες κάθε φορά.",
    missingConsent:
      "Επιβεβαίωσε ότι ο συνδεδεμένος πάροχος ΤΝ μπορεί να λάβει τις φωτογραφίες και τα στοιχεία του οχήματος.",
    invalidHistory:
      "Καταχώρισε έγκυρη ημερομηνία αναφοράς και ένδειξη χιλιομετρητή σε χιλιόμετρα ή άφησε και τα δύο πεδία κενά.",
    requestFailed:
      "Ο έλεγχος δεν ολοκληρώθηκε. Οι φωτογραφίες σου παραμένουν επιλεγμένες.",
    connectionRequired:
      "Σύνδεσε τον δικό σου πάροχο ΤΝ στον Λογαριασμό → Συνδέσεις για να κάνεις έλεγχο.",
    providerUnavailable:
      "Η συνδεδεμένη ΤΝ δεν μπόρεσε να ελέγξει τις φωτογραφίες. Βεβαιώσου ότι το μοντέλο υποστηρίζει εικόνες και δοκίμασε ξανά.",
    retry: "Δοκίμασε ξανά",
    notSaved: "Έλεγξε τα αποτελέσματα με τα πρωτότυπα πριν από την αποθήκευση.",
  },
  sq: {
    heading: "Kontrolli i dokumenteve të servisit",
    intro:
      "Përdor IA-në e lidhur për të lexuar fotografitë e dokumenteve të servisit. CapCar i krahason gjetjet me historikun e ruajtur të mirëmbajtjes dhe intervalet e planifikimit për këtë makinë.",
    fileLabel: "Fotografitë e dokumenteve të servisit",
    fileHint:
      "Zgjidh deri në 3 fotografi JPG, PNG ose WebP të faturave ose faqeve të librezës së servisit.",
    remove: "Hiq fotografinë",
    historyHeading: "Krahasimi me historikun e makinës",
    historyHelp:
      "Nëse ke raport të historikut të makinës, shkruaj leximin e kilometrazhit dhe datën për krahasim.",
    mileage: "Kilometrazhi në raport (km)",
    date: "Data e leximit",
    recallLink: "Gjej njoftimet zyrtare për tërheqje",
    consent:
      "Pranoj që këto fotografi dhe të dhënat e makinës që duhen për kontrollin t'i dërgohen ofruesit tim të lidhur të IA-së.",
    privacy:
      "Mbulo më parë emrat, adresat, numrin e shasisë (VIN) dhe të dhënat e pagesës. CapCar nuk i ruan fotografitë ose vlerësimin. Zbatohen tarifat dhe rregullat e ruajtjes së të dhënave të ofruesit tënd të IA-së.",
    submit: "Kontrollo dokumentet e servisit",
    reviewing: "Po kontrollohen dokumentet e servisit…",
    cancel: "Anulo kontrollin",
    clear: "Pastro vlerësimin",
    connect: "Lidh një ofrues të IA-së",
    results: "Përmbledhje e mirëmbajtjes",
    documented: "E dokumentuar",
    due: "I ka ardhur afati sipas planit",
    unconfirmed: "E pakonfirmuar",
    intervalNote:
      "Datat dhe kilometrazhi bazohen në intervalet e planifikimit të CapCar, jo në planin e prodhuesit. Mungesa e dokumentit nuk do të thotë se puna nuk është kryer.",
    extracted: "Çfarë gjeti IA-ja në fotografi",
    garageRecord: "E ruajtur në garazhin tënd",
    photo: "Fotografia",
    noDate: "Datë e pakonfirmuar",
    noMileage: "Kilometrazh i pakonfirmuar",
    target: "Afati i ardhshëm sipas planit",
    noEvidence:
      "IA-ja nuk gjeti dokumentim të qartë të punëve të kryera në këto fotografi.",
    warnings: {
      "history-mileage-conflict":
        "Një lexim nga raporti nuk përputhet me dokumentet e servisit ose kilometrazhin aktual. Kontrollo datat, njësitë dhe makinën para se të nxjerrësh përfundime.",
      "service-mileage-conflict":
        "Disa lexime të kilometrazhit nuk përputhen me rendin e datave. Krahasoji me dokumentet origjinale.",
      "unreadable-photos":
        "Një ose më shumë fotografi nuk treguan qartë punë të kryera. Provo një fotografi më të qartë ose një faqe tjetër.",
      "uncertain-service-dates":
        "Disa data servisi nuk mund të konfirmoheshin. Kontrollo dokumentet origjinale para se të mbështetesh te afati i planifikuar.",
    },
    noPhotos: "Shto të paktën një fotografi të një dokumenti servisi.",
    invalidImage: "Zgjidh një fotografi JPG, PNG ose WebP.",
    imageTooLarge:
      "Kjo fotografi është tepër e madhe. Provo një kopje më të vogël.",
    imageFailed: "Kjo fotografi nuk u hap. Provo një kopje tjetër.",
    maxPhotos: "Mund të kontrollosh deri në 3 fotografi njëherësh.",
    missingConsent:
      "Konfirmo që ofruesi i lidhur i IA-së mund t'i marrë fotografitë dhe të dhënat e makinës.",
    invalidHistory:
      "Shkruaj një datë të vlefshme dhe kilometrazhin në kilometra, ose lëri të dyja fushat bosh.",
    requestFailed: "Kontrolli nuk përfundoi. Fotografitë mbeten të zgjedhura.",
    connectionRequired:
      "Lidh ofruesin tënd të IA-së te Llogaria → Lidhjet për të kryer kontrollin.",
    providerUnavailable:
      "IA-ja e lidhur nuk mundi t'i kontrollonte fotografitë. Kontrollo nëse modeli mbështet imazhet dhe provo përsëri.",
    retry: "Provo përsëri",
    notSaved:
      "Krahaso rezultatet me dokumentet origjinale përpara se t’i ruash.",
  },
  ja: {
    heading: "整備記録のレビュー",
    intro:
      "接続済みのAIで整備記録の写真を読み取ります。CapCarは、読み取った内容をこの車のガレージに保存した整備記録や計画用の目安と照合します。",
    fileLabel: "整備記録の写真",
    fileHint: "請求書や整備手帳の写真を、JPG・PNG・WebP形式で3枚まで選べます。",
    remove: "写真を削除",
    historyHeading: "車両履歴との照合",
    historyHelp:
      "車両履歴レポートがあれば、記載された走行距離とその日付を入力して照合できます。",
    mileage: "レポートに記載された走行距離（km）",
    date: "走行距離の記録日",
    recallLink: "公式のリコール情報を確認",
    consent:
      "この写真とレビューに必要な車両情報を、接続済みのAI事業者に送信することに同意します。",
    privacy:
      "氏名、住所、車台番号（VIN）、支払い情報は事前に隠してください。CapCarは写真やレビュー内容を保存しません。料金とデータの保管期間には、AI事業者の規定が適用されます。",
    submit: "整備記録をレビュー",
    reviewing: "整備記録を確認中…",
    cancel: "レビューをキャンセル",
    clear: "レビューをクリア",
    connect: "AI事業者に接続",
    results: "整備状況の概要",
    documented: "記録あり",
    due: "計画上の時期に到達",
    unconfirmed: "未確認",
    intervalNote:
      "期日と距離はCapCarの計画用の目安に基づき、メーカー指定の整備時期とは異なります。記録が見つからなくても、整備が行われなかったとは限りません。",
    extracted: "AIが写真から読み取った内容",
    garageRecord: "ガレージに保存済み",
    photo: "写真",
    noDate: "日付未確認",
    noMileage: "走行距離未確認",
    target: "次回時期の目安",
    noEvidence:
      "これらの写真からは、完了した整備を示す明確な記録を読み取れませんでした。",
    warnings: {
      "history-mileage-conflict":
        "レポートの走行距離が、整備記録または現在の走行距離と一致しません。判断する前に日付、単位、対象車両を確認してください。",
      "service-mileage-conflict":
        "走行距離の記録に、日付順と一致しないものがあります。原本と照合してください。",
      "unreadable-photos":
        "完了した整備を確認できない写真があります。より鮮明な写真や別のページを試してください。",
      "uncertain-service-dates":
        "日付を確認できない整備記録があります。次回時期の目安を使う前に原本を確認してください。",
    },
    noPhotos: "整備記録の写真を1枚以上追加してください。",
    invalidImage: "JPG・PNG・WebP形式の写真を選んでください。",
    imageTooLarge:
      "この写真はサイズが大きすぎます。小さいサイズにしてからお試しください。",
    imageFailed: "この写真を開けませんでした。別のファイルをお試しください。",
    maxPhotos: "一度にレビューできる写真は3枚までです。",
    missingConsent: "接続済みのAIへの写真と車両情報の送信に同意してください。",
    invalidHistory:
      "有効な日付と走行距離（km）を入力するか、両方を空欄にしてください。",
    requestFailed:
      "レビューが完了しませんでした。写真の選択は保持されています。",
    connectionRequired:
      "レビューするには、アカウント → 接続設定でご自身のAI事業者に接続してください。",
    providerUnavailable:
      "接続済みのAIで写真を確認できませんでした。モデルが画像に対応しているか確認して、再度お試しください。",
    retry: "もう一度試す",
    notSaved: "保存する前に、結果を原本と照合してください。",
  },
} satisfies Record<AppLocale, typeof en>;
