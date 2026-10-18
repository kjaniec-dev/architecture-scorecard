import { describe, expect, test } from "vitest";

import { areas, questions, type Question } from "./questions";
import {
  decodeAnswers,
  encodeAnswers,
  fromResultHash,
  ratingFor,
  scoreAnswers,
  severityFor,
  toResultHash,
  topRisks,
  type Answers,
} from "./scoring";
import { buildMailto, buildSummary } from "./summary";

const all = (value: number | null): Answers => questions.map(() => value);

describe("question set", () => {
  test("is well formed", () => {
    expect(questions).toHaveLength(20);
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    for (const q of questions) {
      expect(areas.some((a) => a.id === q.area), `${q.id}: known area`).toBe(true);
      expect(q.options, `${q.id}: four options`).toHaveLength(4);
      for (const field of ["text", "risk", "impact", "fix"] as const) {
        expect(q[field].trim(), `${q.id}: ${field}`).not.toBe("");
      }
    }
    for (const area of areas) {
      expect(questions.some((q) => q.area === area.id), `${area.id}: has questions`).toBe(true);
    }
  });
});

describe("scoreAnswers", () => {
  test("best answers score 100, worst score 0", () => {
    const best = scoreAnswers(areas, questions, all(3));
    expect(best.overall).toBe(100);
    expect(Object.values(best.areas).every((s) => s === 100)).toBe(true);

    const worst = scoreAnswers(areas, questions, all(0));
    expect(worst.overall).toBe(0);
    expect(Object.values(worst.areas).every((s) => s === 0)).toBe(true);
  });

  test("is weighted", () => {
    const fixture = [
      { area: "a", weight: 3 as const },
      { area: "a", weight: 1 as const },
    ];
    // 9 of 12 available weighted points
    const result = scoreAnswers([{ id: "a" as never }], fixture, [3, 0]);
    expect(result.overall).toBe(75);
    expect(result.areas).toEqual({ a: 75 });
  });

  test("areas are independent of each other", () => {
    const answers = questions.map((q) => (q.area === "security" ? 3 : 0));
    const result = scoreAnswers(areas, questions, answers);
    for (const [id, score] of Object.entries(result.areas)) {
      expect(score).toBe(id === "security" ? 100 : 0);
    }
  });

  test("ignores unanswered questions instead of counting them as zero", () => {
    const answers = all(null);
    answers[0] = 3;
    expect(scoreAnswers(areas, questions, answers).overall).toBe(100);
    expect(scoreAnswers(areas, questions, all(null)).overall).toBe(0);
  });
});

describe("bands", () => {
  test.each([
    [0, "high-risk"],
    [29, "high-risk"],
    [30, "needs-attention"],
    [54, "needs-attention"],
    [55, "solid"],
    [79, "solid"],
    [80, "strong"],
    [100, "strong"],
  ])("rating for %i is %s", (score, key) => {
    expect(ratingFor(score).key).toBe(key);
  });

  test.each([
    [9, "high"],
    [6, "high"],
    [5, "medium"],
    [3, "medium"],
    [2, "low"],
  ])("severity for priority %i is %s", (priority, key) => {
    expect(severityFor(priority).key).toBe(key);
  });
});

describe("topRisks", () => {
  const q = (id: string, weight: 1 | 2 | 3): Question => ({
    id,
    area: "delivery",
    weight,
    text: id,
    options: ["a", "b", "c", "d"],
    risk: id,
    impact: "",
    fix: "",
  });

  test("ranks by weighted gap with stable tie-breaks", () => {
    const fixture = [
      q("w1-gap3", 1), // priority 3
      q("w3-gap1", 3), // priority 3, heavier: before w1-gap3
      q("w2-gap3", 2), // priority 6
      q("w3-best", 3), // no gap: excluded
      q("w3-gap3", 3), // priority 9
      q("w3-gap1-later", 3), // priority 3, same as w3-gap1 but asked later
    ];
    const answers = [0, 2, 0, 3, 0, 2];
    expect(topRisks(fixture, answers, 10).map((r) => r.question.id)).toEqual([
      "w3-gap3",
      "w2-gap3",
      "w3-gap1",
      "w3-gap1-later",
      "w1-gap3",
    ]);
    expect(topRisks(fixture, answers, 3)).toHaveLength(3);
  });

  test("returns nothing when every answer is the best one", () => {
    expect(topRisks(questions, all(3))).toEqual([]);
  });
});

describe("answer encoding", () => {
  test("round-trips", () => {
    const answers = questions.map((_, i) => (i % 5 === 4 ? null : i % 4));
    const code = encodeAnswers(answers);
    expect(code).toHaveLength(questions.length);
    expect(decodeAnswers(code, questions.length)).toEqual(answers);
  });

  test("rejects malformed input", () => {
    expect(decodeAnswers(null, 20)).toBeNull();
    expect(decodeAnswers("0123", 20)).toBeNull();
    expect(decodeAnswers("4".repeat(20), 20)).toBeNull();
    expect(decodeAnswers("x".repeat(20), 20)).toBeNull();
  });

  test("result hash only restores complete, current-version answers", () => {
    const answers = questions.map((_, i) => i % 4);
    expect(fromResultHash(toResultHash(answers), questions.length)).toEqual(answers);
    expect(fromResultHash("", questions.length)).toBeNull();
    expect(fromResultHash(`#r=99.${"0".repeat(20)}`, questions.length)).toBeNull();
    expect(fromResultHash(`#r=1.${"-".repeat(20)}`, questions.length)).toBeNull();
  });
});

describe("email summary", () => {
  test("builds the summary and a mailto link", () => {
    const summary = buildSummary({
      overall: 42,
      rating: { label: "Needs attention" },
      areaResults: [{ name: "Delivery & Releases", score: 40 }],
      risks: [{ title: "No tested way to undo a bad release", areaName: "Delivery & Releases" }],
      link: "https://example.test/#r=1.0",
    });
    expect(summary).toContain("42/100 (Needs attention)");
    expect(summary).toContain("1. No tested way to undo a bad release (Delivery & Releases)");
    expect(summary.endsWith("https://example.test/#r=1.0")).toBe(true);

    const href = buildMailto({ to: "me@example.test", overall: 42, summary });
    expect(href.startsWith("mailto:me@example.test?subject=")).toBe(true);
    expect(new URLSearchParams(href.split("?")[1]).get("body")).toContain(summary);
  });
});
