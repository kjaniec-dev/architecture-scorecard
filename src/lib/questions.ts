// Language-neutral structure of the assessment: which questions exist, which area each belongs
// to and how much it weighs. All wording (questions, options, advice) lives in src/i18n/*.ts.
//
// Every question has four options; the index of the option is its score (0-3).
// `weight` (1-3) says how much the question matters for the area and overall score.
//
// Changing the order or number of questions invalidates previously shared result links,
// so bump ANSWER_FORMAT_VERSION in scoring.ts if you do.

export const AREA_IDS = ["delivery", "operations", "resilience", "security", "architecture"] as const;
export type AreaId = (typeof AREA_IDS)[number];

export const QUESTION_DEFS = [
  { id: "deploy-method", area: "delivery", weight: 3 },
  { id: "release-frequency", area: "delivery", weight: 2 },
  { id: "rollback", area: "delivery", weight: 3 },
  { id: "release-tests", area: "delivery", weight: 2 },
  { id: "monitoring", area: "operations", weight: 3 },
  { id: "logging", area: "operations", weight: 2 },
  { id: "incidents", area: "operations", weight: 3 },
  { id: "capacity", area: "operations", weight: 2 },
  { id: "backups", area: "resilience", weight: 3 },
  { id: "restore", area: "resilience", weight: 3 },
  { id: "single-points", area: "resilience", weight: 2 },
  { id: "rebuild", area: "resilience", weight: 2 },
  { id: "prod-access", area: "security", weight: 3 },
  { id: "secrets", area: "security", weight: 3 },
  { id: "patching", area: "security", weight: 2 },
  { id: "audit-trail", area: "security", weight: 2 },
  { id: "documentation", area: "architecture", weight: 2 },
  { id: "key-person", area: "architecture", weight: 3 },
  { id: "tech-debt", area: "architecture", weight: 2 },
  { id: "change-risk", area: "architecture", weight: 3 },
] as const satisfies readonly { id: string; area: AreaId; weight: 1 | 2 | 3 }[];

export type QuestionId = (typeof QUESTION_DEFS)[number]["id"];

export interface Area {
  id: AreaId;
  name: string;
  short: string;
  blurb: string;
}

/** The wording of one question: shown while answering and, if it ranks, in the results. */
export interface QuestionText {
  text: string;
  /** Four options; the index of an option is its score (0-3). */
  options: readonly [string, string, string, string];
  risk: string;
  impact: string;
  fix: string;
}

export interface Question extends QuestionText {
  id: QuestionId;
  area: AreaId;
  weight: 1 | 2 | 3;
}
