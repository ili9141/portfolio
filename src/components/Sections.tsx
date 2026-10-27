"use client";

import { AmanDemo } from "./AmanDemo";
import { CostSlider } from "./CostSlider";
import { DocReader } from "./DocReader";
import { useT } from "./lang";
import { BoxedTitle, CountUp, Reveal } from "./motion";
import { VerifierBench } from "./VerifierBench";

export function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-sm uppercase tracking-[0.14em] text-annot md:text-base">{children}</p>;
}

export function Title({ n, children }: { n: string; children: string }) {
  return (
    <Reveal className="pt-4">
      <BoxedTitle tag={`section_${n}`} text={children} className="display max-w-4xl text-[2.4rem] sm:text-6xl" />
    </Reveal>
  );
}

export function Sub({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <h3 className="flex items-baseline gap-3 text-2xl font-bold tracking-tight sm:text-[28px]" style={{ fontStretch: "112%" }}>
      <span className="font-mono text-sm font-normal text-annot">{n}</span>
      {children}
    </h3>
  );
}

export function Chips({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <li key={s} className="rounded-full border border-rule px-3 py-1 font-mono text-xs text-ink-soft">
          {s}
        </li>
      ))}
    </ul>
  );
}

type Figure = { value: string; label: string; note: string };

/** The strip of key figures under a hero; defaults to the AI side's. */
export function Figures({ items }: { items?: readonly Figure[] }) {
  const ai = useT().figures;
  const figures = items ?? ai;
  return (
    <section className="border-y border-rule bg-sheet/50">
      <dl className="mx-auto grid max-w-[1680px] grid-cols-2 px-4 sm:px-8 lg:px-14 lg:grid-cols-4">
        {figures.map((f, i) => (
          <Reveal
            key={f.label}
            delay={i * 90}
            className={`py-7 pr-4 ${i % 2 ? "border-l border-rule pl-4 sm:pl-6" : ""} ${i > 1 ? "border-t border-rule lg:border-t-0" : ""} ${
              i === 2 ? "lg:border-l lg:pl-6" : ""
            }`}
          >
            <dt className="sr-only">{f.label}</dt>
            <dd className="display text-[2rem] text-annot sm:text-[2.6rem]">
              <CountUp text={f.value} />
            </dd>
            <dd className="mt-2 text-base text-ink">{f.label}</dd>
            <dd className="mt-1 text-sm leading-snug text-ink-faint">{f.note}</dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}

export function Lama() {
  const t = useT().lama;
  return (
    <section id="lama" className="mx-auto max-w-[1680px] scroll-mt-24 px-4 py-24 sm:px-8 lg:px-14">
      <Kicker>{t.kicker}</Kicker>
      <div className="mt-4">
        <Title n="01">{t.title}</Title>
      </div>
      <div className="mt-8 grid max-w-4xl gap-5 text-lg leading-relaxed text-ink-soft md:grid-cols-2 md:text-xl">
        {t.intro.map((p, i) => (
          <Reveal key={p.slice(0, 20)} delay={i * 120}>
            <p>{p}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-14">
        <Sub n="1.1">{t.reader.title}</Sub>
        <div className="mt-5">
          <DocReader />
        </div>
      </Reveal>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <Sub n="1.2">{t.build.title}</Sub>
          <ol className="mt-5 space-y-5">
            {t.build.items.map((item, i) => (
              <Reveal as="li" key={i} delay={i * 100} className="grid grid-cols-[2.4rem_1fr] text-[17px] leading-relaxed text-ink-soft md:text-lg">
                <span className="font-mono text-sm text-annot">0{i + 1}</span>
                <span>{item}</span>
              </Reveal>
            ))}
          </ol>
          <div className="mt-6">
            <Chips items={t.stack} />
          </div>
        </Reveal>
        <Reveal delay={120}>
          <Sub n="1.3">{t.bench.title}</Sub>
          <p className="mt-3 text-[17px] leading-relaxed text-ink-soft md:text-lg">{t.bench.lead}</p>
          <div className="mt-5">
            <VerifierBench />
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-16">
        <Sub n="1.4">{t.cost.title}</Sub>
        <p className="mt-3 max-w-3xl text-[17px] leading-relaxed text-ink-soft md:text-lg">{t.cost.lead}</p>
        <div className="mt-5">
          <CostSlider />
        </div>
      </Reveal>

      <div className="mt-16 grid gap-5 md:grid-cols-2">
        <Reveal className="marks rounded-sm border border-rule bg-sheet/40 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Sub n="1.5">{t.mail.title}</Sub>
            <span className="rounded-full px-2 py-0.5 font-mono text-[9px] uppercase text-ink-soft ring-1 ring-rule">{t.mail.tag}</span>
          </div>
          <p className="mt-3 text-[17px] leading-relaxed text-ink-soft md:text-lg">{t.mail.body}</p>
          <ul className="mt-4 space-y-2 text-base">
            {t.mail.guards.map((g) => (
              <li key={g} className="flex gap-2">
                <span className="text-annot">✓</span>
                {g}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={120} className="marks rounded-sm border border-rule bg-sheet/40 p-5 sm:p-6">
          <Sub n="1.6">{t.backend.title}</Sub>
          <p className="mt-3 text-[17px] leading-relaxed text-ink-soft md:text-lg">{t.backend.body}</p>
        </Reveal>
      </div>
    </section>
  );
}

type ProjectLike = { name: string; meta: string; title: string; figures: readonly { v: string; l: string }[] };

export function ProjectHead({ p, big = false }: { p: ProjectLike; big?: boolean }) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-mono text-sm text-annot">{p.name}</p>
        <p className="text-right font-mono text-xs text-ink-faint">{p.meta}</p>
      </div>
      <h3
        className={`mt-3 font-bold leading-tight tracking-tight ${big ? "text-[26px] sm:text-[32px]" : "text-[22px]"}`}
        style={{ fontStretch: "112%" }}
      >
        {p.title}
      </h3>
      <dl className="mt-5 grid grid-cols-3 gap-2 border-y border-rule py-4">
        {p.figures.map((f) => (
          <div key={f.l}>
            <dd className={`display whitespace-nowrap text-annot ${big ? "text-[22px]" : "text-[17px]"}`}>{f.v}</dd>
            <dt className="mt-1 text-xs leading-tight text-ink-faint">{f.l}</dt>
          </div>
        ))}
      </dl>
    </>
  );
}

export function Projects() {
  const t = useT().projects;
  const [featured, ...rest] = t.items;
  return (
    <section id="projets" className="scroll-mt-24">
      <div className="mx-auto max-w-[1680px] px-4 py-24 sm:px-8 lg:px-14">
        <Kicker>{t.kicker}</Kicker>
        <div className="mt-4">
          <Title n="02">{t.title}</Title>
        </div>

        {/* AMAN gets the full width: its write-up and the live demo in one card. */}
        <Reveal as="article" className="sheet mt-12 rounded-sm p-5 sm:p-7">
          <div className="grid gap-x-10 gap-y-4 lg:grid-cols-[1fr_1.15fr]">
            <div>
              <ProjectHead p={featured} big />
            </div>
            <div className="flex flex-col justify-between gap-5 lg:pt-9">
              <p className="text-base leading-relaxed text-ink-soft md:text-[17px]">{featured.body}</p>
              <Chips items={featured.stack} />
            </div>
          </div>
          <div className="mt-8 border-t border-rule pt-7">
            <AmanDemo embedded />
          </div>
        </Reveal>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {rest.map((p, i) => (
            <Reveal as="article" key={p.name} delay={i * 120} className="marks sheet flex flex-col rounded-sm p-5 sm:p-6">
              <ProjectHead p={p} />
              <p className="mt-4 flex-1 text-base leading-relaxed text-ink-soft md:text-[17px]">{p.body}</p>
              {p.link && (
                <a
                  href={p.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-5 inline-flex flex-wrap items-baseline gap-x-2 self-start"
                >
                  <span className="rounded-full border border-annot/60 px-4 py-1.5 text-[15px] font-medium text-annot transition-colors group-hover:bg-brand group-hover:border-brand group-hover:text-on-brand">
                    {p.link.label} ↗
                  </span>
                  <span className="text-[15px] text-ink-soft">{p.link.note}</span>
                </a>
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

export function Path() {
  const t = useT().path;
  return (
    <section id="parcours" className="mx-auto max-w-[1680px] scroll-mt-24 px-4 py-24 sm:px-8 lg:px-14">
      <Title n="03">{t.title}</Title>
      <ol className="mt-12 border-l border-rule">
        {t.items.map((it, i) => (
          <Reveal as="li" key={it.title} delay={i * 120} className="relative pb-12 pl-6 last:pb-0 sm:grid sm:grid-cols-[12rem_1fr] sm:gap-6 sm:pl-8">
            <span className="absolute -left-[6px] top-1.5 h-3 w-3 rotate-45 border-2 border-annot bg-paper" />
            <p className="font-mono text-sm text-annot sm:pt-1">{it.date}</p>
            <div>
              <h3 className="text-xl font-bold tracking-tight" style={{ fontStretch: "112%" }}>
                {it.title}
              </h3>
              <p className="mt-0.5 text-base text-ink-faint">{it.place}</p>
              <p className="mt-2 max-w-3xl text-[17px] leading-relaxed text-ink-soft md:text-lg">{it.body}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

type SkillsData = { title: string; groups: readonly { name: string; items: readonly string[] }[] };

/** The skills grid; defaults to the AI side's list and section number. */
export function Skills({ data, n = "04" }: { data?: SkillsData; n?: string }) {
  const ai = useT().skills;
  const t = data ?? ai;
  return (
    <section id="competences" className="scroll-mt-24">
      <div className="mx-auto max-w-[1680px] px-4 py-24 sm:px-8 lg:px-14">
        <Title n={n}>{t.title}</Title>
        <dl className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {t.groups.map((g, i) => (
            <Reveal key={g.name} delay={(i % 3) * 90} className="border-t-2 border-annot/60 pt-3">
              <dt className="font-mono text-xs uppercase tracking-wider text-annot">{g.name}</dt>
              <dd className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-lg">
                {g.items.map((s) => (
                  <span key={s} className="transition-colors hover:text-annot">
                    {s}
                  </span>
                ))}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Contact({ n = "05" }: { n?: string }) {
  const t = useT().contact;
  const links = [
    { label: "Email", value: t.email, href: `mailto:${t.email}` },
    { label: "Tél.", value: t.phone, href: `tel:${t.phone.replace(/\s/g, "")}` },
    { label: "GitHub", value: t.github, href: `https://${t.github}`, external: true },
    { label: "PDF", value: `${t.cv} ↓`, href: "/cv/CV_Ilias_AitBarrehil_FR.pdf" },
  ];
  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden border-t border-rule bg-sheet/60">
      <div className="mx-auto max-w-[1680px] px-4 py-24 sm:px-8 lg:px-14">
        <Reveal className="pt-4">
          <BoxedTitle tag={`section_${n}`} text={t.title} className="display text-[2.6rem] sm:text-7xl" />
        </Reveal>
        <Reveal delay={100}>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft md:text-xl">{t.body}</p>
        </Reveal>
        <ul className="mt-10 grid gap-3 text-base sm:grid-cols-2 lg:grid-cols-4">
          {links.map((l, i) => (
            <Reveal as="li" key={l.label} delay={150 + i * 80}>
              <a
                className="group block rounded-sm border border-rule px-4 py-3 transition-colors hover:border-brand hover:bg-brand hover:text-on-brand"
                href={l.href}
                {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-faint group-hover:text-on-brand/70">
                  {l.label}
                </span>
                {l.value}
              </a>
            </Reveal>
          ))}
        </ul>
        <p className="mt-20 border-t border-rule pt-5 font-mono text-xs text-ink-faint">{t.footer}</p>
      </div>
    </section>
  );
}
