"use client";

import { useEffect, useState } from "react";
import { useT } from "../lang";
import { arrivedByBoom } from "../LatentField";

// Real check names from Lama's scripts/verify-phone-change.mjs (an excerpt), and
// the result measured on 2026-10-22 (docs/Debugs/2026-10-22-phone-number-change.md).
const COMMAND = "npm run verify:phone-change";
const CHECKS = [
  "GET without a session → 401",
  "send code without a session → 401",
  "an unknown key → 400",
  "not a phone number → 400 invalid_phone",
  "your own number, typed differently → 409 same_number",
  "wrong password → 403, and nothing is pending",
  "right password → 200, a code texted and pending",
  "wrong code → 400 invalid_code",
  "six tries → the code is gone (code_locked)",
  "right code + consent → 200, saved as E.164",
  "…an audit row in their practice, with no digits in it",
  "the same code again → 400 (single use)",
  "PUT profile with a different number → 409, number kept",
];
const RESULT = "26 passed · 0 failed";

const TYPE_MS = 32;
const LINE_MS = 150;

/** Colours the status code in a check line, the part the check is about. */
function CheckLine({ text }: { text: string }) {
  const m = text.match(/^(.*?)(→\s*)(\d{3})(.*)$/);
  if (!m) return <>{text}</>;
  const code = Number(m[3]);
  return (
    <>
      {m[1]}
      <span className="text-ink-faint">{m[2]}</span>
      <span className={code < 300 ? "text-annot" : "text-flag"}>{m[3]}</span>
      {m[4]}
    </>
  );
}

function Terminal({ startAfter }: { startAfter: number }) {
  const t = useT().dev.hero;
  const [run, setRun] = useState(0);
  // `step` counts characters of the command, then lines of output.
  const [step, setStep] = useState(0);
  const total = COMMAND.length + 1 + CHECKS.length + 1;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let i = 0;
    let timer = 0;
    const tick = () => {
      i += 1;
      setStep(i);
      if (i < total) timer = window.setTimeout(tick, i <= COMMAND.length ? TYPE_MS : LINE_MS);
    };
    timer = window.setTimeout(
      () => {
        if (reduced) {
          setStep(total);
          return;
        }
        setStep(0);
        tick();
      },
      run === 0 ? startAfter : 0,
    );
    return () => window.clearTimeout(timer);
  }, [run, startAfter, total]);

  const typed = COMMAND.slice(0, Math.min(step, COMMAND.length));
  const lines = Math.max(0, step - COMMAND.length - 1);
  const done = step >= total;

  return (
    <div>
      <div className="max-w-full overflow-hidden rounded-md border border-rule bg-[#030303] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-2 border-b border-rule px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-xs text-ink-faint">{t.terminalTitle}</span>
        </div>
        <pre className="min-h-[25rem] overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-[1.75] text-ink-soft sm:text-[13px]">
          <span className="text-annot">$ </span>
          <span className="text-ink">{typed}</span>
          {step <= COMMAND.length && <span className="ml-px inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] animate-pulse bg-annot" />}
          {step > COMMAND.length && (
            <>
              {"\n"}
              <span className="text-ink-faint">{"> node scripts/verify-phone-change.mjs"}</span>
            </>
          )}
          {CHECKS.slice(0, lines).map((c) => (
            <span key={c}>
              {"\n"}
              <span className="text-annot">✓ </span>
              <CheckLine text={c} />
            </span>
          ))}
          {done && (
            <>
              {"\n\n"}
              <span className="font-bold text-annot">{RESULT}</span>
            </>
          )}
        </pre>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <p className="text-xs text-ink-faint">{t.terminalNote}</p>
        <button
          onClick={() => setRun((r) => r + 1)}
          className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-ink-faint hover:text-annot"
        >
          ↻ {t.replay}
        </button>
      </div>
    </div>
  );
}

export function DevHero() {
  const t = useT().dev.hero;
  const [fast] = useState(() => arrivedByBoom());
  const k = fast ? 0.33 : 1;
  const ms = (v: number) => `${Math.round(v * k)}ms`;

  return (
    <section id="top" className="relative">
      <div className="relative mx-auto grid max-w-[1680px] gap-12 px-4 pb-24 pt-14 sm:px-8 lg:px-14 md:pt-24 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        {/* min-w-0: the terminal's long lines scroll inside it instead of widening the grid. */}
        <div className="min-w-0">
          <p className="font-mono text-sm uppercase tracking-[0.14em] text-annot md:text-base" style={{ animation: `rise ${ms(500)} both` }}>
            {t.eyebrow}
          </p>
          <h1
            className="display mt-6 text-[3.1rem] sm:text-[5.2rem] 2xl:text-[6.6rem]"
            style={{ animation: `rise ${ms(700)} ${ms(150)} both` }}
          >
            Ilias
            <br />
            Ait Barrehil<span className="text-annot">.</span>
          </h1>
          <div className="mt-8 max-w-2xl space-y-4 text-lg leading-relaxed text-ink-soft md:text-xl">
            {t.lead.map((p, i) => (
              <p key={p.slice(0, 16)} style={{ animation: `rise ${ms(700)} ${ms(500 + i * 150)} both` }}>
                {p}
              </p>
            ))}
          </div>
          <div className="mt-9 flex flex-wrap gap-3" style={{ animation: `rise ${ms(700)} ${ms(850)} both` }}>
            <a
              href="/cv/CV_Ilias_AitBarrehil_FR.pdf"
              className="group inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-base font-semibold text-on-brand transition-transform hover:-translate-y-0.5"
            >
              {t.cv}
              <span aria-hidden className="transition-transform group-hover:translate-y-0.5">
                ↓
              </span>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center rounded-full border border-ink/40 px-6 py-3 text-base font-medium transition-colors hover:border-ink hover:bg-ink hover:text-paper"
            >
              {t.contact}
            </a>
          </div>
        </div>
        <div className="min-w-0" style={{ animation: `rise ${ms(800)} ${ms(400)} both` }}>
          <Terminal startAfter={fast ? 450 : 1100} />
        </div>
      </div>
    </section>
  );
}
