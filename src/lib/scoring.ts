// Pure, rule-based scoring. No DOM, no I/O, no randomness: the same answers always
// produce the same result.

import type { Area, Question } from "./questions";

export const MAX_OPTION_SCORE = 3;

// Bump when questions are added, removed or reordered: shared links are positional.
export const ANSWER_FORMAT_VERSION = 1;

/** One entry per question, in order: the chosen option's score (0-3), or null if unanswered. */
export type Answers = (number | null)[];

export type RatingKey = "high-risk" | "needs-attention" | "solid" | "strong";
export type SeverityKey = "high" | "medium" | "low";

// Wording for both lives in src/i18n; the scoring only decides which band applies.
export interface Rating {
  key: RatingKey;
  below: number;
}

export interface Severity {
  key: SeverityKey;
  atLeast: number;
}

export interface Risk {
  question: Question;
  index: number;
  score: number;
  priority: number;
  severity: Severity;
}

const RATINGS: readonly Rating[] = [
  { key: "high-risk", below: 30 },
  { key: "needs-attention", below: 55 },
  { key: "solid", below: 80 },
  { key: "strong", below: Infinity },
];

const SEVERITIES: readonly Severity[] = [
  { key: "high", atLeast: 6 },
  { key: "medium", atLeast: 3 },
  { key: "low", atLeast: 0 },
];

export const emptyAnswers = (count: number): Answers => new Array<number | null>(count).fill(null);

// Answers are serialised as one character per question: "0"-"3", or "-" for unanswered.
export function encodeAnswers(answers: Answers): string {
  return answers.map((a) => (a === null ? "-" : String(a))).join("");
}

export function decodeAnswers(code: string | null, count: number): Answers | null {
  if (code === null || code.length !== count || !/^[0-3-]+$/.test(code)) return null;
  return [...code].map((c) => (c === "-" ? null : Number(c)));
}

// Shareable result links carry the answers in the URL hash: "#r=<version>.<code>".
// The hash never leaves the browser, so sharing a link is the only way results travel.
export function toResultHash(answers: Answers): string {
  return `#r=${ANSWER_FORMAT_VERSION}.${encodeAnswers(answers)}`;
}

export function fromResultHash(hash: string, count: number): Answers | null {
  const match = /^#r=(\d+)\.(.+)$/.exec(hash);
  if (!match || Number(match[1]) !== ANSWER_FORMAT_VERSION) return null;
  const answers = decodeAnswers(match[2] ?? null, count);
  return answers && isComplete(answers) ? answers : null;
}

export function countAnswered(answers: Answers): number {
  return answers.filter((a) => a !== null).length;
}

export function isComplete(answers: Answers): boolean {
  return answers.length > 0 && countAnswered(answers) === answers.length;
}

interface Item {
  weight: number;
  score: number | null;
}

function weightedPercent(items: Item[]): number {
  const answered = items.filter((item) => item.score !== null);
  const max = answered.reduce((sum, i) => sum + i.weight * MAX_OPTION_SCORE, 0);
  if (max === 0) return 0;
  const got = answered.reduce((sum, i) => sum + i.weight * (i.score ?? 0), 0);
  return Math.round((got / max) * 100);
}

export function ratingFor(score: number): Rating {
  return RATINGS.find((r) => score < r.below) ?? RATINGS[RATINGS.length - 1]!;
}

export function severityFor(priority: number): Severity {
  return SEVERITIES.find((s) => priority >= s.atLeast) ?? SEVERITIES[SEVERITIES.length - 1]!;
}

export interface Scores {
  overall: number;
  areas: Record<string, number>;
}

type Scorable = Pick<Question, "weight"> & { area: string };

export function scoreAnswers(
  areas: readonly Pick<Area, "id">[],
  questions: readonly Scorable[],
  answers: Answers,
): Scores {
  const items = questions.map((q, i) => ({
    area: q.area,
    weight: q.weight,
    score: answers[i] ?? null,
  }));
  return {
    overall: weightedPercent(items),
    areas: Object.fromEntries(
      areas.map((area) => [area.id, weightedPercent(items.filter((i) => i.area === area.id))]),
    ),
  };
}

// Priority = weight x gap to the best answer. Ties go to the heavier question, then to
// the one asked first, so the ranking is stable.
export function topRisks(questions: readonly Question[], answers: Answers, limit = 3): Risk[] {
  const risks: Risk[] = [];
  questions.forEach((question, index) => {
    const score = answers[index] ?? null;
    if (score === null) return;
    const priority = question.weight * (MAX_OPTION_SCORE - score);
    if (priority > 0) risks.push({ question, index, score, priority, severity: severityFor(priority) });
  });
  return risks
    .sort(
      (a, b) =>
        b.priority - a.priority ||
        b.question.weight - a.question.weight ||
        a.index - b.index,
    )
    .slice(0, limit);
}
