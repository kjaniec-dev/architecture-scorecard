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
All logic is in [`src/lib/scoring.ts`](src/lib/scoring.ts).

## Stack

[Astro](https://astro.build) (static output) + TypeScript (strict) + a small React island for the
quiz and results. Vitest for tests.

UI comes from the KJ Product Kit ([`kjaniec-dev/ui-kit`](https://github.com/kjaniec-dev/ui-kit)):
`@kjaniec-dev/design` (tokens, Tailwind v4 theme) and `@kjaniec-dev/ui` (Button, Card, Badge, Alert,
Progress, ProgressRing, Radio), styled with Tailwind CSS 4. The radar chart is a small custom SVG
that uses the kit's tokens. The kit switches theme with a `.dark` class, which a tiny script in
`Layout.astro` sets from the OS preference.

```
src/lib/          scoring, question structure, summary, theme, config (pure TypeScript, unit tested)
src/i18n/         en.ts, pl.ts (all wording, typed so no language can fall behind), index.ts
src/components/   Scorecard (state), Quiz, Results, Radar, HeaderControls, Home.astro
src/pages/        index.astro (EN, "/") and pl/index.astro (PL, "/pl/")
src/styles/       global.css (Tailwind + kit imports, radar, print)
public/           favicon, CNAME, robots.txt
```

## Languages and theme

English lives at `/` and Polish at `/pl/`: separate static pages with `hreflang` alternates, so each
is indexable. The switch in the header keeps the `#...` result link, and answers are language
neutral, so a result (or an unfinished quiz) carries over between languages.

The theme switch offers Auto (follow the OS), Light and Dark. Only an explicit choice is stored, in
local storage; an inline script applies it before first paint to avoid a flash.

To add a language: create `src/i18n/<code>.ts` satisfying `Messages`, register it in
`src/i18n/types.ts` (`LANGS`) and `src/i18n/index.ts`, and add a page under `src/pages/<code>/`.
The compiler and `src/i18n/i18n.test.ts` flag anything missing.

## Privacy

Static files only: no backend, cookies, analytics or third-party requests. Astro's built-in
Content-Security-Policy (hashed scripts and styles, `default-src 'none'`) enforces that. Progress is
kept in the browser's local storage. A shareable result link holds the answers in the URL hash
(`#r=1.0123...`), which browsers never send to the server.

## Customise

- `src/lib/config.ts`: contact email, or a booking URL (Cal.com, Calendly...). With no `bookingUrl`
  the button opens an email with the results pre-filled. **Set `contactEmail` before deploying.**
- `src/i18n/en.ts`, `src/i18n/pl.ts`: all question wording, options and recommendations.
- `src/lib/questions.ts`: which questions exist, their area and weight. If you add, remove or
  reorder questions, bump `ANSWER_FORMAT_VERSION` in `src/lib/scoring.ts` so old links are rejected
  instead of misread.

## Develop

Node 22.12+.

```sh
npm install
npm run dev       # http://localhost:4321 (CSP is only applied in build/preview)
npm test          # Vitest
npm run check     # astro check (type-check)
npm run build     # type-check + static build into dist/
npm run preview   # serve dist/ with the real CSP
```

## Deploy

`dist/` is plain static files, so any static host works. `public/CNAME` is set for GitHub Pages with
the custom domain `scorecard.kjaniec.dev` (add a `CNAME` DNS record pointing to
`kjaniec-dev.github.io`).
