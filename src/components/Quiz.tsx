import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Progress, Radio } from "@kjaniec-dev/ui";
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
    <section aria-labelledby="quiz-title" className="space-y-5">
      <div className="space-y-1.5">
        <Progress value={(answered / questions.length) * 100} aria-label="Progress" />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Step {step + 1} of {areas.length} · {answered} of {questions.length} answered
        </p>
      </div>

      <div>
        <h2 id="quiz-title" tabIndex={-1} ref={heading} className="text-2xl font-bold outline-none">
          {area.name}
        </h2>
        <p className="text-muted-foreground">{area.blurb}</p>
      </div>

      {items.map(({ question, index }) => (
        <Card key={question.id} as="fieldset" className="p-5">
          <legend className="px-1 font-bold">
            <span className="text-muted-foreground">{index + 1}.</span> {question.text}
          </legend>
          <div className="mt-2 grid gap-2">
            {question.options.map((option, score) => (
              <Radio
                key={option}
                name={`q-${question.id}`}
                label={option}
                checked={answers[index] === score}
                onChange={() => {
                  setMessage("");
                  onChoose(index, score);
                }}
                className="w-full items-start rounded-lg border border-border px-3 py-2.5 hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-muted"
              />
            ))}
          </div>
        </Card>
      ))}

      {message && (
        <Alert variant="danger" role="alert">
          {message}
        </Alert>
      )}

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={next}>{isLast ? "See my results" : "Next"}</Button>
      </div>
    </section>
  );
}
