"use client";

import { useEffect, useRef, useState } from "react";

// A drifting 2-D "embedding projection" fixed behind the whole site. Points sit
// in soft clusters and carry a depth, so scrolling moves near points faster
// than far ones. Each point carries a faint halo; the halos add up where points
// are dense, so every cluster gets its own haze. Close points are linked
// faintly, and the pointer runs a k-nearest-neighbour query drawn as lines.
// Seeded, so every visit looks the same.
//
// The field lives in the root layout, so it survives navigation: `explode()`
// pulls every point into the centre, fires the callback that changes page, then
// blows the points back out in the new page's colour.

const K = 6;
const LINK_PX = 80;
// Neighbours further than this are not drawn: a line across the screen reads as noise.
const REACH_PX = 260;
const HALO_PX = 150;
// The haze is painted on its own layer, where overlapping halos saturate
// (source-over) instead of adding up, and that layer is shown at HAZE_MAX.
// A lone halo is barely there; a dense cluster reads as a clearer patch; nothing,
// not even the gathered ball, can get brighter than HAZE_MAX of the tint.
const HAZE_MAX = 0.32;
const STAMP_ALPHA = 0.05;
// The haze layer is drawn at half resolution: it is a blur, so nobody can tell.
const HAZE_SCALE = 0.5;
// Pull in, hold the ball for a beat while it charges, then blow it out.
const GATHER_MS = 1000;
const HOLD_MS = 350;
const BOOM_MS = 1600;
// The new page starts showing when the burst is this far through (the points
// have covered ~86% of their flight by then), not when the last one lands.
const LAND_AT = 0.28;
const CLUSTERS = [
  [0.14, 0.22],
  [0.4, 0.62],
  [0.7, 0.18],
  [0.86, 0.66],
  [0.22, 0.86],
  [0.58, 0.92],
];

export type Rgb = [number, number, number];
export const MAGENTA: Rgb = [244, 82, 157];
export const GREEN: Rgb = [61, 255, 127];

// Module state, shared with the button in the header and the pages.
let fieldRgb: Rgb = MAGENTA;
let anim: {
  start: number;
  from: Rgb;
  to: Rgb;
  onPeak: () => void;
  onLand: () => void;
  peaked: boolean;
  landed: boolean;
} | null = null;

let lastBoomAt = -Infinity;

/** True on a page reached through a boom in the last few seconds. Pages use it
 *  to play their entrance faster: the explosion already was the entrance. */
export function arrivedByBoom(withinMs = 4000) {
  return typeof performance !== "undefined" && performance.now() - lastBoomAt < withinMs;
}

/** A page announces its colour; the field adopts it (no animation). */
export function setFieldColor(rgb: Rgb) {
  if (!anim) fieldRgb = rgb;
}

/** The longest an explosion can take, for callers that want a safety net. */
export const EXPLODE_TOTAL_MS = GATHER_MS + HOLD_MS + BOOM_MS;

/**
 * Gather every point, call `onPeak` at the centre (change page there), then
 * explode in `to`; `onLand` fires once the burst has mostly landed.
 * `onStart` runs only if the explosion actually starts, before anything else.
 *
 * Returns false when it refuses: mid-gather or mid-hold, a second explosion
 * would yank the ball away. Once the previous burst has landed (the new page
 * is already showing), its last stretch is skipped and the new one starts —
 * otherwise a quick second click did nothing at all.
 */
export function explode(
  to: Rgb,
  { onStart, onPeak, onLand }: { onStart: () => void; onPeak: () => void; onLand: () => void },
) {
  if (anim && !anim.landed) return false;
  if (anim) {
    fieldRgb = anim.to;
    anim = null;
  }
  onStart();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    fieldRgb = to;
    onPeak();
    onLand();
    return true;
  }
  anim = { start: performance.now(), from: fieldRgb, to, onPeak, onLand, peaked: false, landed: false };
  return true;
}

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function gauss(r: () => number) {
  return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
}

type P = { x: number; y: number; vx: number; vy: number; c: number; z: number; a: number; r: number };

