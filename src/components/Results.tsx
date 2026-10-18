import { useEffect, useMemo, useRef, useState } from "react";
import { config } from "../lib/config";
import { areas, questions } from "../lib/questions";
import { ratingFor, scoreAnswers, toResultHash, topRisks, type Answers } from "../lib/scoring";
import { buildMailto, buildSummary } from "../lib/summary";
import { Radar } from "./Radar";

const RATING_TEXT = {
  "high-risk":
    "Several fundamentals are missing. Start with the risks below: they are the most likely to cause an outage or data loss.",
  "needs-attention": "The basics are partly in place, but there are gaps that could hurt you under pressure.",
  solid: "You have a good foundation. Targeted improvements will move you from solid to resilient.",
  strong: "Excellent practices across the board. The job now is keeping them current and tested.",
} as const;

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

  const hash = toResultHash(answers);
  const link = `${location.origin}${location.pathname}${hash}`;

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
    <section aria-labelledby="results-title">
      <h2 id="results-title" tabIndex={-1} ref={heading}>
        Your results
      </h2>

      <div className={`score-card rating-${rating.key}`}>
        <div className="score-number" aria-label={`Overall score ${scores.overall} out of 100`}>
          <span>{scores.overall}</span>
          <small>/100</small>
        </div>
        <div>
          <p className="rating-label">{rating.label}</p>
          <p className="muted">{RATING_TEXT[rating.key]}</p>
        </div>
      </div>

      <h3>Score by area</h3>
      <div className="areas-grid">
        <figure className="radar-figure">
          <Radar items={areaResults.map((a) => ({ label: a.short, score: a.score }))} description={radarDescription} />
        </figure>
        <ul className="bars">
          {areaResults.map((a) => (
            <li key={a.id}>
              <div className="bar-head">
                <span>{a.name}</span>
                <strong>{a.score}</strong>
              </div>
              <svg className="bar" viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden="true">
                <rect className={`fill rating-${ratingFor(a.score).key}`} width={a.score} height="4" />
              </svg>
            </li>
          ))}
        </ul>
      </div>

      <h3>{risks.length === 3 ? "Your 3 biggest risks" : "Your biggest risks"}</h3>
      {risks.length === 0 ? (
        <p>No gaps found: every answer was the strongest option. Nicely done.</p>
      ) : (
        <ol className="risk-list">
          {risks.map(({ question, score, severity }) => (
            <li key={question.id} className={`risk severity-${severity.key}`}>
              <div className="risk-head">
                <h4>{question.risk}</h4>
                <span className="severity">{severity.label} priority</span>
              </div>
              <p className="muted risk-area">{areas.find((a) => a.id === question.area)!.name}</p>
              <p className="risk-answer">
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
            </li>
          ))}
        </ol>
      )}

      <section className="cta" aria-labelledby="cta-title">
        <h3 id="cta-title">Want a second pair of eyes?</h3>
        <p>
          A scorecard only sees what you tell it. In an architecture review we go through these results against your
          real system and turn them into a prioritised plan.
        </p>
        <a className="btn btn-primary" href={bookingHref}>
          Book an architecture review
        </a>
        <p className="muted small">
          {config.bookingUrl
            ? "Opens the booking page."
            : "Opens your email app with your results filled in. Nothing is sent until you press send."}
        </p>
      </section>

      <div className="actions result-actions">
        <button type="button" className="btn btn-secondary" onClick={copyLink}>
          Copy link to these results
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
          Print or save as PDF
        </button>
        <button type="button" className="btn btn-link" onClick={onRetake}>
          Retake the check
        </button>
        <span className="copy-status" role="status">
          {copyStatus}
        </span>
      </div>

      <p className="muted small disclaimer">
        Indicative, rule-based self-assessment built from your answers. It is not an audit and does not inspect your
        systems.
      </p>
    </section>
  );
}
