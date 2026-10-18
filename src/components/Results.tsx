import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Card, CardContent, Progress, ProgressRing, buttonVariants } from "@kjaniec-dev/ui";
import { config } from "../lib/config";
import { areas, questions } from "../lib/questions";
import {
  ratingFor,
  scoreAnswers,
  toResultHash,
  topRisks,
  type Answers,
  type Rating,
  type Severity,
} from "../lib/scoring";
import { buildMailto, buildSummary } from "../lib/summary";
import { Radar } from "./Radar";

const RATING_TEXT: Record<Rating["key"], string> = {
  "high-risk":
    "Several fundamentals are missing. Start with the risks below: they are the most likely to cause an outage or data loss.",
  "needs-attention": "The basics are partly in place, but there are gaps that could hurt you under pressure.",
  solid: "You have a good foundation. Targeted improvements will move you from solid to resilient.",
  strong: "Excellent practices across the board. The job now is keeping them current and tested.",
};

const RATING_TONE = {
  "high-risk": { ring: "danger", text: "text-danger", bar: "bg-danger" },
  "needs-attention": { ring: "warning", text: "text-warning", bar: "bg-warning" },
  solid: { ring: "secondary", text: "text-secondary", bar: "bg-secondary" },
  strong: { ring: "success", text: "text-success", bar: "bg-success" },
} as const;

const SEVERITY_BADGE: Record<Severity["key"], "danger" | "warning" | "success"> = {
  high: "danger",
  medium: "warning",
  low: "success",
};

interface Props {
  answers: Answers;
  onRetake: () => void;
}

export function Results({ answers, onRetake }: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, []);

  const link = `${location.origin}${location.pathname}${toResultHash(answers)}`;

  const { scores, rating, risks, areaResults, bookingHref } = useMemo(() => {
    const scores = scoreAnswers(areas, questions, answers);
    const rating = ratingFor(scores.overall);
    const risks = topRisks(questions, answers, 3);
    const areaResults = areas.map((area) => ({ ...area, score: scores.areas[area.id] ?? 0 }));
    const summary = buildSummary({
      overall: scores.overall,
      rating,
      areaResults,
      risks: risks.map((r) => ({
        title: r.question.risk,
        areaName: areas.find((a) => a.id === r.question.area)!.name,
      })),
      link,
    });
    const bookingHref =
      config.bookingUrl || buildMailto({ to: config.contactEmail, overall: scores.overall, summary });
    return { scores, rating, risks, areaResults, bookingHref };
  }, [answers, link]);

  const tone = RATING_TONE[rating.key];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopyStatus("Link copied.");
    } catch {
      setCopyStatus("Could not copy. Copy the address from the browser bar instead.");
    }
  };

  const radarDescription = `Radar chart of scores per area: ${areaResults
    .map((a) => `${a.short} ${a.score}`)
    .join(", ")}.`;

  return (
    <section aria-labelledby="results-title" className="space-y-8">
      <h2 id="results-title" tabIndex={-1} ref={heading} className="text-2xl font-bold outline-none">
        Your results
      </h2>

      <Card className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center">
        <ProgressRing value={scores.overall} size="xl" tone={tone.ring}>
          <span className={`text-3xl font-extrabold ${tone.text}`} aria-label={`Score ${scores.overall} out of 100`}>
            {scores.overall}
          </span>
        </ProgressRing>
        <div>
          <p className={`text-xl font-bold ${tone.text}`}>{rating.label}</p>
          <p className="text-muted-foreground">{RATING_TEXT[rating.key]}</p>
        </div>
      </Card>

      <div>
        <h3 className="mb-3 text-xl font-bold">Score by area</h3>
        <div className="grid items-center gap-6 md:grid-cols-2">
          <Radar items={areaResults.map((a) => ({ label: a.short, score: a.score }))} description={radarDescription} />
          <ul className="grid gap-4">
            {areaResults.map((a) => (
              <li key={a.id}>
                <div className="mb-1 flex justify-between gap-4 text-sm">
                  <span>{a.name}</span>
                  <strong>{a.score}</strong>
                </div>
                <Progress value={a.score} aria-label={a.name} barClassName={RATING_TONE[ratingFor(a.score).key].bar} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xl font-bold">{risks.length === 3 ? "Your 3 biggest risks" : "Your biggest risks"}</h3>
        {risks.length === 0 ? (
          <p>No gaps found: every answer was the strongest option. Nicely done.</p>
        ) : (
          <ol className="grid gap-4">
            {risks.map(({ question, score, severity }, i) => (
              <li key={question.id}>
                <Card>
                  <CardContent className="space-y-2 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="font-bold">
                        <span className="text-muted-foreground">{i + 1}.</span> {question.risk}
                      </h4>
                      <Badge variant={SEVERITY_BADGE[severity.key]} className="shrink-0">
                        {severity.label} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{areas.find((a) => a.id === question.area)!.name}</p>
                    <p className="rounded-lg bg-muted px-3 py-2 text-sm">
                      <strong>Your answer: </strong>
                      {question.options[score]}
                    </p>
                    <p>
                      <strong>Why it matters: </strong>
                      {question.impact}
                    </p>
                    <p>
                      <strong>What to do: </strong>
                      {question.fix}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        )}
      </div>

      <Card className="no-print space-y-3 border-primary p-6" aria-labelledby="cta-title">
        <h3 id="cta-title" className="text-xl font-bold">
          Want a second pair of eyes?
        </h3>
        <p>
          A scorecard only sees what you tell it. In an architecture review we go through these results against your
          real system and turn them into a prioritised plan.
        </p>
        <a className={buttonVariants({ size: "lg" })} href={bookingHref}>
          Book an architecture review
        </a>
        <p className="text-sm text-muted-foreground">
          {config.bookingUrl
            ? "Opens the booking page."
            : "Opens your email app with your results filled in. Nothing is sent until you press send."}
        </p>
      </Card>

      <div className="no-print flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={copyLink}>
          Copy link to these results
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          Print or save as PDF
        </Button>
        <Button variant="ghost" onClick={onRetake}>
          Retake the check
        </Button>
        <span className="text-sm text-muted-foreground" role="status">
          {copyStatus}
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        Indicative, rule-based self-assessment built from your answers. It is not an audit and does not inspect your
        systems.
      </p>
    </section>
  );
}
