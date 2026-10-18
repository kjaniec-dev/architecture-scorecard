import { config } from "./config.js";
import { areas, questions } from "./questions.js";
import {
  MAX_OPTION_SCORE,
  countAnswered,
  decodeAnswers,
  encodeAnswers,
  fromResultHash,
  isComplete,
  ratingFor,
  scoreAnswers,
  toResultHash,
  topRisks,
} from "./scoring.js";
import { radarChart } from "./radar.js";
import { buildMailto, buildSummary } from "./summary.js";

const STORAGE_KEY = "architecture-scorecard.answers";
const TOTAL = questions.length;

const RATING_TEXT = {
  "high-risk":
    "Several fundamentals are missing. Start with the risks below: they are the most likely to cause an outage or data loss.",
  "needs-attention":
    "The basics are partly in place, but there are gaps that could hurt you under pressure.",
  solid:
    "You have a good foundation. Targeted improvements will move you from solid to resilient.",
  strong:
    "Excellent practices across the board. The job now is keeping them current and tested.",
};

const views = {
  intro: document.getElementById("intro"),
  quiz: document.getElementById("quiz"),
  results: document.getElementById("results"),
};
const startButton = document.getElementById("start");
const restartButton = document.getElementById("restart");

const state = {
  answers: loadSaved(),
  step: 0,
};

// ---------------------------------------------------------------- helpers

function h(tag, attrs, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs ?? {})) {
    if (value === false || value == null) continue;
    if (key === "class") node.className = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? "" : value);
  }
  node.append(...children.flat().filter((c) => c != null && c !== false));
  return node;
}

function loadSaved() {
  try {
    const saved = decodeAnswers(localStorage.getItem(STORAGE_KEY), TOTAL);
    if (saved) return saved;
  } catch {
    // Storage can be unavailable (private mode, blocked site data): carry on without it.
  }
  return new Array(TOTAL).fill(null);
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, encodeAnswers(state.answers));
  } catch {
    // Not being able to persist progress is fine.
  }
}

function clearSaved() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}

function show(name) {
  for (const [key, node] of Object.entries(views)) node.hidden = key !== name;
  window.scrollTo(0, 0);
  views[name].querySelector("h1, h2")?.focus({ preventScroll: true });
}

function setHash(hash) {
  history.replaceState(null, "", location.pathname + location.search + hash);
}

const areaOf = (id) => areas.find((a) => a.id === id);
const questionsOf = (areaId) =>
  questions.map((question, index) => ({ question, index })).filter((x) => x.question.area === areaId);

// ------------------------------------------------------------------ intro

function refreshIntro() {
  const answered = countAnswered(state.answers);
  if (isComplete(state.answers)) startButton.textContent = "See my last results";
  else if (answered > 0) startButton.textContent = `Resume (${answered} of ${TOTAL} answered)`;
  else startButton.textContent = "Start the check";
  restartButton.hidden = answered === 0;
}

function showIntro() {
  refreshIntro();
  show("intro");
}

function startOver() {
  state.answers = new Array(TOTAL).fill(null);
  state.step = 0;
  clearSaved();
  setHash("");
  renderQuiz();
}

startButton.addEventListener("click", () => {
  if (isComplete(state.answers)) {
    showResults();
    return;
  }
  const firstOpen = areas.findIndex((area) =>
    questionsOf(area.id).some(({ index }) => state.answers[index] === null),
  );
  state.step = Math.max(firstOpen, 0);
  renderQuiz();
});

restartButton.addEventListener("click", () => {
  clearSaved();
  state.answers = new Array(TOTAL).fill(null);
  setHash("");
  refreshIntro();
});

// ------------------------------------------------------------------- quiz

function renderQuiz() {
  const area = areas[state.step];
  const isLast = state.step === areas.length - 1;

  const progress = h("progress", { max: TOTAL, value: countAnswered(state.answers), "aria-label": "Progress" });
  const progressText = h("span", { class: "progress-text", "aria-live": "polite" });
  const message = h("p", { class: "form-message", role: "alert" });

  const updateProgress = () => {
    const answered = countAnswered(state.answers);
    progress.value = answered;
    progressText.textContent = `Step ${state.step + 1} of ${areas.length} · ${answered} of ${TOTAL} answered`;
  };

  const fieldsets = questionsOf(area.id).map(({ question, index }) =>
    h(
      "fieldset",
      { class: "question" },
      h("legend", null, h("span", { class: "q-number" }, `${index + 1}.`), ` ${question.text}`),
      ...question.options.map((option, score) =>
        h(
          "label",
          { class: "option" },
          h("input", {
            type: "radio",
            name: `q-${question.id}`,
            value: String(score),
            checked: state.answers[index] === score,
            onchange: () => {
              state.answers[index] = score;
              save();
              message.textContent = "";
              updateProgress();
            },
          }),
          h("span", null, option),
        ),
      ),
    ),
  );

  const next = () => {
    const openIndex = questionsOf(area.id).findIndex(({ index }) => state.answers[index] === null);
    if (openIndex !== -1) {
      message.textContent = "Please answer every question in this section to continue.";
      fieldsets[openIndex].querySelector("input").focus();
      return;
    }
    if (isLast) showResults();
    else {
      state.step += 1;
      renderQuiz();
    }
  };

  const back = () => {
    if (state.step === 0) showIntro();
    else {
      state.step -= 1;
      renderQuiz();
    }
  };

  views.quiz.replaceChildren(
    h("div", { class: "progress" }, progress, progressText),
    h("h2", { tabindex: "-1" }, area.name),
    h("p", { class: "muted" }, area.blurb),
    ...fieldsets,
    message,
    h(
      "div",
      { class: "actions" },
      h("button", { type: "button", class: "btn btn-secondary", onclick: back }, "Back"),
      h("button", { type: "button", class: "btn btn-primary", onclick: next }, isLast ? "See my results" : "Next"),
    ),
  );
  updateProgress();
  show("quiz");
}

