// Pure, rule-based scoring. No DOM, no I/O, no randomness: the same answers always
// produce the same result.

export const MAX_OPTION_SCORE = 3;

// Bump when questions are added, removed or reordered: shared links are positional.
export const ANSWER_FORMAT_VERSION = 1;

const RATINGS = [
  { key: "high-risk", label: "High risk", below: 30 },
  { key: "needs-attention", label: "Needs attention", below: 55 },
  { key: "solid", label: "Solid", below: 80 },
  { key: "strong", label: "Strong", below: Infinity },
];

const SEVERITIES = [
  { key: "high", label: "High", atLeast: 6 },
  { key: "medium", label: "Medium", atLeast: 3 },
  { key: "low", label: "Low", atLeast: 0 },
];

// Answers are an array (one entry per question, in order) of 0-3 or null if unanswered.
// They are serialised as one character per question: "0"-"3", or "-" for unanswered.
export function encodeAnswers(answers) {
  return answers.map((a) => (a === null ? "-" : String(a))).join("");
}

export function decodeAnswers(code, count) {
  if (typeof code !== "string" || code.length !== count) return null;
  if (!/^[0-3-]+$/.test(code)) return null;
  return [...code].map((c) => (c === "-" ? null : Number(c)));
}

// Shareable result links carry the answers in the URL hash: "#r=<version>.<code>".
// The hash never leaves the browser, so sharing a link is the only way results travel.
export function toResultHash(answers) {
  return `#r=${ANSWER_FORMAT_VERSION}.${encodeAnswers(answers)}`;
}

export function fromResultHash(hash, count) {
  const match = /^#r=(\d+)\.(.+)$/.exec(hash);
  if (!match || Number(match[1]) !== ANSWER_FORMAT_VERSION) return null;
  const answers = decodeAnswers(match[2], count);
  return answers && isComplete(answers) ? answers : null;
}

export function countAnswered(answers) {
  return answers.filter((a) => a !== null).length;
}

export function isComplete(answers) {
  return answers.length > 0 && countAnswered(answers) === answers.length;
}

function weightedPercent(items) {
  const answered = items.filter((item) => item.score !== null);
  const max = answered.reduce((sum, i) => sum + i.weight * MAX_OPTION_SCORE, 0);
  if (max === 0) return 0;
  const got = answered.reduce((sum, i) => sum + i.weight * i.score, 0);
  return Math.round((got / max) * 100);
}

export function ratingFor(score) {
  return RATINGS.find((r) => score < r.below);
}

export function severityFor(priority) {
  return SEVERITIES.find((s) => priority >= s.atLeast);
}

export function scoreAnswers(areas, questions, answers) {
  const items = questions.map((q, i) => ({
    area: q.area,
    weight: q.weight,
    score: answers[i] ?? null,
  }));
  return {
    overall: weightedPercent(items),
    areas: areas.map((area) => ({
      id: area.id,
      score: weightedPercent(items.filter((i) => i.area === area.id)),
    })),
  };
}

// Priority = weight x gap to the best answer. Ties go to the heavier question, then to
// the one asked first, so the ranking is stable.
export function topRisks(questions, answers, limit = 3) {
  return questions
    .map((question, index) => {
      const score = answers[index] ?? null;
      const priority = score === null ? 0 : question.weight * (MAX_OPTION_SCORE - score);
      return { question, index, score, priority, severity: severityFor(priority) };
    })
    .filter((risk) => risk.priority > 0)
    .sort(
      (a, b) =>
        b.priority - a.priority ||
        b.question.weight - a.question.weight ||
        a.index - b.index,
    )
    .slice(0, limit);
}
