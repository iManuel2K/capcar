"use client";

import { useId, useState } from "react";
import { checklistItems } from "@/features/journal/checklist-ui";
import type { AppLocale } from "@/i18n/config";
import styles from "./e90-launch-tools.module.css";

const copy = {
  de: {
    budget: "Was kostet dein nächster Umbau?",
    fields: ["Teile", "Versand", "Einbau und Lackierung", "Weitere Kosten"],
    total: "Geplantes Budget",
    empty: "Trage deine eigenen Schätzungen in Euro ein.",
    error:
      "Gib Beträge von 0 bis 100.000 € mit höchstens zwei Nachkommastellen ein.",
    checklist: "E90-Wartungscheckliste",
    print: "Checkliste drucken",
    record: "Datum · Kilometerstand · Arbeit · Teile · Kosten",
  },
  en: {
    budget: "What will your next upgrade cost?",
    fields: ["Parts", "Shipping", "Fitting and paint", "Other costs"],
    total: "Planned budget",
    empty: "Enter your own estimates in euros.",
    error: "Enter amounts from €0 to €100,000 with up to two decimal places.",
    checklist: "E90 maintenance checklist",
    print: "Print checklist",
    record: "Date · Mileage · Job · Parts · Cost",
  },
  el: {
    budget: "Πόσο θα κοστίσει η επόμενη αλλαγή;",
    fields: ["Ανταλλακτικά", "Μεταφορικά", "Τοποθέτηση και βαφή", "Άλλα έξοδα"],
    total: "Εκτιμώμενο σύνολο",
    empty: "Βάλε τις δικές σου εκτιμήσεις σε ευρώ.",
    error: "Βάλε ποσά από 0 έως 100.000 € με έως δύο δεκαδικά ψηφία.",
    checklist: "Λίστα συντήρησης E90",
    print: "Εκτύπωσε τη λίστα",
    record: "Ημερομηνία · Χιλιόμετρα · Εργασία · Ανταλλακτικά · Κόστος",
  },
  sq: {
    budget: "Sa do të kushtojë modifikimi i radhës?",
    fields: ["Pjesët", "Transporti", "Montimi dhe lyerja", "Kosto të tjera"],
    total: "Buxheti i parashikuar",
    empty: "Vendos vlerësimet e tua në euro.",
    error:
      "Vendos shuma nga 0 deri në 100.000 € me deri në dy shifra dhjetore.",
    checklist: "Lista e mirëmbajtjes për E90",
    print: "Printo listën",
    record: "Data · Kilometrat · Puna · Pjesët · Kostoja",
  },
  ja: {
    budget: "次のカスタムにいくらかかる？",
    fields: ["部品代", "送料", "取り付け・塗装", "その他の費用"],
    total: "予算の合計",
    empty: "ご自身の見積もりをユーロで入力してください。",
    error: "0〜100,000ユーロの範囲で、小数点以下2桁まで入力してください。",
    checklist: "E90メンテナンスチェックリスト",
    print: "チェックリストを印刷",
    record: "日付 · 走行距離 · 作業 · 部品 · 費用",
  },
};

export function E90LaunchTools({ locale }: { locale: AppLocale }) {
  const t = copy[locale];
  const id = useId();
  const [values, setValues] = useState(["", "", "", ""]);
  const cents = values.map((value) => {
    const input = value.trim().replace(",", ".");
    if (!input) return 0;
    if (!/^\d+(\.\d{0,2})?$/.test(input) || Number(input) > 100_000) return NaN;
    return Math.round(Number(input) * 100);
  });
  const hasError = cents.some(Number.isNaN);
  const hasValues = values.some((value) => value.trim());
  const formattedTotal = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(cents.reduce((sum, amount) => sum + amount, 0) / 100);

  return (
    <div className="mt-12 space-y-8">
      <section className="border-foreground/15 bg-card/25 rounded-2xl border p-5 sm:p-7 print:hidden">
        <h2 className="text-2xl font-medium">{t.budget}</h2>
        <p id={`${id}-hint`} className="text-foreground/75 mt-2">
          {t.empty}
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {t.fields.map((label, index) => (
            <label key={label} className="grid gap-2 text-sm font-medium">
              {label} (€)
              <input
                inputMode="decimal"
                maxLength={12}
                value={values[index]}
                aria-invalid={Number.isNaN(cents[index])}
                aria-describedby={`${id}-hint${Number.isNaN(cents[index]) ? ` ${id}-result` : ""}`}
                onChange={(event) => {
                  const value = event.target.value;
                  setValues((old) =>
                    old.map((current, i) => (i === index ? value : current)),
                  );
                }}
                className="border-foreground/25 bg-background/60 focus-visible:outline-primary min-h-11 w-full rounded-lg border px-3 text-base focus-visible:outline-2"
              />
            </label>
          ))}
        </div>
        <div id={`${id}-result`} className="mt-5" aria-live="polite">
          {hasError ? (
            <p className="text-destructive">{t.error}</p>
          ) : (
            <p>
              {t.total}: <strong>{hasValues ? formattedTotal : "—"}</strong>
            </p>
          )}
        </div>
      </section>

      <section
        className={`${styles.printChecklist} border-foreground/15 rounded-2xl border p-5 sm:p-7`}
      >
        <h2 className="text-2xl font-medium">{t.checklist}</h2>
        <p className="text-foreground/75 mt-2 print:text-black">{t.record}</p>
        <ul className="mt-4 space-y-2">
          {checklistItems("bmw-318i-e90-kosten", locale).map(
            ({ id, label }) => (
              <li key={id}>
                <span aria-hidden="true">□ </span>
                {label}
              </li>
            ),
          )}
        </ul>
        <button
          type="button"
          onClick={() => window.print()}
          className="border-foreground/25 focus-visible:outline-primary mt-4 min-h-11 cursor-pointer rounded-lg border px-4 font-medium focus-visible:outline-2 print:hidden"
        >
          {t.print}
        </button>
      </section>
    </div>
  );
}
