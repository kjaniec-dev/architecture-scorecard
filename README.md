# Architecture & Delivery Scorecard

Free, browser-based architecture & delivery health check. No account, no tracking, no AI.

Live at **https://scorecard.kjaniec.dev**

Visitors answer 20 questions in 5 areas (Delivery & Releases, Observability & Operations,
Resilience & Data, Security & Access, Architecture & Knowledge) and get an overall score, a radar
chart, a score per area, their 3 biggest risks with recommendations, and a
"Book an architecture review" button.

## How the score works

Rule-based, deterministic, no AI. Each answer scores 0-3; each question has a weight (1-3).
A score is the weighted share of available points, per area and overall (0-100). The top risks are
the questions with the largest `weight x (3 - score)`; ties go to the heavier, then earlier question.
All logic is in [`js/scoring.js`](js/scoring.js).

## Privacy

Static files only: no backend, cookies, analytics or third-party requests (enforced by a strict
Content-Security-Policy). Progress is kept in the browser's local storage. A shareable result link
holds the answers in the URL hash (`#r=1.0123...`), which browsers never send to the server.

## Customise

- `js/config.js`: contact email, or a booking URL (Cal.com, Calendly...). With no `bookingUrl`
  the button opens an email with the results pre-filled. **Set `contactEmail` before deploying.**
- `js/questions.js`: all questions, options, weights and recommendations. If you add, remove or
  reorder questions, bump `ANSWER_FORMAT_VERSION` in `js/scoring.js` so old links are rejected
  instead of misread.

## Develop

No build step and no dependencies.

```sh
npm start   # serves on http://localhost:8080 (ES modules need http, not file://)
npm test    # scoring and data tests, Node 20+
```

## Deploy

Any static host. `CNAME` is set up for GitHub Pages with the custom domain
`scorecard.kjaniec.dev` (add a `CNAME` DNS record pointing to `kjaniec-dev.github.io`).
