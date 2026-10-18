// Plain-text summary of a result, used for the "Book an architecture review" email.

export function buildSummary({ overall, rating, areaResults, risks, link }) {
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

export function buildMailto({ to, overall, summary }) {
  const subject = `Architecture review request (scorecard ${overall}/100)`;
  const body = [
    "Hi,",
    "",
    "I would like to book an architecture review. Here are my scorecard results:",
    "",
    summary,
    "",
    "A few words about our system and team:",
    "",
  ].join("\n");
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
