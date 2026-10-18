// Plain-text summary of a result, used for the "Book an architecture review" email.

import type { Messages } from "../i18n/types";

export interface SummaryInput {
  overall: number;
  ratingLabel: string;
  areaResults: { name: string; score: number }[];
  risks: { title: string; areaName: string }[];
  link: string;
  email: Messages["email"];
}

export function buildSummary({ overall, ratingLabel, areaResults, risks, link, email }: SummaryInput): string {
  const lines = [email.heading(overall, ratingLabel), "", ...areaResults.map((a) => `- ${a.name}: ${a.score}/100`)];
  if (risks.length > 0) {
    lines.push("", email.risks);
    risks.forEach((r, i) => lines.push(`${i + 1}. ${r.title} (${r.areaName})`));
  }
  lines.push("", `${email.fullResults} ${link}`);
  return lines.join("\n");
}

export function buildMailto(args: { to: string; overall: number; summary: string; email: Messages["email"] }): string {
  const { email } = args;
  const body = [email.greeting, "", email.intro, "", args.summary, "", email.about, ""].join("\n");
  return `mailto:${args.to}?subject=${encodeURIComponent(email.subject(args.overall))}&body=${encodeURIComponent(body)}`;
}
