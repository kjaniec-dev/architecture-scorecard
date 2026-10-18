// The design kit switches theme with a `.dark` class on <html>. The choice is "system"
// (follow the OS), "light" or "dark"; only an explicit choice is stored.
// The inline script in Layout.astro applies the same rule before first paint.

import type { ThemeChoice } from "../i18n/types";

export const THEME_KEY = "architecture-scorecard.theme";

export function readTheme(): ThemeChoice {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Storage can be unavailable (private mode, blocked site data): fall back to the OS setting.
  }
  return "system";
}

export function applyTheme(choice: ThemeChoice): void {
  try {
    if (choice === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch {
    // The choice still applies for this visit.
  }
  const dark = choice === "dark" || (choice === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}
