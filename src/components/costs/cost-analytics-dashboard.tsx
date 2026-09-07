"use client";

import { AlertTriangle, BadgeEuro, Plus, TrendingUp, WalletCards } from "lucide-react";
import { useState } from "react";

import {
  announceCostChange,
  saveCostEntry,
  setVehicleBudget,
  summarizeVehicleCosts,
} from "@/features/costs/cost-storage";
import { useCostState } from "@/features/costs/use-costs";
import { useVehicles } from "@/features/vehicles/use-vehicles";

const categoryStyle = {
  parts: { label: "Parts spend", color: "#e72d45" },
  labor: { label: "Labor cost", color: "#f59e0b" },
  maintenance: { label: "Maintenance", color: "#34d399" },
} as const;

export function CostAnalyticsDashboard({ vehicleId }: { vehicleId: string }) {
  const { vehicles } = useVehicles();
  const vehicle = vehicles.find((item) => item.id === vehicleId);
  const state = useCostState();
  const summary = summarizeVehicleCosts(vehicleId, state);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState("");
  if (!vehicle) return <div className="py-32 text-center text-white/45">Vehicle not found.</div>;
  const percent = summary.budget > 0 ? Math.min(100, (summary.total / summary.budget) * 100) : 0;
  const over = summary.total > summary.budget;

  return <div className="pb-24 sm:pb-0">
    <header className="flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_84%_12%,rgba(231,45,69,0.2),transparent_30%),#111111] p-6 sm:p-10 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-semibold tracking-[0.15em] text-[#ff667a] uppercase">True cost of ownership</p><h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">Know where the money went.</h1><p className="mt-4 max-w-2xl leading-7 text-white/45">Parts, labor and maintenance against one budget cap for your {vehicle.model}.</p></div><button onClick={() => setFormOpen((value) => !value)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-white"><Plus className="size-4" /> Add expense</button></header>

    {formOpen && <CostForm vehicleId={vehicleId} onClose={() => setFormOpen(false)} onError={setError} />}
    {error && <p role="alert" className="mt-5 rounded-xl border border-red-300/15 bg-red-300/6 p-4 text-sm text-red-100/75">{error}</p>}

    <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <article className="rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-8"><div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs tracking-[0.14em] text-white/30 uppercase">Budget position</p><p className="mt-3 text-4xl font-medium tracking-[-0.04em]">{formatEuro(summary.total)}</p><p className="mt-2 text-sm text-white/35">of {formatEuro(summary.budget)} cap</p></div><BudgetEditor vehicleId={vehicleId} budget={summary.budget} /></div><div className="mt-8 h-3 overflow-hidden rounded-full bg-white/8"><div className={`h-full origin-left rounded-full transition-[width] duration-700 ${over ? "bg-red-400" : percent > 80 ? "bg-amber-300" : "bg-[#e72d45]"}`} style={{ width: `${percent}%` }} /></div><div className="mt-3 flex items-center justify-between text-xs"><span className="text-white/30">{Math.round(percent)}% used</span><span className={over ? "text-red-200" : "text-white/40"}>{over ? `${formatEuro(summary.total - summary.budget)} over cap` : `${formatEuro(summary.budget - summary.total)} remaining`}</span></div>{percent >= 80 && <div className={`mt-6 flex gap-3 rounded-xl border p-4 text-sm ${over ? "border-red-300/15 bg-red-300/6 text-red-100/70" : "border-amber-300/15 bg-amber-300/6 text-amber-100/70"}`}><AlertTriangle className="mt-0.5 size-4 shrink-0" />{over ? "This vehicle is over its current budget cap." : "This vehicle has used more than 80% of its budget."}</div>}</article>
      <article className="rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-8"><p className="text-xs tracking-[0.14em] text-white/30 uppercase">Cost split</p><CostDonut categories={summary.categories} total={summary.total} /><div className="mt-6 grid gap-3">{Object.entries(categoryStyle).map(([key, item]) => <div key={key} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-white/45"><span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span><span className="font-medium text-white/75">{formatEuro(summary.categories[key as keyof typeof summary.categories])}</span></div>)}</div></article>
    </section>

    <section className="mt-5 rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-8"><div className="flex items-center gap-2"><TrendingUp className="size-4 text-[#ff667a]" /><h2 className="text-xl font-medium">Recorded expenses</h2></div>{summary.entries.length === 0 ? <div className="mt-7 flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 text-center"><WalletCards className="size-8 text-white/18" /><p className="mt-4 text-sm text-white/38">No costs recorded yet. Add the first invoice or purchase.</p></div> : <div className="mt-6 divide-y divide-white/8">{summary.entries.map((entry) => <div key={entry.id} className="flex items-center justify-between gap-4 py-4"><div><p className="font-medium text-white/80">{entry.label}</p><p className="mt-1 text-xs text-white/30">{categoryStyle[entry.category].label} · {entry.occurredOn}</p></div><p className="font-medium">{formatEuro(entry.amount)}</p></div>)}</div>}</section>
  </div>;
}

function BudgetEditor({ vehicleId, budget }: { vehicleId: string; budget: number }) { const [editing, setEditing] = useState(false); const [value, setValue] = useState(String(budget)); function save() { setVehicleBudget(vehicleId, Number(value), window.localStorage); announceCostChange(); setEditing(false); } return editing ? <div className="flex gap-2"><input aria-label="Budget cap" type="number" min="0" value={value} onChange={(event) => setValue(event.target.value)} className="min-h-10 w-32 rounded-xl border border-white/10 bg-[#0c0c0c] px-3 text-sm" /><button onClick={save} className="rounded-xl bg-white px-3 text-xs font-semibold text-black">Save</button></div> : <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/50"><BadgeEuro className="size-3.5" /> Edit cap</button>; }
function CostForm({ vehicleId, onClose, onError }: { vehicleId: string; onClose: () => void; onError: (value: string) => void }) { function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); try { saveCostEntry({ vehicleId, label: String(form.get("label") ?? ""), category: String(form.get("category")) as "parts" | "labor" | "maintenance", amount: Number(form.get("amount")), occurredOn: String(form.get("date")) }, window.localStorage); announceCostChange(); onError(""); onClose(); } catch (caught) { onError(caught instanceof Error ? caught.message : "Could not save expense."); } } return <form onSubmit={submit} className="mt-5 rounded-[2rem] border border-[#e72d45]/20 bg-[#151010] p-5 sm:p-8"><div className="grid gap-4 md:grid-cols-4"><label className="text-xs text-white/45 md:col-span-2">Expense<input name="label" required placeholder="Rear lights" className="mt-2 min-h-12 w-full rounded-xl border border-white/12 bg-[#0b0b0b] px-4 text-sm placeholder:text-white/20" /></label><label className="text-xs text-white/45">Category<select name="category" className="mt-2 min-h-12 w-full rounded-xl border border-white/12 bg-[#0b0b0b] px-4 text-sm"><option value="parts">Parts</option><option value="labor">Labor</option><option value="maintenance">Maintenance</option></select></label><label className="text-xs text-white/45">Amount (€)<input name="amount" type="number" min="0.01" step="0.01" required className="mt-2 min-h-12 w-full rounded-xl border border-white/12 bg-[#0b0b0b] px-4 text-sm" /></label><label className="text-xs text-white/45">Date<input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="mt-2 min-h-12 w-full rounded-xl border border-white/12 bg-[#0b0b0b] px-4 text-sm" /></label></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-white/10 px-4 text-sm text-white/50">Cancel</button><button className="min-h-11 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-white">Save expense</button></div></form>; }
function CostDonut({ categories, total }: { categories: { parts: number; labor: number; maintenance: number }; total: number }) { const stops = total === 0 ? [0, 0] : [(categories.parts / total) * 100, ((categories.parts + categories.labor) / total) * 100]; return <div className="mx-auto mt-7 grid size-44 place-items-center rounded-full" style={{ background: total === 0 ? "#1c1c1c" : `conic-gradient(#e72d45 0 ${stops[0]}%, #f59e0b ${stops[0]}% ${stops[1]}%, #34d399 ${stops[1]}% 100%)` }}><div className="grid size-30 place-items-center rounded-full bg-[#111111] text-center"><div><p className="text-xl font-medium">{formatEuro(total)}</p><p className="mt-1 text-[10px] text-white/30 uppercase">Total</p></div></div></div>; }
function formatEuro(value: number) { return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value); }
