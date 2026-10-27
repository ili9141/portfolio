import type { Metadata } from "next";
import { DevFigures, DevSkills } from "@/components/dev/DevBits";
import { DevHero } from "@/components/dev/DevHero";
import { DevProjects, Platform } from "@/components/dev/DevSections";
import { Header } from "@/components/Header";
import { FieldColor } from "@/components/LatentField";
import { LossCurve } from "@/components/motion";
import { Contact } from "@/components/Sections";

export const metadata: Metadata = {
  title: "Dev — Ilias Ait Barrehil",
  description:
    "Le côté dev : le backend multi-tenant de la plateforme Lama Healthcare (routes, schéma PostgreSQL, Row-Level Security), et des projets en .NET et Laravel.",
};

// The dev side: the same system in coder green, reached through the boom button.
export default function Dev() {
  return (
    <div className="theme-root" data-theme="green">
      <FieldColor theme="green" />
      <Header />
      <main className="relative z-10">
        <DevHero />
        <DevFigures />
        <Platform />
        <LossCurve />
        <DevProjects />
        <LossCurve />
        <DevSkills />
        <Contact n="04" />
      </main>
    </div>
  );
}
