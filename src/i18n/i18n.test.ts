import { describe, expect, test } from "vitest";

import { QUESTION_DEFS } from "../lib/questions";
import { buildMailto, buildSummary } from "../lib/summary";
import { DEFAULT_LANG, LANGS, getLocale, isLang, langPath } from "./index";

describe.each(LANGS)("%s catalog", (lang) => {
  const { m, areas, questions } = getLocale(lang);

  test("has complete wording for every question", () => {
    expect(questions).toHaveLength(QUESTION_DEFS.length);
    for (const q of questions) {
      expect(q.options, `${q.id}: options`).toHaveLength(4);
      for (const text of [q.text, q.risk, q.impact, q.fix, ...q.options]) {
        expect(text.trim(), `${q.id}: empty text`).not.toBe("");
      }
      expect(new Set(q.options).size, `${q.id}: options are distinct`).toBe(4);
    }
  });

  test("has a name for every area", () => {
    for (const area of areas) {
      expect(area.name.trim(), area.id).not.toBe("");
      expect(area.short.trim(), area.id).not.toBe("");
    }
  });

  test("localised strings for dynamic text interpolate their numbers", () => {
    expect(m.intro.resume(3, 20)).toMatch(/3.*20/);
    expect(m.quiz.step(2, 5, 8, 20)).toMatch(/2.*5.*8.*20/);
    expect(m.results.scoreLabel(42)).toContain("42");
    expect(m.results.radar([{ name: "X", score: 7 }])).toContain("X 7");
    expect(m.results.risks(3)).not.toBe(m.results.risks(1));
  });

  test("builds a mail in its own language", () => {
    const summary = buildSummary({
      overall: 42,
      ratingLabel: m.ratings["needs-attention"].label,
      areaResults: [{ name: areas[0]!.name, score: 40 }],
      risks: [{ title: questions[0]!.risk, areaName: areas[0]!.name }],
      link: "https://example.test/#r=1.0",
      email: m.email,
    });
    expect(summary).toContain(m.ratings["needs-attention"].label);
    const href = buildMailto({ to: "me@example.test", overall: 42, summary, email: m.email });
    expect(decodeURIComponent(href)).toContain(m.email.subject(42));
  });
});

test("languages are actually translated, not copies", () => {
  const en = getLocale("en");
  const pl = getLocale("pl");
  for (const [i, q] of pl.questions.entries()) {
    expect(q.text, q.id).not.toBe(en.questions[i]!.text);
    expect(q.fix, q.id).not.toBe(en.questions[i]!.fix);
  }
  expect(pl.m.results.title).not.toBe(en.m.results.title);
});

test("language routing", () => {
  expect(langPath(DEFAULT_LANG)).toBe("/");
  expect(langPath("pl")).toBe("/pl/");
  expect(isLang("pl")).toBe(true);
  expect(isLang("de")).toBe(false);
});
