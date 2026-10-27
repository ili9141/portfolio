"use client";

import { useEffect, useState } from "react";
import { useT } from "../lang";
import { useInView } from "../motion";

// An illustration of the four-step route pattern, written for this site (not
// Lama's code). Each line carries the step it belongs to; -1 = shared.
const CODE: [string, number][] = [
  ["export async function PATCH(req: Request, ctx: RouteCtx) {", -1],
  ["  // 1 · who is asking, and may they?", 0],
  ['  const auth = await requireRole(["admin", "clinic_manager"]);', 0],
  ["  if (!auth.ok) return auth.response; // 401 or 403", 0],
  ["", -1],
  ["  // 2 · is the body exactly what we expect?", 1],
  ["  const body = await validateRequest(req, providerUpdate.strict());", 1],
  ["  if (!body.ok) return body.response; // 400, unknown keys included", 1],
  ["", -1],
  ["  // 3 · run it, scoped to the caller — never to the body", 2],
  ["  const { data, error } = await applyTenantScope(", 2],
  ['    db.from("providers").update(body.data).eq("id", ctx.id),', 2],
  ["    auth.ctx,", 2],
  ["  ).select().single();", 2],
  ['  if (error || !data) return apiError(404, "not_found");', 2],
  ["", -1],
  ["  // 4 · leave a trace", 3],
  ['  await logActivity(auth.ctx, "provider.updated", data.id);', 3],
  ["  return Response.json(data);", -1],
  ["}", -1],
];

// Until the visitor picks a step, the steps take turns on their own.
const CYCLE_MS = 3200;

/** Minimal highlighting: comments faint, strings tinted, the rest plain. */
function Line({ text }: { text: string }) {
  const comment = text.indexOf("//");
  const code = comment >= 0 ? text.slice(0, comment) : text;
  const parts = code.split(/("[^"]*")/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('"') ? (
          <span key={i} className="text-annot">
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
      {comment >= 0 && <span className="text-ink-faint">{text.slice(comment)}</span>}
    </>
  );
}

export function RoutePattern() {
  const t = useT().dev.platform.pattern;
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(false);
  const [ref, seen] = useInView<HTMLDivElement>();

  useEffect(() => {
    if (!seen || picked) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % 4), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [seen, picked]);

  return (
    <div ref={ref} className="sheet grid gap-0 overflow-hidden rounded-sm lg:grid-cols-[1.35fr_1fr]">
      <pre className="min-w-0 overflow-x-auto bg-[#030303] py-4 font-mono text-[12.5px] leading-[1.8] sm:text-[13px]">
        {CODE.map(([text, s], i) => {
          const on = s === step;
          return (
            <div
              key={i}
              className={`border-l-2 px-4 transition-[background-color,opacity,border-color] duration-300 ${
                on ? "border-annot bg-annot-wash text-ink" : s === -1 ? "border-transparent text-ink-soft" : "border-transparent text-ink-soft opacity-45"
              }`}
            >
              <span className="mr-4 inline-block w-5 select-none text-right text-ink-faint/60">{i + 1}</span>
              <Line text={text} />
              {text === "" && " "}
            </div>
          );
        })}
      </pre>
      <div className="flex flex-col p-5 sm:p-6">
        <ol className="space-y-2">
          {t.steps.map((s, i) => (
            <li key={s.name}>
              <button
                onClick={() => {
                  setPicked(true);
                  setStep(i);
                }}
                aria-pressed={step === i}
                className={`w-full rounded-sm border px-4 py-3 text-left transition-colors ${
                  step === i ? "border-annot bg-annot-wash" : "border-rule hover:border-ink-faint"
                }`}
              >
                <span className="flex items-baseline gap-3">
                  <span className="font-mono text-sm text-annot">{i + 1}</span>
                  <span className="text-[17px] font-semibold">{s.name}</span>
                </span>
                {step === i && <span className="mt-2 block text-[15px] leading-relaxed text-ink-soft">{s.body}</span>}
              </button>
            </li>
          ))}
        </ol>
        <p className="mt-auto pt-5 text-xs text-ink-faint">{t.note}</p>
      </div>
    </div>
  );
}
