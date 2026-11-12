"use client";

import { useState } from "react";
import { documents, normalisedBox, type DocField, type SynthDoc } from "@/content/documents";
import { DocSvg } from "./DocSvg";
import { useLang, useT } from "./lang";

const SCAN_MS = 1100;

function reading(doc: SynthDoc, f: DocField, fax: boolean) {
  const misread = fax && doc.verifier && f.faxValue !== undefined;
  return { value: misread ? f.faxValue! : f.value, flagged: misread };
}

export function DocReader() {
  const t = useT().lama.reader;
  const { lang } = useLang();
  const [docId, setDocId] = useState<SynthDoc["id"]>("attestation");
  const [fax, setFax] = useState(false);
  // Hover previews a field (mouse only); a click or a tap pins it, so the demo
  // works on a phone, where there is no hover.
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  // Nothing is read until the visitor asks: the analysis belongs to one
  // document at one quality, so switching either brings the button back.
  // `run` re-keys the animations, so "Run again" replays the scan.
  const [analysedFor, setAnalysedFor] = useState<string | null>(null);
  const [run, setRun] = useState(0);

  const doc = documents.find((d) => d.id === docId)!;
  const analysed = analysedFor === `${docId}-${fax}`;
  const analyse = () => {
    setAnalysedFor(`${docId}-${fax}`);
    setRun((r) => r + 1);
    setPinned(null);
  };
  const activeKey = hover ?? pinned;
  const activeField = doc.fields.find((f) => f.key === activeKey);
  const pin = (key: string) => setPinned((k) => (k === key ? null : key));
  const mouseOnly = (key: string | null) => (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setHover(key);
  };

  const output = Object.fromEntries(
    doc.fields.map((f) => [f.key, { value: reading(doc, f, fax).value, box: normalisedBox(doc, f) }]),
  );

  return (
    <div className="sheet rounded-sm p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={t.title}>
          {documents.map((d) => (
            <button
              key={d.id}
              role="tab"
              aria-selected={d.id === docId}
              onClick={() => {
                setDocId(d.id);
                setPinned(null);
              }}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                d.id === docId ? "border-ink bg-ink text-paper" : "border-rule text-ink-soft hover:border-ink-faint"
              }`}
            >
              {d.name[lang]}
            </button>
          ))}
        </div>
        <div className="flex rounded-full border border-rule p-0.5 text-sm" role="group">
          {[false, true].map((v) => (
            <button
              key={String(v)}
              onClick={() => {
                setFax(v);
                setPinned(null);
              }}
              aria-pressed={fax === v}
              className={`rounded-full px-3 py-1 transition-colors ${fax === v ? "bg-paper text-ink shadow-sm" : "text-ink-faint"}`}
            >
              {v ? t.fax : t.clean}
            </button>
          ))}
        </div>
        {analysed && (
          <button
            onClick={analyse}
            className="rounded-full border border-annot/60 px-3.5 py-1 text-sm text-annot transition-colors hover:border-brand hover:bg-brand hover:text-on-brand"
          >
            ↻ {t.rerun}
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <div className="doc relative self-start overflow-hidden rounded-sm border border-rule bg-white">
          <DocSvg doc={doc} fax={fax} />
          {!analysed && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10">
              <button
                onClick={analyse}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-base font-semibold text-on-brand shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] transition-transform hover:-translate-y-0.5"
              >
                <span aria-hidden>▶</span> {t.analyze}
              </button>
            </div>
          )}
          {/* A scan line passes on each analysis, and each box appears as the
              line reaches it, so the order you see is the order on the page. */}
          {analysed && (
            <span
              key={`scan-${run}`}
              aria-hidden
              className="pointer-events-none absolute inset-x-0 z-10 h-16 bg-gradient-to-b from-transparent via-annot/35 to-transparent"
              style={{ animation: `scan ${SCAN_MS}ms linear both` }}
            />
          )}
          {analysed && doc.fields.map((f) => {
            const b = normalisedBox(doc, f);
            const { flagged } = reading(doc, f, fax);
            const active = activeKey === f.key;
            return (
              <button
                type="button"
                key={`${run}-${f.key}`}
                onPointerEnter={mouseOnly(f.key)}
                onPointerLeave={mouseOnly(null)}
                onClick={() => pin(f.key)}
                aria-label={f.key}
                aria-pressed={pinned === f.key}
                className="absolute cursor-pointer rounded-[2px] transition-[background-color,outline-width] duration-150"
                style={{
                  left: `${b.x0 * 100}%`,
                  top: `${b.y0 * 100}%`,
                  width: `${(b.x1 - b.x0) * 100}%`,
                  height: `${(b.y1 - b.y0) * 100}%`,
                  outline: `${active ? 2.5 : 1.5}px solid ${flagged ? "var(--flag)" : "var(--annot)"}`,
                  background: active ? (flagged ? "var(--flag-wash)" : "var(--annot-wash)") : "transparent",
                  animation: `box-in 320ms ${Math.round(b.y0 * SCAN_MS)}ms both cubic-bezier(.2,.7,.3,1)`,
                }}
              >
                <span
                  className={`absolute -top-[1.35em] left-[-1.5px] whitespace-nowrap rounded-t-[2px] px-1 font-mono text-[9px] leading-[1.35em] text-on-annot sm:text-[10px] ${
                    active ? "opacity-100" : "opacity-0 sm:opacity-80"
                  }`}
                  style={{ background: flagged ? "var(--flag)" : "var(--annot)" }}
                >
                  {f.key}
                </span>
              </button>
            );
          })}
        </div>

        {/* Phones and tablets: the field list sits below the fold, so a tapped
            box answers right under the document. */}
        <p className="-mt-3 min-h-[2.75rem] rounded-sm border border-rule px-3 py-2 text-sm lg:hidden" aria-live="polite">
          {!analysed ? (
            <span className="text-ink-faint">{t.notRead}</span>
          ) : activeField ? (
            (() => {
              const r = reading(doc, activeField, fax);
              return (
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <span className="font-mono text-[11px] text-ink-faint">{activeField.key}</span>
                  <span className={r.flagged ? "text-flag" : "text-ink"}>{r.value}</span>
                  <span className={`font-mono text-[10px] uppercase ${r.flagged ? "text-flag" : "text-annot"}`}>
                    {r.flagged ? t.flagged : t.verified}
                  </span>
                </span>
              );
            })()
          ) : (
            <span className="text-ink-faint">{t.tapHint}</span>
          )}
        </p>

        <div className="flex flex-col">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
            {t.kinds[doc.kind]}
          </p>
          <p className="mt-1 text-sm text-ink-soft">{doc.why[lang]}</p>
          <p
            className={`mt-3 inline-flex items-center gap-2 self-start rounded-full px-2.5 py-1 text-xs ${
              doc.verifier ? "bg-flag-wash text-flag" : "bg-paper text-ink-soft"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${doc.verifier ? "bg-flag" : "bg-ink-faint"}`} />
            {doc.verifier ? t.verifierOn : t.verifierOff}
          </p>

          <h4 className="mt-5 font-mono text-[11px] uppercase tracking-wider text-ink-faint">{t.fieldsTitle}</h4>
          <ul className="mt-2 divide-y divide-rule border-y border-rule">
            {doc.fields.map((f) => {
              const r = reading(doc, f, fax);
              if (!analysed)
                return (
                  <li key={f.key} className="flex items-baseline justify-between gap-3 px-1 py-2">
                    <span className="font-mono text-[11px] text-ink-faint">{f.key}</span>
                    <span className="text-sm text-ink-faint">—</span>
                  </li>
                );
              return (
                <li
                  key={f.key}
                  onPointerEnter={mouseOnly(f.key)}
                  onPointerLeave={mouseOnly(null)}
                  onClick={() => pin(f.key)}
                  className={`flex cursor-pointer items-baseline justify-between gap-3 px-1 py-2 transition-colors ${
                    activeKey === f.key ? (r.flagged ? "bg-flag-wash" : "bg-annot-wash") : ""
                  }`}
                >
                  <span className="font-mono text-[11px] text-ink-faint">{f.key}</span>
                  <span className="flex items-baseline gap-2 text-right">
                    <span className={`text-sm ${r.flagged ? "text-flag" : "text-ink"}`}>{r.value}</span>
                    <span
                      className={`font-mono text-[10px] uppercase ${r.flagged ? "text-flag" : "text-annot"}`}
                    >
                      {r.flagged ? t.flagged : t.verified}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          {analysed && (
            <button
              onClick={() => setShowJson((v) => !v)}
              className="mt-4 self-start font-mono text-[11px] uppercase tracking-wider text-ink-faint hover:text-ink"
              aria-expanded={showJson}
            >
              {showJson ? "−" : "+"} {t.outputTitle}
            </button>
          )}
          {analysed && showJson && (
            <pre className="mt-2 max-h-64 overflow-auto rounded-sm bg-code-bg p-3 font-mono text-[11px] leading-relaxed text-code-fg">
              {JSON.stringify(output, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <p className="mt-5 border-t border-rule pt-3 text-xs text-ink-faint">{t.hint} {t.note}</p>
    </div>
  );
}
