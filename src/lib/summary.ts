// Plain-text summary of a result, used for the "Book an architecture review" email.

export interface SummaryInput {
  overall: number;
  rating: { label: string };
  areaResults: { name: string; score: number }[];
  risks: { title: string; areaName: string }[];
  link: string;
}

export function buildSummary({ overall, rating, areaResults, risks, link }: SummaryInput): string {
  const lines = [
    `Architecture & Delivery Scorecard: ${overall}/100 (${rating.label})`,
    "",
    ...areaResults.map((a) => `- ${a.name}: ${a.score}/100`),
  ];
  if (risks.length > 0) {
    lines.push("", "Biggest risks:");
    risks.forEach((r, i) => lines.push(`${i + 1}. ${r.title} (${r.areaName})`));
  }
  lines.push("", `Full results: ${link}`);
  return lines.join("\n");
}

export function buildMailto(args: { to: string; overall: number; summary: string }): string {
  const subject = `Architecture review request (scorecard ${args.overall}/100)`;
  const body = [
    "Hi,",
    "",
    "I would like to book an architecture review. Here are my scorecard results:",
    "",
    args.summary,
    "",
    "A few words about our system and team:",
    "",
  ].join("\n");
  return `mailto:${args.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
