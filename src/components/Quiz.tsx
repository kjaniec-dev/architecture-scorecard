import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Progress, Radio } from "@kjaniec-dev/ui";
import type { Locale } from "../i18n";
import { countAnswered, type Answers } from "../lib/scoring";

interface Props {
  locale: Locale;
  answers: Answers;
  step: number;
  onChoose: (index: number, score: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export function Quiz({ locale, answers, step, onChoose, onBack, onNext }: Props) {
  const { areas, questions, m } = locale;
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
    setMessage(m.quiz.incomplete);
    document.querySelector<HTMLInputElement>(`input[name="q-${open.question.id}"]`)?.focus();
  };

  return (
    <section aria-labelledby="quiz-title" className="space-y-5">
      <div className="space-y-1.5">
        <Progress value={(answered / questions.length) * 100} aria-label={m.quiz.progress} />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {m.quiz.step(step + 1, areas.length, answered, questions.length)}
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
          {m.quiz.back}
        </Button>
        <Button onClick={next}>{isLast ? m.quiz.seeResults : m.quiz.next}</Button>
      </div>
    </section>
  );
}
