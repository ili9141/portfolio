"use client";

// Thin client wrappers: the page is a server component and cannot read the
// language context, so these pick the dev side's text and hand it to the
// shared blocks.
import { useT } from "../lang";
import { Figures, Skills } from "../Sections";

export function DevFigures() {
  return <Figures items={useT().dev.figures} />;
}

export function DevSkills() {
  return <Skills data={useT().dev.skills} n="03" />;
}