// ---------------------------------------------------------------- results

function resultLink() {
  return `${location.origin}${location.pathname}${toResultHash(state.answers)}`;
}

function showResults() {
  const scores = scoreAnswers(areas, questions, state.answers);
  const rating = ratingFor(scores.overall);
  const risks = topRisks(questions, state.answers, 3);
  const areaResults = areas.map((area, i) => ({ ...area, score: scores.areas[i].score }));
  const link = resultLink();

  setHash(toResultHash(state.answers));

  const summary = buildSummary({
    overall: scores.overall,
    rating,
    areaResults,
    risks: risks.map((r) => ({ title: r.question.risk, areaName: areaOf(r.question.area).name })),
    link,
  });
  const bookingHref = config.bookingUrl
    ? config.bookingUrl
    : buildMailto({ to: config.contactEmail, overall: scores.overall, summary });

  const radarDescription = `Radar chart of scores per area: ${areaResults
    .map((a) => `${a.short} ${a.score}`)
    .join(", ")}.`;

  const copyStatus = h("span", { class: "copy-status", role: "status" });
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      copyStatus.textContent = "Link copied.";
    } catch {
      copyStatus.textContent = "Could not copy. Copy the address from the browser bar instead.";
    }
  };

  views.results.replaceChildren(
    h("h2", { tabindex: "-1" }, "Your results"),

    h(
      "div",
      { class: `score-card rating-${rating.key}` },
      h(
        "div",
        { class: "score-number", "aria-label": `Overall score ${scores.overall} out of 100` },
        h("span", null, String(scores.overall)),
        h("small", null, "/100"),
      ),
      h(
        "div",
        null,
        h("p", { class: "rating-label" }, rating.label),
        h("p", { class: "muted" }, RATING_TEXT[rating.key]),
      ),
    ),

    h(
      "section",
      { class: "areas", "aria-labelledby": "areas-title" },
      h("h3", { id: "areas-title" }, "Score by area"),
      h(
        "div",
        { class: "areas-grid" },
        h(
          "figure",
          { class: "radar-figure" },
          radarChart(
            areaResults.map((a) => ({ label: a.short, score: a.score })),
            radarDescription,
          ),
        ),
        h(
          "ul",
          { class: "bars" },
          ...areaResults.map((a) => {
            const fill = h("div", { class: `fill rating-${ratingFor(a.score).key}` });
            fill.style.width = `${a.score}%`;
            return h(
              "li",
              null,
              h("div", { class: "bar-head" }, h("span", null, a.name), h("strong", null, String(a.score))),
              h("div", { class: "bar" }, fill),
            );
          }),
        ),
      ),
    ),

    h(
      "section",
      { class: "risks", "aria-labelledby": "risks-title" },
      h("h3", { id: "risks-title" }, risks.length === 3 ? "Your 3 biggest risks" : "Your biggest risks"),
      risks.length === 0
        ? h("p", null, "No gaps found: every answer was the strongest option. Nicely done.")
        : h(
            "ol",
            { class: "risk-list" },
            ...risks.map(({ question, score, severity }) =>
              h(
                "li",
                { class: `risk severity-${severity.key}` },
                h(
                  "div",
                  { class: "risk-head" },
                  h("h4", null, question.risk),
                  h("span", { class: "severity" }, `${severity.label} priority`),
                ),
                h("p", { class: "muted risk-area" }, areaOf(question.area).name),
                h("p", { class: "risk-answer" }, h("strong", null, "Your answer: "), question.options[score]),
                h("p", null, h("strong", null, "Why it matters: "), question.impact),
                h("p", null, h("strong", null, "What to do: "), question.fix),
              ),
            ),
          ),
    ),

    h(
      "section",
      { class: "cta", "aria-labelledby": "cta-title" },
      h("h3", { id: "cta-title" }, "Want a second pair of eyes?"),
      h(
        "p",
        null,
        "A scorecard only sees what you tell it. In an architecture review we go through these results against your real system and turn them into a prioritised plan.",
      ),
      h("a", { class: "btn btn-primary", href: bookingHref }, "Book an architecture review"),
      h(
        "p",
        { class: "muted small" },
        config.bookingUrl
          ? "Opens the booking page."
          : "Opens your email app with your results filled in. Nothing is sent until you press send.",
      ),
    ),

    h(
      "div",
      { class: "actions result-actions" },
      h("button", { type: "button", class: "btn btn-secondary", onclick: copyLink }, "Copy link to these results"),
      h("button", { type: "button", class: "btn btn-secondary", onclick: () => window.print() }, "Print or save as PDF"),
      h("button", { type: "button", class: "btn btn-link", onclick: startOver }, "Retake the check"),
      copyStatus,
    ),

    h(
      "p",
      { class: "muted small disclaimer" },
      "Indicative, rule-based self-assessment built from your answers. It is not an audit and does not inspect your systems.",
    ),
  );
  show("results");
}

// ----------------------------------------------------------------- routing

function route() {
  const shared = fromResultHash(location.hash, TOTAL);
  if (shared) {
    state.answers = shared;
    showResults();
  } else {
    showIntro();
  }
}

window.addEventListener("hashchange", route);
route();
