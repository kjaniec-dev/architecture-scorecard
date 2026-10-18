import { test } from "node:test";
import assert from "node:assert/strict";

import { areas, questions } from "../js/questions.js";
import {
  decodeAnswers,
  encodeAnswers,
  fromResultHash,
  isComplete,
  ratingFor,
  scoreAnswers,
  severityFor,
  toResultHash,
  topRisks,
} from "../js/scoring.js";
import { buildMailto, buildSummary } from "../js/summary.js";

const all = (value) => questions.map(() => value);

test("question set is well formed", () => {
  assert.equal(questions.length, 20);
  assert.equal(new Set(questions.map((q) => q.id)).size, questions.length, "unique ids");
  for (const q of questions) {
    assert.ok(areas.some((a) => a.id === q.area), `${q.id}: known area`);
    assert.equal(q.options.length, 4, `${q.id}: four options`);
    assert.ok([1, 2, 3].includes(q.weight), `${q.id}: weight 1-3`);
    for (const field of ["text", "risk", "impact", "fix"]) {
      assert.ok(q[field]?.trim(), `${q.id}: ${field} present`);
    }
  }
  for (const area of areas) {
    assert.ok(questions.some((q) => q.area === area.id), `${area.id}: has questions`);
  }
});

test("all best answers score 100, all worst score 0", () => {
  const best = scoreAnswers(areas, questions, all(3));
  assert.equal(best.overall, 100);
  assert.ok(best.areas.every((a) => a.score === 100));

  const worst = scoreAnswers(areas, questions, all(0));
  assert.equal(worst.overall, 0);
  assert.ok(worst.areas.every((a) => a.score === 0));
});

test("scores are weighted", () => {
  const fixture = [
    { area: "a", weight: 3 },
    { area: "a", weight: 1 },
  ];
  const result = scoreAnswers([{ id: "a" }], fixture, [3, 0]);
  // 9 of 12 available weighted points
  assert.equal(result.overall, 75);
  assert.deepEqual(result.areas, [{ id: "a", score: 75 }]);
});

test("area scores are independent of other areas", () => {
  const answers = questions.map((q) => (q.area === "security" ? 3 : 0));
  const result = scoreAnswers(areas, questions, answers);
  for (const area of result.areas) {
    assert.equal(area.score, area.id === "security" ? 100 : 0);
  }
});

test("unanswered questions are ignored, not counted as zero", () => {
  const answers = all(null);
  answers[0] = 3;
  assert.equal(scoreAnswers(areas, questions, answers).overall, 100);
  assert.equal(scoreAnswers(areas, questions, all(null)).overall, 0);
});

test("rating bands", () => {
  assert.equal(ratingFor(0).key, "high-risk");
  assert.equal(ratingFor(29).key, "high-risk");
  assert.equal(ratingFor(30).key, "needs-attention");
  assert.equal(ratingFor(54).key, "needs-attention");
  assert.equal(ratingFor(55).key, "solid");
  assert.equal(ratingFor(79).key, "solid");
  assert.equal(ratingFor(80).key, "strong");
  assert.equal(ratingFor(100).key, "strong");
});

test("severity bands", () => {
  assert.equal(severityFor(9).key, "high");
  assert.equal(severityFor(6).key, "high");
  assert.equal(severityFor(5).key, "medium");
  assert.equal(severityFor(3).key, "medium");
  assert.equal(severityFor(2).key, "low");
});

test("top risks are ranked by weighted gap with stable tie-breaks", () => {
  const fixture = [
    { id: "w1-gap3", weight: 1 }, // priority 3
    { id: "w3-gap1", weight: 3 }, // priority 3, heavier: first
    { id: "w2-gap3", weight: 2 }, // priority 6
    { id: "w3-best", weight: 3 }, // no gap: excluded
    { id: "w3-gap3", weight: 3 }, // priority 9
    { id: "w3-gap1-later", weight: 3 }, // priority 3, same as earlier: after it
  ];
  const answers = [0, 2, 0, 3, 0, 2];
  const ids = topRisks(fixture, answers, 10).map((r) => r.question.id);
  assert.deepEqual(ids, ["w3-gap3", "w2-gap3", "w3-gap1", "w3-gap1-later", "w1-gap3"]);
  assert.equal(topRisks(fixture, answers, 3).length, 3);
});

test("no risks when every answer is the best one", () => {
  assert.deepEqual(topRisks(questions, all(3)), []);
});

test("answers round-trip through the encoded form", () => {
  const answers = questions.map((_, i) => (i % 5 === 4 ? null : i % 4));
  const code = encodeAnswers(answers);
  assert.equal(code.length, questions.length);
  assert.deepEqual(decodeAnswers(code, questions.length), answers);
});

test("decoding rejects malformed input", () => {
  assert.equal(decodeAnswers(null, 20), null);
  assert.equal(decodeAnswers("0123", 20), null);
  assert.equal(decodeAnswers("4".repeat(20), 20), null);
  assert.equal(decodeAnswers("x".repeat(20), 20), null);
});

test("result hash only restores complete, current-version answers", () => {
  const answers = questions.map((_, i) => i % 4);
  const hash = toResultHash(answers);
  assert.deepEqual(fromResultHash(hash, questions.length), answers);

  assert.equal(fromResultHash("", questions.length), null);
  assert.equal(fromResultHash("#r=99." + "0".repeat(20), questions.length), null, "other version");
  assert.equal(fromResultHash("#r=1." + "-".repeat(20), questions.length), null, "incomplete");
  assert.equal(isComplete(answers), true);
});

test("email summary and mailto link", () => {
  const summary = buildSummary({
    overall: 42,
    rating: { label: "Needs attention" },
    areaResults: [{ name: "Delivery & Releases", score: 40 }],
    risks: [{ title: "No tested way to undo a bad release", areaName: "Delivery & Releases" }],
    link: "https://example.test/#r=1.0",
  });
  assert.match(summary, /42\/100 \(Needs attention\)/);
  assert.match(summary, /1\. No tested way to undo a bad release \(Delivery & Releases\)/);
  assert.match(summary, /https:\/\/example\.test\/#r=1\.0$/);

  const href = buildMailto({ to: "me@example.test", overall: 42, summary });
  assert.ok(href.startsWith("mailto:me@example.test?subject="));
  const body = new URLSearchParams(href.split("?")[1]).get("body");
  assert.ok(body.includes(summary));
});
