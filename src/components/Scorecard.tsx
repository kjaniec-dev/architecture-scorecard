import { useEffect, useState } from "react";
import { Button } from "@kjaniec-dev/ui";
import { getLocale, type Lang } from "../i18n";
import {
  countAnswered,
  decodeAnswers,
  emptyAnswers,
  encodeAnswers,
  fromResultHash,
  isComplete,
  toResultHash,
  type Answers,
} from "../lib/scoring";
import { Quiz } from "./Quiz";
import { Results } from "./Results";

const STORAGE_KEY = "architecture-scorecard.answers";
type View = "intro" | "quiz" | "results";

// Storage can be unavailable (private mode, blocked site data): the app works without it.
function loadSaved(total: number): Answers {
  try {
    return decodeAnswers(localStorage.getItem(STORAGE_KEY), total) ?? emptyAnswers(total);
  } catch {
    return emptyAnswers(total);
  }
}

function persist(answers: Answers | null) {
  try {
    if (answers) localStorage.setItem(STORAGE_KEY, encodeAnswers(answers));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Not being able to persist progress is fine.
  }
}

function setHash(hash: string) {
  history.replaceState(null, "", location.pathname + location.search + hash);
}

export default function Scorecard({ lang }: { lang: Lang }) {
  const locale = getLocale(lang);
  const { areas, questions, m } = locale;
  const TOTAL = questions.length;
  const shared = fromResultHash(location.hash, TOTAL);
  const [answers, setAnswers] = useState<Answers>(() => shared ?? loadSaved(TOTAL));
  const [view, setView] = useState<View>(shared ? "results" : "intro");
  const [step, setStep] = useState(0);

  // Lets the page hide its static intro copy while the quiz or results are on screen.
  useEffect(() => {
    document.body.dataset.view = view;
  }, [view]);

  useEffect(() => {
    if (view === "results") setHash(toResultHash(answers));
  }, [view, answers]);

  useEffect(() => {
    const onHashChange = () => {
      const fromLink = fromResultHash(location.hash, TOTAL);
      if (fromLink) {
        setAnswers(fromLink);
        setView("results");
      } else {
        setView("intro");
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const startOver = () => {
    const fresh = emptyAnswers(TOTAL);
    persist(null);
    setHash("");
    setAnswers(fresh);
    setStep(0);
    return fresh;
  };

  const choose = (index: number, score: number) => {
    const next = answers.map((a, i) => (i === index ? score : a));
    persist(next);
    setAnswers(next);
  };

  if (view === "quiz") {
    return (
      <Quiz
        locale={locale}
        answers={answers}
        step={step}
        onChoose={choose}
        onBack={() => (step === 0 ? setView("intro") : setStep(step - 1))}
        onNext={() => (step === areas.length - 1 ? setView("results") : setStep(step + 1))}
      />
    );
  }

  if (view === "results") {
    return (
      <Results
        locale={locale}
        answers={answers}
        onRetake={() => {
          startOver();
          setView("quiz");
        }}
      />
    );
  }

  const answered = countAnswered(answers);
  const startLabel = isComplete(answers)
    ? m.intro.seeLast
    : answered > 0
      ? m.intro.resume(answered, TOTAL)
      : m.intro.start;

  const start = () => {
    if (isComplete(answers)) return setView("results");
    const firstOpen = areas.findIndex((area) =>
      questions.some((q, i) => q.area === area.id && answers[i] === null),
    );
    setStep(Math.max(firstOpen, 0));
    setView("quiz");
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="lg" onClick={start}>
        {startLabel}
      </Button>
      {answered > 0 && (
        <Button variant="ghost" onClick={startOver}>
          {m.intro.startOver}
        </Button>
      )}
    </div>
  );
}
