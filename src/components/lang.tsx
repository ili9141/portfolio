"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { content, type Lang } from "@/content/site";

type Ctx = { lang: Lang; setLang: (l: Lang) => void };

const LangContext = createContext<Ctx>({ lang: "fr", setLang: () => {} });

const KEY = "lang";

// The choice lives in localStorage, read through a tiny external store so the
// server render (always French) and the first client render agree. Storage can
// throw (private mode, blocked site data), so an in-memory value backs it up.
let memory: Lang | null = null;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): Lang {
  if (memory) return memory;
  try {
    return localStorage.getItem(KEY) === "en" ? "en" : "fr";
  } catch {
    return "fr";
  }
}

function setLang(l: Lang) {
  memory = l;
  try {
    localStorage.setItem(KEY, l);
  } catch {}
  listeners.forEach((cb) => cb());
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, () => "fr" as Lang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function useT() {
  return content[useContext(LangContext).lang];
}
