import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The link-preview card (opengraph-image) and the tab icon are drawn by Satori,
// which reads one instance of a font and ignores variation axes. These static
// cuts of the site's variable fonts (src/fonts/static, made with fontTools'
// instancer) keep the wide, heavy headings the site has.
const FONT_DIR = join(process.cwd(), "src/fonts/static");

export async function ogFonts() {
  const [display, body, mono] = await Promise.all([
    readFile(join(FONT_DIR, "Archivo-ExtraBold-Expanded.ttf")),
    readFile(join(FONT_DIR, "Archivo-Medium.ttf")),
    readFile(join(FONT_DIR, "MartianMono-Regular.ttf")),
  ]);
  return [
    { name: "Display", data: display, weight: 800 as const, style: "normal" as const },
    { name: "Body", data: body, weight: 500 as const, style: "normal" as const },
    { name: "Mono", data: mono, weight: 400 as const, style: "normal" as const },
  ];
}

export const OG_SIZE = { width: 1200, height: 630 };

export const SIDES = {
  ai: { glow: "153,8,75", point: "#f4529d", accent: "#f4529d" },
  dev: { glow: "0,200,70", point: "#3dff7f", accent: "#3dff7f" },
} as const;

// The same seeded point field as the site's background, in miniature: three
// clusters on the right, each point joined to its two nearest neighbours.
function field() {
  let s = 7;
  const r = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const centres = [
    [930, 170, 95],
    [1060, 400, 80],
    [800, 470, 70],
  ];
  const pts: [number, number][] = [];
  for (const [cx, cy, spread] of centres) {
    for (let i = 0; i < 16; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * spread;
      pts.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d]);
    }
  }
  for (let i = 0; i < 26; i++) pts.push([560 + r() * 640, r() * 630]);
  const lines: [number, number, number, number][] = [];
  pts.forEach(([x, y], i) => {
    const near = pts
      .map(([u, v], j) => [Math.hypot(u - x, v - y), j] as const)
      .filter(([d, j]) => j !== i && d < 90)
      .sort((a, b) => a[0] - b[0])
      .slice(0, 2);
    for (const [, j] of near) if (j > i) lines.push([x, y, pts[j][0], pts[j][1]]);
  });
  return { pts, lines };
}

const FIELD = field();

export function OgCard({
  side,
  kicker,
  prompt,
  facts,
}: {
  side: keyof typeof SIDES;
  kicker: string;
  prompt?: boolean;
  facts: string;
}) {
  const c = SIDES[side];
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: `radial-gradient(circle at 78% 45%, rgba(${c.glow},0.30), rgba(${c.glow},0) 55%), #050505`,
        color: "#f5f1f3",
        fontFamily: "Body",
      }}
    >
      <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", left: 0, top: 0 }}>
        {FIELD.lines.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c.point} strokeOpacity={0.28} strokeWidth={1.2} />
        ))}
        {FIELD.pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 3.4 : 2.2} fill={c.point} fillOpacity={i % 3 === 0 ? 0.95 : 0.6} />
        ))}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 72px", width: "100%" }}>
        <div style={{ display: "flex", fontFamily: "Mono", fontSize: 22, letterSpacing: 3, color: c.accent }}>{kicker}</div>
        <div style={{ display: "flex", marginTop: 34, fontFamily: "Display", fontSize: 92, lineHeight: 1.02 }}>
          {prompt && <span style={{ color: c.accent, marginRight: 30 }}>&gt;</span>}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>Ilias</span>
            <span>
              Ait Barrehil<span style={{ color: c.accent }}>.</span>
            </span>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 44, fontSize: 30, color: "#cdc6cb" }}>{facts}</div>
      </div>
    </div>
  );
}

/** The tab icon: the navbar's mark cut down to one letter and its dot. */
export function IconMark({ px }: { px: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050505",
        borderRadius: px * 0.22,
        color: "#f5f1f3",
        fontFamily: "Display",
        fontSize: px * 0.78,
        lineHeight: 1,
        paddingBottom: px * 0.06,
      }}
    >
      I<span style={{ color: "#f4529d" }}>.</span>
    </div>
  );
}
