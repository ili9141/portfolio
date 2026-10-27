"use client";

import { useRef, useState } from "react";
import { useLang, useT } from "./lang";

// The AMAN API (FastAPI on a Hugging Face Space). One constant, so moving to a
// different copy of the Space is a one-line change. It answers CORS for any
// origin, so the browser calls it directly; nothing goes through this site.
const AMAN_API = "https://bhm03-amane-api.hf.space";

const MODELS = ["student", "teacher", "benchmark"] as const;
type Model = (typeof MODELS)[number];
const OTHER = ["severe_toxic", "obscene", "threat", "insult", "identity_hate"] as const;
type Probs = Record<"toxic" | (typeof OTHER)[number], number>;

const MAX_CHARS = 280;
const TIMEOUT_MS = 120_000;
// A free Space sleeps when nobody uses it; past this, say so instead of spinning silently.
const WAKING_AFTER_MS = 4_000;
const THRESHOLD = 0.5;

type Result = { status: "loading" } | { status: "ok"; probs: Probs } | { status: "error" };

async function predict(text: string, model: Model, signal: AbortSignal): Promise<Probs> {
  const res = await fetch(`${AMAN_API}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, model }),
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as Partial<Probs>;
  if (typeof data.toxic !== "number") throw new Error("unexpected response");
  return data as Probs;
}

/** `embedded` drops the card chrome when the demo sits inside the AMAN project card. */
export function AmanDemo({ embedded = false }: { embedded?: boolean }) {
  const t = useT().projects.demo;
  const [text, setText] = useState("");
  const [results, setResults] = useState<Partial<Record<Model, Result>>>({});
  const [waking, setWaking] = useState(false);
  const run = useRef<AbortController | null>(null);

  const busy = Object.values(results).some((r) => r?.status === "loading");

  const analyse = async (input: string) => {
    const clean = input.trim().slice(0, MAX_CHARS);
    if (!clean) return;
    run.current?.abort();
    const ctrl = new AbortController();
    run.current = ctrl;
    const timeout = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const wakeTimer = setTimeout(() => setWaking(true), WAKING_AFTER_MS);
    setWaking(false);
    setResults(Object.fromEntries(MODELS.map((m) => [m, { status: "loading" }])));

    await Promise.all(
      MODELS.map(async (m) => {
        try {
          const probs = await predict(clean, m, ctrl.signal);
          if (run.current === ctrl) setResults((r) => ({ ...r, [m]: { status: "ok", probs } }));
        } catch {
          if (run.current === ctrl) setResults((r) => ({ ...r, [m]: { status: "error" } }));
        }
      }),
    );
    clearTimeout(timeout);
    clearTimeout(wakeTimer);
    if (run.current === ctrl) setWaking(false);
  };

  const anyError = Object.values(results).some((r) => r?.status === "error");

  return (
    <div className={embedded ? "" : "sheet rounded-sm p-5 sm:p-7"}>
      <h3 className="text-2xl font-bold tracking-tight sm:text-[28px]" style={{ fontStretch: "112%" }}>
        {t.title}
      </h3>
      <p className="mt-2 max-w-3xl text-[17px] leading-relaxed text-ink-soft md:text-lg">{t.lead}</p>

      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          analyse(text);
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_CHARS}
          placeholder={t.placeholder}
          dir="auto"
          className="min-w-0 flex-1 rounded-sm border border-rule bg-paper px-4 py-3 text-lg text-ink placeholder:text-ink-faint focus:border-annot focus:outline-none"
          aria-label={t.placeholder}
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="rounded-sm bg-brand px-6 py-3 text-base font-semibold text-on-brand transition-opacity disabled:opacity-50"
        >
          {t.submit}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {t.examples.map((ex) => (
          <button
            key={ex}
            type="button"
            dir="auto"
            disabled={busy}
            onClick={() => {
              setText(ex);
              analyse(ex);
            }}
            className="rounded-full border border-rule px-3 py-1 text-[15px] text-ink-soft transition-colors hover:border-annot hover:text-ink disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
      </div>

      {waking && busy && <p className="mt-4 text-sm text-flag">{t.waking}</p>}
      {anyError && !busy && <p className="mt-4 text-sm text-flag">{t.error}</p>}

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {MODELS.map((m) => (
          <ModelCard key={m} name={t.models[m].name} detail={t.models[m].detail} result={results[m]} t={t} />
        ))}
      </div>

      <p className="mt-5 border-t border-rule pt-3 text-sm leading-relaxed text-ink-faint">{t.note}</p>
    </div>
  );
}

type DemoText = ReturnType<typeof useT>["projects"]["demo"];

function ModelCard({ name, detail, result, t }: { name: string; detail: string; result?: Result; t: DemoText }) {
  const { lang } = useLang();
  const fmt = (v: number) => (lang === "fr" ? v.toFixed(2).replace(".", ",") : v.toFixed(2));
  const probs = result?.status === "ok" ? result.probs : null;
  const toxic = probs?.toxic ?? 0;
  const flagged = probs ? toxic >= THRESHOLD : false;

  return (
    <div className="rounded-sm border border-rule p-4">
      <p className="text-base font-semibold">{name}</p>
      <p className="font-mono text-xs text-ink-faint">{detail}</p>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="font-mono text-xs uppercase tracking-wider text-ink-soft">{t.toxic}</span>
        <span className="display text-3xl text-annot">
          {result?.status === "loading" ? "…" : probs ? fmt(toxic) : "—"}
        </span>
      </div>
      <div className="relative mt-2 h-2.5 rounded-full bg-rule">
        <div
          className="h-full rounded-full bg-annot transition-[width] duration-700 ease-out"
          style={{ width: `${toxic * 100}%` }}
        />
        <div className="absolute inset-y-[-3px] w-px bg-ink-faint" style={{ left: `${THRESHOLD * 100}%` }} aria-hidden />
      </div>
      <p className={`mt-2 text-sm font-medium ${probs ? (flagged ? "text-annot" : "text-ink-soft") : "text-transparent"}`}>
        {probs ? (flagged ? t.verdict.yes : t.verdict.no) : "·"}
      </p>

      <p className="mt-4 text-xs text-ink-faint">{t.otherLabels}</p>
      <ul className="mt-2 space-y-1.5">
        {OTHER.map((k) => {
          const v = probs?.[k] ?? 0;
          return (
            <li key={k} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-2 text-xs text-ink-soft">
              <span>{t.labels[k]}</span>
              <span className="h-1.5 rounded-full bg-rule">
                <span
                  className="block h-full rounded-full bg-ink-faint transition-[width] duration-700 ease-out"
                  style={{ width: `${v * 100}%` }}
                />
              </span>
              <span className="text-right font-mono">{probs ? fmt(v) : "—"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
