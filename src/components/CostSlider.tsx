"use client";

import { useState } from "react";
import { useLang, useT } from "./lang";
import { useTween } from "./motion";

// Measured on the Lama endpoint: 8m40s cold start, 18.5-28.6 s per document.
// Estimated: the alarm delay before scaling starts and the idle time before
// scale-in. The hourly rate is backed out of the ~$820/month always-on figure.
const ALWAYS_ON = 820;
const RATE = ALWAYS_ON / 730;
const ALARM_MIN = 1.5;
const BOOT_MIN = 8 + 40 / 60;
const PER_DOC_MIN = 25 / 60;
const IDLE_MIN = 5;

export function CostSlider() {
  const t = useT().lama.cost;
  const { lang } = useLang();
  const [bursts, setBursts] = useState(1);
  const [docs, setDocs] = useState(8);

  const readMin = docs * PER_DOC_MIN;
  const billedMin = BOOT_MIN + readMin + IDLE_MIN;
  const hoursPerDay = Math.min(24, (bursts * billedMin) / 60);
  const asyncCost = Math.min(ALWAYS_ON, hoursPerDay * 30.4 * RATE);
  const ratio = ALWAYS_ON / asyncCost;
  const shownCost = useTween(asyncCost);

  const loc = lang === "fr" ? "fr-FR" : "en-US";
  const usd = (n: number) =>
    new Intl.NumberFormat(loc, {
      style: "currency",
      currency: "USD",
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: n < 100 ? 1 : 0,
    }).format(n);
  const hours = (h: number) => {
    const total = Math.round(h * 60);
    const hh = Math.floor(total / 60);
    const mm = total % 60;
    return hh ? `${hh} h ${String(mm).padStart(2, "0")}` : `${mm} min`;
  };

  const cycle = ALARM_MIN + billedMin;
  const seg = [
    { key: "alarm", min: ALARM_MIN, label: t.timeline.alarm, cls: "bg-[repeating-linear-gradient(135deg,var(--rule)_0_4px,transparent_4px_8px)]" },
    { key: "boot", min: BOOT_MIN, label: t.timeline.boot, cls: "bg-flag/70" },
    { key: "read", min: readMin, label: t.timeline.read, cls: "bg-annot" },
    { key: "idle", min: IDLE_MIN, label: t.timeline.idle, cls: "bg-ink-faint/50" },
  ];

  return (
    <div className="sheet rounded-sm p-4 sm:p-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Slider label={t.bursts} value={bursts} min={1} max={24} onChange={setBursts} />
        <Slider label={t.docs} value={docs} min={1} max={60} onChange={setDocs} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-sm border border-rule p-4">
          <p className="text-sm text-ink-soft">{t.alwaysOn}</p>
          <p className="display mt-1 text-4xl text-ink-soft line-through decoration-flag/70 decoration-2">
            {usd(ALWAYS_ON)}
            <span className="ml-1 font-sans text-sm text-ink-faint">{t.perMonth}</span>
          </p>
          <p className="mt-2 text-xs text-ink-faint">
            {t.latency} : {t.latencyAlways}
          </p>
        </div>
        <div className="rounded-sm border border-ink bg-paper p-4">
          <p className="text-sm text-ink-soft">{t.async}</p>
          <p className="display mt-1 text-4xl text-annot">
            {usd(shownCost)}
            <span className="ml-1 font-sans text-sm text-ink-faint">{t.perMonth}</span>
          </p>
          <p className="mt-2 text-xs text-ink-faint">
            {t.latency} : {t.latencyAsync}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm text-ink">
        {t.ratio
          .replace("{x}", ratio >= 10 ? Math.round(ratio).toString() : ratio.toFixed(1).replace(".", lang === "fr" ? "," : "."))
          .replace("{h}", hours(hoursPerDay))}
      </p>

      <div className="mt-6">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          {lang === "fr" ? "Un lot, de bout en bout" : "One batch, end to end"} · {Math.round(cycle)} min
        </p>
        <div className="mt-2 flex h-5 w-full overflow-hidden rounded-sm">
          {seg.map((s) => (
            <div key={s.key} className={`${s.cls} h-full transition-[width] duration-300`} style={{ width: `${(s.min / cycle) * 100}%` }} />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-soft">
          {seg.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5">
              <span className={`inline-block h-2.5 w-2.5 rounded-[2px] ${s.cls}`} />
              {s.label} · {s.min < 1 ? `${Math.round(s.min * 60)} s` : `${s.min.toFixed(1).replace(".", lang === "fr" ? "," : ".")} min`}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-5 border-l-2 border-annot pl-3 text-sm leading-relaxed text-ink-soft">{t.lesson}</p>
      <p className="mt-4 border-t border-rule pt-3 text-xs text-ink-faint">{t.assumptions}</p>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-sm">
        <span className="text-ink-soft">{label}</span>
        <span className="font-mono text-ink">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--annot)]"
      />
    </label>
  );
}
