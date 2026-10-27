"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLang, useT } from "./lang";
import { explode, EXPLODE_TOTAL_MS, GREEN, MAGENTA } from "./LatentField";

// The boom button is how you switch sides: from the AI portfolio (magenta) to
// the dev side (green, /dev), and back. The page change happens at the moment
// the points are all gathered in the centre (see explode() in LatentField).
const DEV = "/dev";

// One safety timer for the whole page: a newer explosion cancels the older timer.
let safetyTimer: number | undefined;

function BoomButton() {
  const pathname = usePathname();
  const router = useRouter();
  const onDev = pathname === DEV;
  const href = onDev ? "/" : DEV;

  useEffect(() => {
    router.prefetch(href);
  }, [router, href]);

  const go = () => {
    const root = document.documentElement;
    // The page (navbar included) is hidden only once an explosion has really
    // started; a refused click must not leave it hidden.
    explode(onDev ? MAGENTA : GREEN, {
      onStart: () => {
        root.classList.add("exploding");
        // Safety net: never leave the page hidden longer than an explosion lasts.
        window.clearTimeout(safetyTimer);
        safetyTimer = window.setTimeout(() => root.classList.remove("exploding"), EXPLODE_TOTAL_MS + 800);
      },
      onPeak: () => router.push(href),
      onLand: () => root.classList.remove("exploding"),
    });
  };

  return (
    <button
      onClick={go}
      className="group inline-flex items-center gap-2 rounded-full border border-annot/60 px-3 py-1.5 font-mono sm:px-3.5 text-[13px] uppercase tracking-wider text-annot transition-colors hover:border-brand hover:bg-brand hover:text-on-brand"
    >
      <span className="relative inline-block h-2 w-2 rounded-full bg-annot group-hover:bg-on-brand">
        <span className="absolute inset-0 animate-ping rounded-full bg-annot/60 group-hover:hidden" />
      </span>
      {onDev ? "↩ boom" : "boom"}
    </button>
  );
}

export function Header() {
  const all = useT();
  const { lang, setLang } = useLang();
  const pathname = usePathname();
  const links =
    pathname === DEV
      ? ([
          ["#plateforme", all.devNav.platform],
          ["#projets", all.devNav.projects],
          ["#competences", all.devNav.skills],
          ["#contact", all.devNav.contact],
        ] as const)
      : ([
          ["#lama", all.nav.lama],
          ["#projets", all.nav.projects],
          ["#parcours", all.nav.path],
          ["#competences", all.nav.skills],
          ["#contact", all.nav.contact],
        ] as const);

  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/80 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1680px] items-center justify-between gap-3 px-4 sm:px-8 lg:px-14">
        <Link href="/" className="display text-2xl tracking-tight">
          IAB<span className="text-annot">.</span>
        </Link>
        {/* From lg up only: with BOOM and FR/EN, five links do not fit a tablet's width. */}
        <nav className="hidden items-center gap-6 font-mono text-[13px] uppercase tracking-wider text-ink lg:flex xl:gap-10">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="group relative transition-colors hover:text-ink">
              {label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-annot transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <BoomButton />
          <div className="flex rounded-full border border-rule p-1 font-mono text-[13px]" role="group" aria-label="Language">
            {(["fr", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`rounded-full px-2.5 py-1.5 uppercase transition-colors sm:px-3.5 ${lang === l ? "bg-ink text-paper" : "text-ink-faint hover:text-ink"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
