"use client";

import { useState } from "react";
import { useLang, useT } from "../lang";

// Who sees which provider, by role. The rules mirror the platform's two scope
// helpers: org access (Lama admin: every org; credentialer: assigned orgs; the
// rest: their own org) and clinic access (clinic manager and staff: their clinic
// plus the org's providers with no clinic). Names are made up.
type Role = "lama_admin" | "credentialer" | "admin" | "clinic_manager" | "staff";
const ROLES: Role[] = ["lama_admin", "credentialer", "admin", "clinic_manager", "staff"];

type Bucket = { org: "A" | "B"; clinic: string | null; people: string[] };
const BUCKETS: Bucket[] = [
  { org: "A", clinic: "Nord", people: ["Dr. Reyes", "Dr. Ortiz"] },
  { org: "A", clinic: "Sud", people: ["Dr. Kim", "Dr. Haddad"] },
  { org: "A", clinic: null, people: ["Dr. Moreau"] },
  { org: "B", clinic: "Centre", people: ["Dr. Patel", "Dr. Silva"] },
  { org: "B", clinic: null, people: ["Dr. Novak"] },
];

// Where each demo user sits.
const HOME: Record<Role, { orgs: ("A" | "B")[]; clinic?: string }> = {
  lama_admin: { orgs: ["A", "B"] },
  credentialer: { orgs: ["A"] },
  admin: { orgs: ["A"] },
  clinic_manager: { orgs: ["A"], clinic: "Nord" },
  staff: { orgs: ["A"], clinic: "Sud" },
};

function sees(role: Role, b: Bucket) {
  const home = HOME[role];
  if (!home.orgs.includes(b.org)) return false;
  // Clinic-bound roles see their clinic and the org-level (no clinic) rows.
  if (home.clinic) return b.clinic === null || b.clinic === home.clinic;
  return true;
}

export function ScopeDemo() {
  const t = useT().dev.platform.scope;
  const { lang } = useLang();
  const [role, setRole] = useState<Role>("clinic_manager");
  const visible = BUCKETS.filter((b) => sees(role, b)).reduce((n, b) => n + b.people.length, 0);
  const total = BUCKETS.reduce((n, b) => n + b.people.length, 0);

  return (
    <div className="sheet rounded-sm p-5 sm:p-6">
      <div className="flex flex-wrap gap-2" role="tablist">
        {ROLES.map((r) => (
          <button
            key={r}
            role="tab"
            aria-selected={role === r}
            onClick={() => setRole(r)}
            className={`rounded-full border px-4 py-1.5 text-[15px] transition-colors ${
              role === r ? "border-brand bg-brand text-on-brand" : "border-rule text-ink-soft hover:border-ink-faint"
            }`}
          >
            {t.roles[r].name}
          </button>
        ))}
      </div>
      <p className="mt-4 text-[17px] text-ink" aria-live="polite">
        {t.roles[role].rule}{" "}
        <span className="font-mono text-sm text-annot">
          {visible}/{total} {t.visible}
        </span>
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-[1.6fr_1fr]">
        {(["A", "B"] as const).map((org) => (
          <div key={org} className="rounded-sm border border-rule p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-faint">{lang === "fr" ? "Cabinet" : "Practice"} {org}</p>
            <div className={`mt-3 grid gap-3 ${org === "A" ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
              {BUCKETS.filter((b) => b.org === org).map((b) => {
                const on = sees(role, b);
                return (
                  <div
                    key={b.clinic ?? "none"}
                    className={`rounded-sm border px-3 py-2.5 transition-all duration-300 ${
                      on ? "border-annot bg-annot-wash" : "border-dashed border-rule opacity-35"
                    }`}
                  >
                    <p className={`text-sm ${b.clinic ? "text-ink" : "italic text-ink-soft"}`}>{b.clinic ?? t.noClinic}</p>
                    <ul className="mt-1.5 space-y-0.5">
                      {b.people.map((p) => (
                        <li key={p} className="font-mono text-xs text-ink-soft">
                          {p}
                        </li>
                      ))}
                    </ul>
                    <p className={`mt-2 font-mono text-[10px] uppercase tracking-wider ${on ? "text-annot" : "text-ink-faint"}`}>
                      {on ? t.visible : t.hidden}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-ink-faint">{t.note}</p>
    </div>
  );
}
