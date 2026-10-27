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
  const [hover, setHover] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);

  const doc = documents.find((d) => d.id === docId)!;

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
              onClick={() => setDocId(d.id)}
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
              onClick={() => setFax(v)}
              aria-pressed={fax === v}
              className={`rounded-full px-3 py-1 transition-colors ${fax === v ? "bg-paper text-ink shadow-sm" : "text-ink-faint"}`}
            >
              {v ? t.fax : t.clean}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <div className="doc relative self-start overflow-hidden rounded-sm border border-rule bg-white">
          <DocSvg doc={doc} fax={fax} />
          {/* A scan line passes on every change, and each box appears as the
              line reaches it, so the order you see is the order on the page. */}
          <span
            key={`scan-${doc.id}-${fax}`}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 z-10 h-16 bg-gradient-to-b from-transparent via-annot/35 to-transparent"
            style={{ animation: `scan ${SCAN_MS}ms linear both` }}
          />
          {doc.fields.map((f) => {
            const b = normalisedBox(doc, f);
            const { flagged } = reading(doc, f, fax);
            const active = hover === f.key;
            return (
              <div
                key={`${doc.id}-${fax}-${f.key}`}
                onMouseEnter={() => setHover(f.key)}
                onMouseLeave={() => setHover(null)}
                className="absolute rounded-[2px] transition-[background-color,outline-width] duration-150"
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
              </div>
            );
          })}
        </div>

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
              return (
                <li
                  key={f.key}
                  onMouseEnter={() => setHover(f.key)}
                  onMouseLeave={() => setHover(null)}
                  className={`flex items-baseline justify-between gap-3 px-1 py-2 transition-colors ${
                    hover === f.key ? (r.flagged ? "bg-flag-wash" : "bg-annot-wash") : ""
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

          <button
            onClick={() => setShowJson((v) => !v)}
            className="mt-4 self-start font-mono text-[11px] uppercase tracking-wider text-ink-faint hover:text-ink"
            aria-expanded={showJson}
          >
            {showJson ? "−" : "+"} {t.outputTitle}
          </button>
          {showJson && (
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
