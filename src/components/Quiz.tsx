import { useEffect, useRef, useState } from "react";
import { areas, questions } from "../lib/questions";
import { countAnswered, type Answers } from "../lib/scoring";

interface Props {
  answers: Answers;
  step: number;
  onChoose: (index: number, score: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export function Quiz({ answers, step, onChoose, onBack, onNext }: Props) {
  const area = areas[step]!;
  const isLast = step === areas.length - 1;
  const answered = countAnswered(answers);
  const [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setMessage("");
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, [step]);

  const items = questions
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => question.area === area.id);

  const next = () => {
    const open = items.find(({ index }) => answers[index] === null);
    if (!open) return onNext();
    setMessage("Please answer every question in this section to continue.");
    document.querySelector<HTMLInputElement>(`input[name="q-${open.question.id}"]`)?.focus();
  };

  return (
    <section aria-labelledby="quiz-title">
      <div className="progress">
        <progress max={questions.length} value={answered} aria-label="Progress" />
        <span className="progress-text" aria-live="polite">
          Step {step + 1} of {areas.length} · {answered} of {questions.length} answered
        </span>
      </div>
      <h2 id="quiz-title" tabIndex={-1} ref={heading}>
        {area.name}
      </h2>
      <p className="muted">{area.blurb}</p>

      {items.map(({ question, index }) => (
        <fieldset key={question.id} className="question">
          <legend>
            <span className="q-number">{index + 1}.</span> {question.text}
          </legend>
          {question.options.map((option, score) => (
            <label key={option} className="option">
              <input
                type="radio"
                name={`q-${question.id}`}
                checked={answers[index] === score}
                onChange={() => {
                  setMessage("");
                  onChoose(index, score);
                }}
              />
              <span>{option}</span>
            </label>
          ))}
        </fieldset>
      ))}

      <p className="form-message" role="alert">
        {message}
      </p>
      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn btn-primary" onClick={next}>
          {isLast ? "See my results" : "Next"}
        </button>
      </div>
    </section>
  );
}
