import { useState } from "react";
import { Segmented } from "@kjaniec-dev/ui";
import { LANGS, getLocale, langPath, type Lang, type ThemeChoice } from "../i18n";
import { applyTheme, readTheme } from "../lib/theme";

const THEMES: ThemeChoice[] = ["system", "light", "dark"];

export default function HeaderControls({ lang }: { lang: Lang }) {
  const { m } = getLocale(lang);
  const [theme, setTheme] = useState<ThemeChoice>(readTheme);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Segmented
        aria-label={m.header.languageLabel}
        value={lang}
        options={LANGS.map((value) => ({
          value,
          label: (
            <span lang={value} title={getLocale(value).m.nativeName}>
              {value.toUpperCase()}
            </span>
          ),
        }))}
        // Keep the hash so a result link survives a language change.
        onChange={(next) => location.assign(langPath(next) + location.hash)}
      />
      <Segmented
        aria-label={m.header.themeLabel}
        value={theme}
        options={THEMES.map((value) => ({ value, label: m.header.themes[value] }))}
        onChange={(next) => {
          setTheme(next);
          applyTheme(next);
        }}
      />
    </div>
  );
}
