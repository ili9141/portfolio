"use client";

import { useState } from "react";
import { TOKENS } from "@/content/tokens";
import { useT } from "./lang";
import { arrivedByBoom } from "./LatentField";
import { groupWords, Tok, useTokenReveal, type Word } from "./motion";

const STEP_MS = 420;
// After a boom the explosion already was the entrance, so the hero plays its
// own about three times faster instead of making the visitor wait again.
const FAST = 0.33;

// The name as Qwen3's tokenizer splits it, from the generated tokens.ts:
// I | lias | A | it | Bar | reh | il. The first word sits on its own line.
const NAME = "Ilias Ait Barrehil";
const NAME_WORDS = groupWords(TOKENS[NAME]);
const TOKEN_COUNT = TOKENS[NAME].length;
const WORD_DELAY = [100, 330, 470];

/** One word, its letters rising in, grouped into the tokens it is made of. */
function TokenWord({ word, delay, k }: { word: Word; delay: number; k: number }) {
  let letter = 0;
  return (
    <span className="relative inline-block whitespace-nowrap" aria-hidden>
      {word.toks.map((t, j) => (
        <Tok key={t.i} id={t.id} i={t.i} first={j === 0}>
          {[...t.piece].map((c) => {
            const i = letter++;
            return (
              <span
                key={i}
                className="relative inline-block"
                style={{ animation: `rise ${600 * k}ms ${(delay + i * 45) * k}ms both cubic-bezier(.2,.7,.3,1)` }}
              >
                {c}
              </span>
            );
          })}
        </Tok>
      ))}
    </span>
  );
}

export function Hero() {
  const t = useT().hero;
  const [run, setRun] = useState(0);
  const [fast] = useState(() => arrivedByBoom());
  const n = t.fields.length;
  const k = fast ? FAST : 1;
  // The candidate sheet replays at normal speed when the visitor asks for it.
  const ks = fast && run === 0 ? FAST : 1;
  const ms = (v: number, f = k) => `${Math.round(v * f)}ms`;

  // Tokens: shown once the name has risen in (held a bit longer than the
  // section titles, it is the first thing seen), then on hover or tap.
  const { shown: tokensShown, handlers: tokenHandlers } = useTokenReveal(true, fast ? 700 : 1700, 3800);

  return (
    <section id="top" className="relative">
      <div className="relative mx-auto grid max-w-[1680px] gap-12 px-4 pb-24 pt-14 sm:px-8 lg:px-14 md:pt-24 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.14em] text-annot md:text-base" style={{ animation: `rise ${ms(500)} both` }}>
            {t.eyebrow}
          </p>
          <h1
            className={`display relative mt-6 cursor-default text-[3.1rem] sm:text-[5.2rem] 2xl:text-[6.6rem] ${tokensShown ? "tokens-on" : ""}`}
            aria-label={NAME}
            // A little more room between the two lines than .display gives, so the
            // token tags on the second line clear the first line's letters.
            style={{ lineHeight: 1.16 }}
            {...tokenHandlers}
          >
            <TokenWord word={NAME_WORDS[0]} delay={WORD_DELAY[0]} k={k} />
            <br />
            <TokenWord word={NAME_WORDS[1]} delay={WORD_DELAY[1]} k={k} />{" "}
            <TokenWord word={NAME_WORDS[2]} delay={WORD_DELAY[2]} k={k} />
            <span className="tok-note" aria-hidden>
              qwen3 tokenizer · {TOKEN_COUNT} tokens
            </span>
          </h1>
          <div className="mt-8 max-w-2xl space-y-4 text-lg leading-relaxed text-ink-soft md:text-xl">
            {t.lead.map((p, i) => (
              <p key={p.slice(0, 16)} style={{ animation: `rise ${ms(700)} ${ms(900 + i * 150)} both` }}>
                {p}
              </p>
            ))}
          </div>
          <div className="mt-9 flex flex-wrap gap-3" style={{ animation: `rise ${ms(700)} ${ms(1250)} both` }}>
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

        <div className="relative" style={{ animation: `rise ${ms(800)} ${ms(500)} both` }}>
          <div className="doc sheet relative rotate-[0.8deg] overflow-hidden rounded-sm p-6 sm:p-8" key={run}>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 z-10 h-12 bg-gradient-to-b from-transparent via-annot/30 to-transparent"
              style={{ animation: `scan ${ms(n * STEP_MS + 500, ks)} ${ms(700, ks)} linear both` }}
            />
            <div className="flex items-baseline justify-between border-b-2 border-ink pb-2">
              <p className="display text-lg">{t.formTitle}</p>
              <p className="font-mono text-[10px] text-ink-faint">1/1</p>
            </div>
            <dl className="mt-5 space-y-4">
              {t.fields.map((f, i) => (
                <div key={f.key} className="grid grid-cols-[6.5rem_1fr] items-center gap-3">
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">{f.label}</dt>
                  <dd className="relative border-b border-dotted border-rule pb-1">
                    <span className="text-[15px]">{f.value}</span>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -inset-x-1.5 -inset-y-1 rounded-[2px] outline outline-[1.5px] outline-annot"
                      style={{ animation: `box-in ${ms(300, ks)} ${ms(900 + i * STEP_MS, ks)} both cubic-bezier(.2,.7,.3,1)` }}
                    >
                      <span className="absolute -top-[1.3em] left-[-1.5px] rounded-t-[2px] bg-annot px-1 font-mono text-[9px] leading-[1.3em] text-on-annot">
                        {f.key}
                      </span>
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-7 flex items-end justify-between gap-4">
              <p className="max-w-[62%] text-xs italic text-ink-faint">{t.formNote}</p>
              <span
                className="-rotate-6 rounded-sm border-2 border-ok px-3 py-1 font-mono text-sm font-bold uppercase tracking-widest text-ok"
                style={{ animation: `box-in ${ms(260, ks)} ${ms(1000 + n * STEP_MS, ks)} both cubic-bezier(.3,1.6,.5,1)` }}
              >
                ✓ {t.stamp}
              </span>
            </div>
          </div>
          <button
            onClick={() => setRun((r) => r + 1)}
            className="mt-3 font-mono text-[10px] uppercase tracking-wider text-ink-faint hover:text-annot"
          >
            ↻ {t.replay}
          </button>
        </div>
      </div>
    </section>
  );
}
