import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Card, CardContent, Progress, ProgressRing, buttonVariants } from "@kjaniec-dev/ui";
import { config } from "../lib/config";
import type { Locale } from "../i18n";
import {
  ratingFor,
  scoreAnswers,
  toResultHash,
  topRisks,
  type Answers,
  type SeverityKey,
} from "../lib/scoring";
import { buildMailto, buildSummary } from "../lib/summary";
import { Radar } from "./Radar";

const RATING_TONE = {
  "high-risk": { ring: "danger", text: "text-danger", bar: "bg-danger" },
  "needs-attention": { ring: "warning", text: "text-warning", bar: "bg-warning" },
  solid: { ring: "secondary", text: "text-secondary", bar: "bg-secondary" },
  strong: { ring: "success", text: "text-success", bar: "bg-success" },
} as const;

const SEVERITY_BADGE: Record<SeverityKey, "danger" | "warning" | "success"> = {
  high: "danger",
  medium: "warning",
  low: "success",
};

interface Props {
  locale: Locale;
  answers: Answers;
  onRetake: () => void;
}

export function Results({ locale, answers, onRetake }: Props) {
  const { areas, questions, m } = locale;
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
      areaResults,
      ratingLabel: m.ratings[rating.key].label,
      email: m.email,
      risks: risks.map((r) => ({
        title: r.question.risk,
        areaName: areas.find((a) => a.id === r.question.area)!.name,
      })),
      link,
    });
    const bookingHref =
      config.bookingUrl || buildMailto({ to: config.contactEmail, overall: scores.overall, summary, email: m.email });
    return { scores, rating, risks, areaResults, bookingHref };
  }, [answers, link, areas, questions, m]);

  const tone = RATING_TONE[rating.key];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopyStatus(m.results.copied);
    } catch {
      setCopyStatus(m.results.copyFailed);
    }
  };

  const radarDescription = m.results.radar(areaResults.map((a) => ({ name: a.short, score: a.score })));

  return (
    <section aria-labelledby="results-title" className="space-y-8">
      <h2 id="results-title" tabIndex={-1} ref={heading} className="text-2xl font-bold outline-none">
        {m.results.title}
      </h2>

      <Card className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center">
        <ProgressRing value={scores.overall} size="xl" tone={tone.ring}>
          <span className={`text-3xl font-extrabold ${tone.text}`} aria-label={m.results.scoreLabel(scores.overall)}>
            {scores.overall}
          </span>
        </ProgressRing>
        <div>
          <p className={`text-xl font-bold ${tone.text}`}>{m.ratings[rating.key].label}</p>
          <p className="text-muted-foreground">{m.ratings[rating.key].text}</p>
        </div>
      </Card>

      <div>
        <h3 className="mb-3 text-xl font-bold">{m.results.byArea}</h3>
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
        <h3 className="mb-3 text-xl font-bold">{m.results.risks(risks.length)}</h3>
        {risks.length === 0 ? (
          <p>{m.results.noGaps}</p>
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
                        {m.severities[severity.key]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{areas.find((a) => a.id === question.area)!.name}</p>
                    <p className="rounded-lg bg-muted px-3 py-2 text-sm">
                      <strong>{m.results.yourAnswer}</strong>
                      {question.options[score]}
                    </p>
                    <p>
                      <strong>{m.results.whyItMatters}</strong>
                      {question.impact}
                    </p>
                    <p>
                      <strong>{m.results.whatToDo}</strong>
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
          {m.results.ctaTitle}
        </h3>
        <p>{m.results.ctaText}</p>
        <a className={buttonVariants({ size: "lg" })} href={bookingHref}>
          {m.results.ctaButton}
        </a>
        <p className="text-sm text-muted-foreground">
          {config.bookingUrl ? m.results.ctaBookingHint : m.results.ctaMailHint}
        </p>
      </Card>

      <div className="no-print flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={copyLink}>
          {m.results.copyLink}
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          {m.results.print}
        </Button>
        <Button variant="ghost" onClick={onRetake}>
          {m.results.retake}
        </Button>
        <span className="text-sm text-muted-foreground" role="status">
          {copyStatus}
        </span>
      </div>

      <p className="text-sm text-muted-foreground">{m.results.disclaimer}</p>
    </section>
  );
}
