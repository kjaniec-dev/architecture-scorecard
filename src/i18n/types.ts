import type { AreaId, QuestionId, QuestionText } from "../lib/questions";
import type { RatingKey, SeverityKey } from "../lib/scoring";

export const LANGS = ["en", "pl"] as const;
export type Lang = (typeof LANGS)[number];
export type ThemeChoice = "system" | "light" | "dark";

/** Everything a visitor can read. Both languages must satisfy this type, so none can fall behind. */
export interface Messages {
  /** Name of the language in its own language, for the language switch. */
  nativeName: string;
  meta: { title: string; description: string };
  header: {
    skip: string;
    badge: string;
    themeLabel: string;
    themes: Record<ThemeChoice, string>;
    languageLabel: string;
  };
  home: {
    lead: string;
    facts: readonly [string, string][];
    howTitle: string;
    how: readonly [string, string][];
    noscript: string;
  };
  intro: {
    start: string;
    resume: (answered: number, total: number) => string;
    seeLast: string;
    startOver: string;
  };
  quiz: {
    progress: string;
    step: (step: number, steps: number, answered: number, total: number) => string;
    back: string;
    next: string;
    seeResults: string;
    incomplete: string;
  };
  results: {
    title: string;
    scoreLabel: (score: number) => string;
    byArea: string;
    risks: (count: number) => string;
    noGaps: string;
    yourAnswer: string;
    whyItMatters: string;
    whatToDo: string;
    ctaTitle: string;
    ctaText: string;
    ctaButton: string;
    ctaMailHint: string;
    ctaBookingHint: string;
    copyLink: string;
    copied: string;
    copyFailed: string;
    print: string;
    retake: string;
    disclaimer: string;
    radar: (scores: { name: string; score: number }[]) => string;
  };
  ratings: Record<RatingKey, { label: string; text: string }>;
  severities: Record<SeverityKey, string>;
  email: {
    subject: (overall: number) => string;
    greeting: string;
    intro: string;
    about: string;
    heading: (overall: number, rating: string) => string;
    risks: string;
    fullResults: string;
  };
  footer: { source: string };
  areas: Record<AreaId, { name: string; short: string; blurb: string }>;
  questions: Record<QuestionId, QuestionText>;
}