function makePoints(n: number): P[] {
  const r = rng(7);
  return Array.from({ length: n }, () => {
    const c = Math.floor(r() * CLUSTERS.length);
    const [cx, cy] = CLUSTERS[c];
    return {
      x: cx + gauss(r) * 0.11,
      y: cy + gauss(r) * 0.12,
      vx: (r() - 0.5) * 0.00012,
      vy: (r() - 0.5) * 0.00012,
      c,
      z: 0.35 + r() * 0.65,
      // Where the point sits inside the gathered ball: an angle and a radius.
      a: r() * Math.PI * 2,
      r: Math.sqrt(r()),
    };
  });
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** A soft round sprite, drawn once per colour and stamped under every point. */
function haloSprite(rgb: Rgb) {
  const c = document.createElement("canvas");
  c.width = c.height = HALO_PX * 2;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(HALO_PX, HALO_PX, 0, HALO_PX, HALO_PX, HALO_PX);
  const [r, gr, b] = rgb.map(Math.round);
  grad.addColorStop(0, `rgba(${r},${gr},${b},1)`);
  grad.addColorStop(0.35, `rgba(${r},${gr},${b},0.35)`);
  grad.addColorStop(1, `rgba(${r},${gr},${b},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, HALO_PX * 2, HALO_PX * 2);
  return c;
}

export function LatentField() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const [tag, setTag] = useState<{ x: number; y: number; nx: number; ny: number } | null>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let pts: P[] = [];
    let raf = 0;
    let sprite = haloSprite(fieldRgb);
    let spriteKey = fieldRgb.join();
    const haze = document.createElement("canvas");
    const hctx = haze.getContext("2d")!;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      el.width = w * dpr;
      el.height = h * dpr;
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      haze.width = Math.ceil(w * HAZE_SCALE);
      haze.height = Math.ceil(h * HAZE_SCALE);
      // Density scales with the screen: about one point per 7,000 px².
      const n = Math.round(Math.min(240, Math.max(70, (w * h) / 7000)));
      if (n !== pts.length) pts = makePoints(n);
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      const scroll = window.scrollY;
      const natural = pts.map((q) => ({
        x: q.x * w,
        y: (((q.y * h - scroll * 0.12 * q.z) % h) + h) % h,
      }));

      // --- the explosion, if one is running ---
      let pos = natural;
      let rgb = fieldRgb;
      let flash = 0;
      let charge = 0;
      let busy = false;
      if (anim) {
        busy = true;
        const t = now - anim.start;
        const cx = w / 2;
        const cy = h / 2;
        const ball = Math.min(w, h) * 0.06;
        const centre = (q: P) => ({ x: cx + Math.cos(q.a) * q.r * ball, y: cy + Math.sin(q.a) * q.r * ball });
        if (t < GATHER_MS + HOLD_MS) {
          const g = easeInOutCubic(Math.min(1, t / GATHER_MS));
          // 0 → 1 across the hold: drives the shiver and the core glow.
          charge = Math.max(0, (t - GATHER_MS) / HOLD_MS);
          // A slight swirl on the way in, and a shiver as the ball fills up.
          pos = pts.map((q, i) => {
            const c = centre(q);
            const swirl = (1 - g) * 0.9;
            const dx = natural[i].x - cx;
            const dy = natural[i].y - cy;
            const sx = cx + dx * Math.cos(swirl * g) - dy * Math.sin(swirl * g);
            const sy = cy + dx * Math.sin(swirl * g) + dy * Math.cos(swirl * g);
            const shake = (Math.random() - 0.5) * (g > 0.85 ? 3 : 0) * (1 + charge * 3);
            return { x: lerp(sx, c.x, g) + shake, y: lerp(sy, c.y, g) + shake };
          });
          rgb = anim.from;
        } else {
          if (!anim.peaked) {
            anim.peaked = true;
            lastBoomAt = performance.now();
            anim.onPeak();
          }
          const b = Math.min(1, (t - GATHER_MS - HOLD_MS) / BOOM_MS);
          const e = easeOutExpo(b);
          pos = pts.map((q, i) => {
            const c = centre(q);
            return { x: lerp(c.x, natural[i].x, e), y: lerp(c.y, natural[i].y, e) };
          });
          rgb = mix(anim.from, anim.to, Math.min(1, b * 3));
          flash = Math.max(0, 1 - b * 2.2);
          if (b >= LAND_AT && !anim.landed) {
            anim.landed = true;
            anim.onLand();
          }
          if (b >= 1) {
            fieldRgb = anim.to;
            anim = null;
            busy = false;
          }
        }
      }

      const key = rgb.map(Math.round).join();
      if (key !== spriteKey) {
        sprite = haloSprite(rgb);
        spriteKey = key;
      }
      const c = rgb.map(Math.round).join(",");

      // Halos, on the haze layer: overlaps saturate, so clusters read as clearer patches, never hot spots.
      hctx.clearRect(0, 0, haze.width, haze.height);
      for (let i = 0; i < pos.length; i++) {
        const z = pts[i].z;
        const s = HALO_PX * (0.55 + z * 0.6) * HAZE_SCALE;
        hctx.globalAlpha = STAMP_ALPHA * z;
        hctx.drawImage(sprite, pos[i].x * HAZE_SCALE - s, pos[i].y * HAZE_SCALE - s, s * 2, s * 2);
      }
      ctx.globalAlpha = HAZE_MAX;
      ctx.drawImage(haze, 0, 0, w, h);
      ctx.globalAlpha = 1;

      // Faint links between close points. Skipped mid-explosion: with every
      // point in one ball, every pair would link.
      if (!busy) {
        ctx.lineWidth = 1;
        for (let i = 0; i < pos.length; i++) {
          for (let j = i + 1; j < pos.length; j++) {
            const d = Math.hypot(pos[i].x - pos[j].x, pos[i].y - pos[j].y);
            if (d < LINK_PX) {
              ctx.strokeStyle = `rgba(${c},${0.09 * (1 - d / LINK_PX) * Math.min(pts[i].z, pts[j].z)})`;
              ctx.beginPath();
              ctx.moveTo(pos[i].x, pos[i].y);
              ctx.lineTo(pos[j].x, pos[j].y);
              ctx.stroke();
            }
          }
        }
      }

      const p = busy ? null : pointer.current;
      let near: { i: number; d: number }[] = [];
      if (p) {
        near = pos
          .map((q, i) => ({ i, d: Math.hypot(q.x - p.x, q.y - p.y) }))
          .sort((a, b) => a.d - b.d)
          .slice(0, K)
          .filter((n) => n.d < REACH_PX);
        for (const n of near) {
          ctx.strokeStyle = `rgba(${c},${0.75 * (1 - n.d / REACH_PX) + 0.1})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(pos[n.i].x, pos[n.i].y);
          ctx.stroke();
        }
      }

      const hot = new Set(near.map((n) => n.i));
      for (let i = 0; i < pos.length; i++) {
        const q = pos[i];
        const z = pts[i].z;
        const isHot = hot.has(i);
        ctx.fillStyle = isHot ? `rgba(${c},1)` : `rgba(${c},${busy ? 0.9 : 0.18 + z * 0.32})`;
        ctx.beginPath();
        ctx.arc(q.x, q.y, isHot ? 2.6 : 0.8 + z * 1.1 + (busy ? 0.6 : 0), 0, Math.PI * 2);
        ctx.fill();
      }

      // The charging core during the hold: a small hot glow that swells.
      if (charge > 0) {
        const r = Math.min(w, h) * (0.06 + charge * 0.05);
        const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, r);
        grad.addColorStop(0, `rgba(255,255,255,${0.22 * charge})`);
        grad.addColorStop(0.4, `rgba(${c},${0.18 * charge})`);
        grad.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // The flash at the moment of the boom: the new colour, washed out to white.
      if (flash > 0) {
        const r = Math.hypot(w, h) * (1 - flash) * 0.7 + 40;
        const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, r);
        grad.addColorStop(0, `rgba(255,255,255,${0.55 * flash})`);
        grad.addColorStop(0.25, `rgba(${c},${0.35 * flash})`);
        grad.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }
    };

    const step = (now: number) => {
      for (const q of pts) {
        q.x += q.vx;
        q.y += q.vy;
        // A weak pull back to the cluster keeps the shape from dissolving.
        const [cx, cy] = CLUSTERS[q.c];
        q.vx += (cx - q.x) * 0.000004;
        q.vy += (cy - q.y) * 0.000004;
      }
      draw(now);
      raf = requestAnimationFrame(step);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.current = { x: e.clientX, y: e.clientY };
      // The coordinate tag only shows over the hero, never on top of the demos.
      const hero = (e.target as Element | null)?.closest?.("#top");
      setTag(hero && !anim ? { x: e.clientX, y: e.clientY, nx: e.clientX / w, ny: e.clientY / h } : null);
      if (still) draw(performance.now());
    };
    const onLeave = () => {
      pointer.current = null;
      setTag(null);
      if (still) draw(performance.now());
    };
    const onScroll = () => {
      setTag(null);
      if (still) draw(performance.now());
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    if (still) draw(performance.now());
    else raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <canvas ref={canvas} className="absolute inset-0" />
      {tag && (
        <div
          className="absolute hidden whitespace-nowrap rounded-sm bg-brand px-1.5 py-0.5 font-mono text-[10px] text-on-brand md:block"
          style={{ left: tag.x + 12, top: tag.y + 12 }}
        >
          k={K} · x {tag.nx.toFixed(3)} · y {tag.ny.toFixed(3)}
        </div>
      )}
    </div>
  );
}

/** Mount in a page to set the field's colour for that page. Takes a name, not
 *  an Rgb: server-rendered pages cannot read constants out of a client module. */
export function FieldColor({ theme }: { theme: "magenta" | "green" }) {
  useEffect(() => {
    setFieldColor(theme === "green" ? GREEN : MAGENTA);
  }, [theme]);
  return null;
}
