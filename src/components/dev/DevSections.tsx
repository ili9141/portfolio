"use client";

import { useT } from "../lang";
import { Reveal } from "../motion";
import { Chips, Kicker, ProjectHead, Sub, Title } from "../Sections";
import { RoutePattern } from "./RoutePattern";
import { ScopeDemo } from "./ScopeDemo";

export function Platform() {
  const t = useT().dev.platform;
  return (
    <section id="plateforme" className="mx-auto max-w-[1680px] scroll-mt-24 px-4 py-24 sm:px-8 lg:px-14">
      <Kicker>{t.kicker}</Kicker>
      <div className="mt-4">
        <Title n="01">{t.title}</Title>
      </div>
      <div className="mt-8 grid max-w-5xl gap-5 text-lg leading-relaxed text-ink-soft md:grid-cols-2 md:text-xl">
        {t.intro.map((p, i) => (
          <Reveal key={p.slice(0, 20)} delay={i * 120}>
            <p>{p}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-14">
        <Sub n="1.1">{t.pattern.title}</Sub>
        <p className="mt-3 max-w-3xl text-[17px] leading-relaxed text-ink-soft md:text-lg">{t.pattern.lead}</p>
        <div className="mt-5">
          <RoutePattern />
        </div>
      </Reveal>

      <Reveal className="mt-16">
        <Sub n="1.2">{t.scope.title}</Sub>
        <p className="mt-3 max-w-3xl text-[17px] leading-relaxed text-ink-soft md:text-lg">{t.scope.lead}</p>
        <div className="mt-5">
          <ScopeDemo />
        </div>
      </Reveal>

      <Reveal className="mt-16">
        <Sub n="1.3">{t.built.title}</Sub>
        <p className="mt-3 max-w-3xl text-[17px] leading-relaxed text-ink-soft md:text-lg">{t.built.lead}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {t.built.areas.map((a, i) => (
            <Reveal key={a.name} delay={i * 60} className="sheet rounded-sm p-5 sm:p-6">
              <h4 className="font-mono text-sm uppercase tracking-wider text-annot">{a.name}</h4>
              <ul className="mt-3 space-y-2">
                {a.items.map((it) => (
                  <li key={it} className="flex gap-3 text-base leading-snug text-ink-soft md:text-[17px]">
                    <span aria-hidden className="text-ink-faint">–</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
        <div className="mt-6">
          <Chips items={t.stack} />
        </div>
      </Reveal>

      <Reveal className="mt-16">
        <Sub n="1.4">{t.log.title}</Sub>
        <p className="mt-3 max-w-3xl text-[17px] leading-relaxed text-ink-soft md:text-lg">{t.log.lead}</p>
        <ol className="sheet mt-5 overflow-hidden rounded-sm">
          {t.log.items.map((it, i) => (
            <Reveal
              as="li"
              key={it.what}
              delay={i * 60}
              className="grid gap-2 border-b border-rule px-5 py-5 last:border-b-0 md:grid-cols-[1fr_2fr] md:gap-6 md:px-6"
            >
              <span className="text-[17px] font-semibold leading-snug">{it.what}</span>
              <span className="text-base leading-relaxed text-ink-soft md:text-[17px]">{it.found}</span>
            </Reveal>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}

export function DevProjects() {
  const t = useT().dev.projects;
  return (
    <section id="projets" className="scroll-mt-24">
      <div className="mx-auto max-w-[1680px] px-4 py-24 sm:px-8 lg:px-14">
        <Kicker>{t.kicker}</Kicker>
        <div className="mt-4">
          <Title n="02">{t.title}</Title>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {t.items.map((p, i) => (
            <Reveal as="article" key={p.name} delay={i * 120} className="marks sheet flex flex-col rounded-sm p-5 sm:p-6">
              <ProjectHead p={p} />
              <p className="mt-4 flex-1 text-base leading-relaxed text-ink-soft md:text-[17px]">{p.body}</p>
              {"link" in p && p.link && (
                <a
                  href={p.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-5 inline-flex flex-wrap items-baseline gap-x-2 self-start"
                >
                  <span className="rounded-full border border-annot/60 px-4 py-1.5 text-[15px] font-medium text-annot transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-on-brand">
                    {p.link.label} ↗
                  </span>
                  <span className="text-[15px] text-ink-soft">{p.link.note}</span>
                </a>
              )}
              {/* Where the others link to their code: say why this one cannot. */}
              {"closed" in p && p.closed && (
                <span className="mt-5 inline-flex items-center gap-2 self-start rounded-full border border-rule px-4 py-1.5 text-[15px] text-ink-faint">
                  <span aria-hidden>🔒</span>
                  {p.closed}
                </span>
              )}
              <div className="mt-5">
                <Chips items={p.stack} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
