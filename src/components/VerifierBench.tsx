"use client";

import { useState } from "react";
import { useLang, useT } from "./lang";
import { useInView } from "./motion";

// Measured 2026-09-20 on 60 fax-quality documents (Lama, specialist-intake.md
// step 6). Opus's cost is "≈ 2.5× Sonnet" in the source, not a priced figure.
const MODELS = [
  { id: "haiku", name: "Claude Haiku 4.5", accuracy: 0.65, catches: 15, falseAlarms: 68, bothWrong: 86, cost: 0.003688, approx: false },
  { id: "sonnet", name: "Claude Sonnet 5", accuracy: 0.907, catches: 70, falseAlarms: 10, bothWrong: 31, cost: 0.007376, approx: false },
  { id: "opus", name: "Claude Opus 5", accuracy: 0.918, catches: 74, falseAlarms: 9, bothWrong: 27, cost: 0.007376 * 2.5, approx: true },
] as const;

const SCALE = 80;
const BASELINE = 0.771;

export function VerifierBench() {
  const t = useT().lama.bench;
  const { lang } = useLang();
  const [sel, setSel] = useState<(typeof MODELS)[number]["id"]>("sonnet");
  // Bars grow and the fax dots slide down from the clean score once this is on screen.
  const [ref, seen] = useInView<HTMLDivElement>();

  const pct = (n: number) =>
    new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US", { style: "percent", maximumFractionDigits: 1 }).format(n);
  const usd = (n: number) =>
    new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency: "USD",
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 4,
    }).format(n);

  return (
    <div ref={ref} className="sheet rounded-sm p-4 sm:p-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {MODELS.map((m) => {
          const active = m.id === sel;
          return (
            <button
              key={m.id}
              onClick={() => setSel(m.id)}
              aria-pressed={active}
              className={`relative rounded-sm border p-4 text-left transition-colors ${
                active ? "border-ink bg-paper" : "border-rule hover:border-ink-faint"
              }`}
            >
              {m.id === "sonnet" && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-ok px-2 py-0.5 font-mono text-[10px] uppercase text-on-ok">
                  {t.chosen}
                </span>
              )}
              <span className="block text-sm font-medium">{m.name}</span>
              <span className="display mt-3 block text-4xl">{pct(m.accuracy)}</span>
              <span className="block text-xs text-ink-faint">{t.cols.accuracy}</span>

              <span className="mt-4 block space-y-1.5">
                <Bar label={t.cols.catches} value={seen ? m.catches : 0} shown={m.catches} color="var(--annot)" />
                <Bar label={t.cols.falseAlarms} value={seen ? m.falseAlarms : 0} shown={m.falseAlarms} color="var(--flag)" />
              </span>

              <span className="mt-4 flex justify-between border-t border-rule pt-2 text-xs text-ink-soft">
                <span>{t.cols.bothWrong}</span>
                <span className="font-mono">{m.bothWrong}</span>
              </span>
              <span className="mt-1 flex justify-between text-xs text-ink-soft">
                <span>{t.cols.cost}</span>
                <span className="font-mono">
                  {m.approx ? "≈ " : ""}
                  {usd(m.cost)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 min-h-[2.5rem] text-sm text-ink" aria-live="polite">
        <span className="font-medium">{MODELS.find((m) => m.id === sel)!.name}</span> — {t.verdicts[sel]}
      </p>
      <p className="text-xs text-ink-faint">
        {lang === "fr" ? "Spécialiste seul en qualité fax" : "Specialist alone at fax quality"} : {pct(BASELINE)}
      </p>

      <h4 className="mt-6 font-mono text-[11px] uppercase tracking-wider text-ink-faint">{t.routingTitle}</h4>
      <div className="mt-3 space-y-4">
        {t.routing.map((r, i) => {
          const from = i === 0 ? 96.7 : 100;
          const to = i === 0 ? 53.8 : 98.3;
          return (
            <div key={r.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span>{r.label}</span>
                <span className={`font-mono text-xs ${i === 0 ? "text-flag" : "text-ink-faint"}`}>{r.drop}</span>
              </div>
              <div className="relative mx-3 mb-5 mt-6 h-6">
                <div className="absolute inset-x-0 top-1/2 h-px bg-rule" />
                <div
                  className={`absolute top-1/2 h-[3px] -translate-y-1/2 transition-all delay-300 duration-1000 ${i === 0 ? "bg-flag" : "bg-ink-faint/50"}`}
                  style={{ left: `${seen ? to : from}%`, width: `${seen ? from - to : 0}%` }}
                />
                <Dot at={from} label={r.from} hollow />
                <Dot at={seen ? to : from} label={r.to} moving />
              </div>
            </div>
          );
        })}
        <div className="flex justify-between font-mono text-[10px] text-ink-faint">
          <span>0 %</span>
          <span>
            {lang === "fr" ? "○ scan net · ● qualité fax" : "○ clean scan · ● fax quality"}
          </span>
          <span>100 %</span>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">{t.routingNote}</p>
    </div>
  );
}

function Bar({ label, value, shown, color }: { label: string; value: number; shown: number; color: string }) {
  return (
    <span className="block">
      <span className="flex justify-between text-[11px] text-ink-soft">
        <span>{label}</span>
        <span className="font-mono">{shown}</span>
      </span>
      <span className="mt-0.5 block h-1.5 rounded-full bg-rule/60">
        <span
          className="block h-full rounded-full transition-[width] duration-1000 ease-out"
          style={{ width: `${(value / SCALE) * 100}%`, background: color }}
        />
      </span>
    </span>
  );
}

function Dot({ at, label, hollow, moving }: { at: number; label: string; hollow?: boolean; moving?: boolean }) {
  return (
    <span
      className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 ${moving ? "transition-[left] delay-300 duration-1000 ease-out" : ""}`}
      style={{ left: `${at}%` }}
    >
      <span
        className={`block h-3 w-3 rounded-full border-2 border-ink ${hollow ? "bg-sheet" : "bg-ink"}`}
        title={label}
      />
      <span
        className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-ink-soft ${
          hollow ? "bottom-4" : "top-4"
        }`}
      >
        {label}
      </span>
    </span>
  );
}
