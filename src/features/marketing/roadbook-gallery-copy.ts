import type { AppLocale } from "@/i18n/config";

// Lightweight public metadata: never import the map runtime or vehicle data here.
export const roadbookStylePreviews = [
  { id: "konstanz", name: "Konstanz" },
  { id: "reykjavik", name: "Reykjavík" },
  { id: "lissabon", name: "Lissabon" },
  { id: "wien", name: "Wien" },
  { id: "zurich", name: "Zürich" },
  { id: "venedig", name: "Venedig" },
  { id: "kyoto", name: "Kyoto" },
  { id: "marrakesch", name: "Marrakesch" },
  { id: "tokyo", name: "Tokyo" },
] as const;

export type RoadbookGalleryCopy = {
  title: string;
  description: string;
  hint: string;
  open: string;
  imageAlt: string;
  loading: string;
  error: string;
  retry: string;
  captions: readonly string[];
};

export const roadbookGalleryCopy: Record<AppLocale, RoadbookGalleryCopy> = {
  en: {
    title: "Your roads. Your point of view.",
    description:
      "One map, nine distinct styles. Find the look for your next drive.",
    hint: "Hover, focus or tap a style to explore. Previews show the same area of Europe.",
    open: "Open this style",
    imageAlt: "Roadbook map of Europe in the {style} style",
    loading: "Loading map preview…",
    error:
      "This preview could not load. You can still open the style in Roadbook.",
    retry: "Retry preview",
    captions: [
      "Clear lakeside daylight",
      "Cool stone and pale blue",
      "Sun-washed Atlantic warmth",
      "Warm stone and burgundy",
      "Precise neutral lines",
      "Parchment and lagoon",
      "Warm paper, charcoal roads",
      "Sand, ochre and palm",
      "Petrol-black night network",
    ],
  },
  de: {
    title: "Deine Straßen. Deine Perspektive.",
    description:
      "Eine Karte, neun eigene Stile. Finde den Look für deine nächste Ausfahrt.",
    hint: "Mit Maus, Tastatur oder Antippen erkunden. Alle Vorschauen zeigen denselben Ausschnitt Europas.",
    open: "Diesen Stil öffnen",
    imageAlt: "Roadbook-Karte von Europa im Stil {style}",
    loading: "Kartenvorschau wird geladen…",
    error:
      "Die Vorschau konnte nicht geladen werden. Du kannst den Stil trotzdem im Roadbook öffnen.",
    retry: "Vorschau erneut laden",
    captions: [
      "Klares Tageslicht am See",
      "Kühler Stein und Hellblau",
      "Sonnenwarme Atlantiktöne",
      "Warmer Stein und Burgunder",
      "Klare, neutrale Linien",
      "Pergament und Lagune",
      "Warmes Papier, dunkle Straßen",
      "Sand, Ocker und Palmen",
      "Petrolschwarzes Straßennetz bei Nacht",
    ],
  },
  el: {
    title: "Οι δρόμοι σου. Η δική σου ματιά.",
    description:
      "Ένας χάρτης, εννέα ξεχωριστά στυλ. Διάλεξε την όψη της επόμενης διαδρομής σου.",
    hint: "Πέρασε το ποντίκι, επίλεξε με το πληκτρολόγιο ή πάτησε ένα στυλ. Οι προεπισκοπήσεις δείχνουν την ίδια περιοχή της Ευρώπης.",
    open: "Άνοιξε αυτό το στυλ",
    imageAlt: "Χάρτης Roadbook της Ευρώπης στο στυλ {style}",
    loading: "Φόρτωση προεπισκόπησης χάρτη…",
    error:
      "Η προεπισκόπηση δεν φορτώθηκε. Μπορείς ακόμη να ανοίξεις το στυλ στο Roadbook.",
    retry: "Νέα φόρτωση",
    captions: [
      "Καθαρό φως δίπλα στη λίμνη",
      "Ψυχρή πέτρα και απαλό γαλάζιο",
      "Ζεστά χρώματα του Ατλαντικού",
      "Ζεστή πέτρα και μπορντό",
      "Καθαρές, ουδέτερες γραμμές",
      "Περγαμηνή και λιμνοθάλασσα",
      "Ζεστό χαρτί, σκούροι δρόμοι",
      "Άμμος, ώχρα και φοίνικες",
      "Σκοτεινό νυχτερινό δίκτυο σε πετρόλ",
    ],
  },
  sq: {
    title: "Rrugët e tua. Këndvështrimi yt.",
    description:
      "Një hartë, nëntë stile të veçanta. Gjej pamjen për udhëtimin tënd të radhës.",
    hint: "Eksploro me miun, tastierën ose prekjen. Parapamjet tregojnë të njëjtën zonë të Evropës.",
    open: "Hap këtë stil",
    imageAlt: "Hartë Roadbook e Evropës në stilin {style}",
    loading: "Po ngarkohet parapamja e hartës…",
    error:
      "Parapamja nuk u ngarkua. Mund ta hapësh gjithsesi stilin në Roadbook.",
    retry: "Riprovo parapamjen",
    captions: [
      "Dritë e kthjellët pranë liqenit",
      "Gur i ftohtë dhe blu e çelët",
      "Ngrohtësi diellore e Atlantikut",
      "Gur i ngrohtë dhe bordo",
      "Vija të qarta, neutrale",
      "Pergamenë dhe lagunë",
      "Letër e ngrohtë, rrugë të errëta",
      "Rërë, okër dhe palma",
      "Rrjet nate në petrol të errët",
    ],
  },
  ja: {
    title: "いつもの道を、自分らしい眺めで。",
    description:
      "ひとつの地図に、9つのスタイル。次のドライブに合う表情を選ぼう。",
    hint: "マウス、キーボード、タップで選べます。各プレビューはヨーロッパの同じ範囲を表示しています。",
    open: "このスタイルを開く",
    imageAlt: "{style}スタイルで表示したヨーロッパのRoadbook地図",
    loading: "地図のプレビューを読み込み中…",
    error:
      "プレビューを読み込めませんでした。Roadbookでこのスタイルを開くことはできます。",
    retry: "プレビューを再読み込み",
    captions: [
      "湖畔の澄んだ昼の光",
      "冷たい石と淡いブルー",
      "大西洋の陽だまりの色",
      "温かい石とバーガンディ",
      "端正なニュートラルの線",
      "羊皮紙とラグーン",
      "温かな紙とチャコールの道",
      "砂、黄土とヤシの色",
      "深いペトロール色の夜の道",
    ],
  },
};
