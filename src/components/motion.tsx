"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TOKENS, type Token } from "@/content/tokens";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True once the element has scrolled into view; never flips back. */
export function useInView<T extends Element>(margin = "0px 0px -12% 0px") {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, seen] as const;
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "article" | "section";
}) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <Tag
      // The ref type is shared by every tag this accepts.
      ref={ref as React.Ref<never>}
      className={`reveal ${seen ? "is-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/** Animates every number inside a string ("98,7 %", "8 min 40") up from zero. */
export function CountUp({ text, duration = 1300 }: { text: string; duration?: number }) {
  const [ref, seen] = useInView<HTMLSpanElement>();
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!seen) return;
    const d = prefersReducedMotion() ? 0 : duration;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = d ? Math.min(1, (now - start) / d) : 1;
      setT(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, duration]);

  const out = text.replace(/\d+(?:[.,]\d+)?/g, (m) => {
    const sep = m.includes(",") ? "," : ".";
    const decimals = m.includes(sep) ? m.split(sep)[1].length : 0;
    const v = parseFloat(m.replace(",", ".")) * t;
    return v.toFixed(decimals).replace(".", sep);
  });

  return (
    <span ref={ref} aria-label={text}>
      <span aria-hidden>{out}</span>
    </span>
  );
}

/** Eases a number towards its target whenever the target changes. */
export function useTween(target: number, duration = 450) {
  const [value, setValue] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    const d = prefersReducedMotion() ? 0 : duration;
    const start = performance.now();
    const origin = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const p = d ? Math.min(1, (now - start) / d) : 1;
      const v = origin + (target - origin) * (1 - Math.pow(1 - p, 3));
      from.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

/**
 * Shows a title's token boxes for `holdMs` once `trigger` turns true (after
 * `delayMs`), and again whenever it is hovered (tapped on touch screens).
 */
export function useTokenReveal(trigger: boolean, delayMs: number, holdMs = 3200) {
  const [auto, setAuto] = useState(false);
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    if (!trigger) return;
    const on = window.setTimeout(() => setAuto(true), delayMs);
    const off = window.setTimeout(() => setAuto(false), delayMs + holdMs);
    return () => {
      window.clearTimeout(on);
      window.clearTimeout(off);
    };
  }, [trigger, delayMs, holdMs]);
  return {
    shown: auto || hover || pinned,
    handlers: {
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      onClick: () => setPinned((v) => !v),
    },
  };
}

export type Word = { space: boolean; toks: { piece: string; id: number; i: number }[] };

/** Groups tokens into words, so a line can break between words but never inside one. */
export function groupWords(tokens: Token[]): Word[] {
  const words: Word[] = [];
  tokens.forEach(([piece, id], i) => {
    const space = piece.startsWith(" ");
    if (space || words.length === 0) words.push({ space, toks: [] });
    words[words.length - 1].toks.push({ piece: space ? piece.slice(1) : piece, id, i });
  });
  return words;
}

/** One token: a box, an id tag, and its text. Shown when an ancestor has .tokens-on. */
export function Tok({ id, i, first, children }: { id: number; i: number; first: boolean; children: React.ReactNode }) {
  return (
    <span className="tok" style={{ "--i": i } as React.CSSProperties} data-alt={i % 2} data-first={first ? 1 : 0}>
      <span className="tok-box" />
      <span className="tok-id">{id}</span>
      {children}
    </span>
  );
}

/** A title rendered as its Qwen3 tokens (from tokens.ts); plain text if it has none. */
export function TokenText({ text }: { text: string }) {
  const tokens = TOKENS[text];
  if (!tokens) return <>{text}</>;
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {groupWords(tokens).map((w, wi) => (
          <span key={wi}>
            {w.space && " "}
            <span className="whitespace-nowrap">
              {w.toks.map((t, j) => (
                <Tok key={t.i} id={t.id} i={t.i} first={j === 0}>
                  {t.piece}
                </Tok>
              ))}
            </span>
          </span>
        ))}
      </span>
    </>
  );
}

const TYPE_MS = 38;
const CURSOR_HOLD_MS = 2600;

/**
 * The dev side's section title: a prompt, then the title typed in after it. The
 * cursor blinks for a moment once it is done, and again while hovered.
 */
function PromptTitle({ text, className }: { text: string; className: string }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  const [typed, setTyped] = useState(0);
  const [resting, setResting] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!seen) return;
    if (prefersReducedMotion()) {
      const id = window.setTimeout(() => {
        setTyped(text.length);
        setResting(true);
      }, 0);
      return () => window.clearTimeout(id);
    }
    let n = 0;
    let timer = window.setTimeout(function tick() {
      n += 1;
      setTyped(n);
      if (n < text.length) timer = window.setTimeout(tick, TYPE_MS);
      else timer = window.setTimeout(() => setResting(true), CURSOR_HOLD_MS);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [seen, text]);

  const cursor = seen && (!resting || hover);
  return (
    <div ref={ref} className="cursor-default" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <h2 className={`flex gap-[0.4em] ${className}`}>
        <span aria-hidden className="text-annot">
          &gt;
        </span>
        <span>
          <span className="sr-only">{text}</span>
          {/* The untyped rest is laid out but invisible, so lines never reflow while typing. */}
          <span aria-hidden>
            {text.slice(0, typed)}
            {/* An empty inline span: unlike an inline-block, it cannot open a line break mid-word. */}
            <span className="relative">
              {cursor && (
                <span
                  className="absolute left-[0.04em] top-[0.12em] h-[0.92em] w-[0.5em] bg-annot"
                  style={{ animation: typed >= text.length ? "blink 1s steps(1) infinite" : undefined }}
                />
              )}
            </span>
            <span className="invisible">{text.slice(typed)}</span>
          </span>
        </span>
      </h2>
    </div>
  );
}

/**
 * A section title, boxed the way the model boxes a field, tag and all. Once the
 * box has drawn, the title shows the tokens an LLM reads it as for a few
 * seconds; hovering (or tapping) shows them again. Tokens are the AI side's
 * motif; the dev side types its titles at a prompt instead.
 */
export function BoxedTitle({ tag, text, className }: { tag: string; text: string; className: string }) {
  if (usePathname() === "/dev") return <PromptTitle text={text} className={className} />;
  return <TokenBoxedTitle tag={tag} text={text} className={className} />;
}

function TokenBoxedTitle({ tag, text, className }: { tag: string; text: string; className: string }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  // The frame takes ~1.15 s to draw (globals.css .fbox-frame); tokens follow it.
  const { shown, handlers } = useTokenReveal(seen, 1300);
  return (
    <div ref={ref} className={`fbox cursor-default ${seen ? "is-in" : ""} ${shown ? "tokens-on" : ""}`} {...handlers}>
      {/* A little more line room than .display, so second-line token tags clear the first line. */}
      <h2 className={className} style={{ lineHeight: 1.12 }}>
        <TokenText text={text} />
      </h2>
      <span className="fbox-frame" aria-hidden />
      <span className="fbox-tag" aria-hidden>
        {tag}
      </span>
    </div>
  );
}

// A training run, seeded so it is the same curve on every visit: a fast drop,
// a long flattening tail, and a validation curve that settles a little higher.
function lossPath(points: number, floor: number, noise: number, seed: number) {
  let s = seed;
  const r = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296 - 0.5);
  const d: string[] = [];
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * 1000;
    const y = floor + (1 - floor) * Math.exp(-i / (points / 6)) + r() * noise * Math.exp(-i / points);
    // SVG y grows downward, so high loss sits near the top.
    d.push(`${i ? "L" : "M"}${x.toFixed(1)},${(54 - y * 46).toFixed(1)}`);
  }
  return d.join(" ");
}

const TRAIN = lossPath(80, 0.06, 0.09, 11);
const VAL = lossPath(80, 0.16, 0.06, 23);

/** A thin loss curve that draws itself between sections. */
export function LossCurve() {
  const [ref, seen] = useInView<HTMLDivElement>("0px 0px -20% 0px");
  return (
    <div ref={ref} className={`loss mx-auto max-w-[1680px] px-4 sm:px-8 lg:px-14 ${seen ? "is-in" : ""}`} aria-hidden>
      <div className="relative">
        <svg viewBox="0 0 1000 60" preserveAspectRatio="none" className="block h-14 w-full overflow-visible">
          <line x1="0" y1="59" x2="1000" y2="59" className="loss-axis" />
          <path d={VAL} pathLength={1} className="loss-val" />
          <path d={TRAIN} pathLength={1} className="loss-train" />
        </svg>
        <span className="absolute -top-4 left-0 font-mono text-[9px] uppercase tracking-wider text-ink-faint">loss</span>
        <span className="absolute -bottom-4 right-0 font-mono text-[9px] uppercase tracking-wider text-ink-faint">epoch</span>
      </div>
    </div>
  );
}
