import { useSyncExternalStore } from "react";

export type Prefs = {
  theme: "light" | "dark" | "system";
  language: "english" | "pidgin" | "yoruba" | "hausa" | "igbo";
  jobAlerts: boolean;
  chatMessages: boolean;
  marketing: boolean;
  shareLocation: boolean;
  hidePhone: boolean;
};

const KEY = "fixnear:settings:v1";

export const DEFAULTS: Prefs = {
  theme: "light",
  language: "english",
  jobAlerts: true,
  chatMessages: true,
  marketing: false,
  shareLocation: true,
  hidePhone: false,
};

let prefs: Prefs = load();
const listeners = new Set<() => void>();
let mql: MediaQueryList | null = null;

function load(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Prefs>) };
  } catch {
    return DEFAULTS;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* noop */
  }
}

export function applyTheme() {
  if (typeof document === "undefined") return;
  const wantDark =
    prefs.theme === "dark" ||
    (prefs.theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", wantDark);
  document.documentElement.style.colorScheme = wantDark ? "dark" : "light";

  // subscribe to system changes only in "system" mode
  if (typeof window !== "undefined") {
    if (!mql) mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.onchange = prefs.theme === "system" ? () => applyTheme() : null;
  }
}

export function getPrefs(): Prefs {
  return prefs;
}

export function setPref<K extends keyof Prefs>(k: K, v: Prefs[K]) {
  prefs = { ...prefs, [k]: v };
  persist();
  if (k === "theme") applyTheme();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(
    subscribe,
    () => prefs,
    () => DEFAULTS,
  );
}
