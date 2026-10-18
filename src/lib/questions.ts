// The whole assessment lives in this file: edit questions, weights and advice here.
//
// Every question has four options; the index of the option is its score (0-3).
// `weight` (1-3) says how much the question matters for the area and overall score.
// `risk`, `impact` and `fix` are shown when the question ends up among the top risks.
//
// Changing the order or number of questions invalidates previously shared result links,
// so bump ANSWER_FORMAT_VERSION in scoring.ts if you do.

export type AreaId = "delivery" | "operations" | "resilience" | "security" | "architecture";

export interface Area {
  id: AreaId;
  name: string;
  short: string;
  blurb: string;
}

export interface Question {
  id: string;
  area: AreaId;
  weight: 1 | 2 | 3;
  text: string;
  /** Four options; the index of an option is its score (0-3). */
  options: readonly [string, string, string, string];
  risk: string;
  impact: string;
  fix: string;
}

export const areas: readonly Area[] = [
  {
    id: "delivery",
    name: "Delivery & Releases",
    short: "Delivery",
    blurb: "How code gets from a laptop to production.",
  },
  {
    id: "operations",
    name: "Observability & Operations",
    short: "Operations",
    blurb: "How quickly you notice problems and fix them.",
  },
  {
    id: "resilience",
    name: "Resilience & Data",
    short: "Resilience",
    blurb: "What happens when something breaks or disappears.",
  },
  {
    id: "security",
    name: "Security & Access",
    short: "Security",
    blurb: "Who can touch production, and whether you would know.",
  },
  {
    id: "architecture",
    name: "Architecture & Knowledge",
    short: "Architecture",
    blurb: "How understandable and changeable the system is.",
  },
];

export const questions: readonly Question[] = [
  // ---------------------------------------------------------------- Delivery
  {
    id: "deploy-method",
    area: "delivery",
    weight: 3,
    text: "How does a change get to production?",
    options: [
      "Someone copies files or runs commands by hand on the server",
      "A script exists, but it is run manually and only by a few people",
      "A CI/CD pipeline deploys, with manual steps or approvals in between",
      "A pipeline deploys the same way every time, with no manual steps beyond approval",
    ],
    risk: "Releases depend on manual steps",
    impact:
      "Manual deploys are slow, error-prone and tied to specific people, so every release carries avoidable risk.",
    fix: "Put the deploy path into one pipeline: build once, deploy the same artifact everywhere, and make the pipeline the only way to reach production.",
  },
  {
    id: "release-frequency",
    area: "delivery",
    weight: 2,
    text: "How often do you release to production?",
    options: [
      "Less than once a quarter, or each release is a big event",
      "About once a month",
      "Weekly",
      "Whenever a change is ready: several times a week or daily",
    ],
    risk: "Infrequent, large releases",
    impact:
      "Big batches hide defects, make failures harder to diagnose and slow down feedback from customers.",
    fix: "Shrink the batch size: ship behind feature flags, split work into smaller increments, and aim to halve the release interval before optimising anything else.",
  },
  {
    id: "rollback",
    area: "delivery",
    weight: 3,
    text: "If a release goes wrong, how do you recover?",
    options: [
      "We would improvise: there is no defined way back (or I don't know)",
      "We could roll back, but it is manual and has never been rehearsed",
      "There is a documented rollback and we have used it before",
      "Rollback is one click or automatic, and we practise it",
    ],
    risk: "No tested way to undo a bad release",
    impact:
      "A failed release turns into a long outage while people work out how to get back.",
    fix: "Define and rehearse a rollback for the next release: keep the previous artifact deployable, make database changes backward-compatible, and time how long a rollback takes.",
  },
  {
    id: "release-tests",
    area: "delivery",
    weight: 2,
    text: "What stops a broken change from reaching production?",
    options: [
      "Nothing automated: we rely on manual checks or luck",
      "Some automated tests exist, but they run occasionally or are ignored when they fail",
      "Tests run in CI on every change, but coverage is patchy or some tests are flaky",
      "A trusted automated suite blocks the release on failure, including the critical user flows",
    ],
    risk: "No reliable safety net before production",
    impact:
      "Regressions reach customers, and the team becomes afraid to change anything.",
    fix: "Start with a small set of tests around the flows that earn or lose money, make them block the merge, and fix or delete flaky tests instead of re-running them.",
  },

  // -------------------------------------------------------------- Operations
  {
    id: "monitoring",
    area: "operations",
    weight: 3,
    text: "How do you find out that something is broken in production?",
    options: [
      "Customers or colleagues tell us (or I don't know)",
      "A basic uptime check pings the site",
      "Metrics and alerts cover our main services and someone gets notified",
      "Alerts are tied to user-facing objectives (SLOs), have clear owners and are reviewed for noise",
    ],
    risk: "Problems are found by customers first",
    impact:
      "Outages last longer and cost trust, because detection starts only when someone complains.",
    fix: "Alert on what users feel (error rate, latency and availability of the key journeys) and route alerts to a named person or rota, not a shared inbox.",
  },
  {
    id: "logging",
    area: "operations",
    weight: 2,
    text: "How well can you investigate what happened?",
    options: [
      "We log into servers and read files, or there are few logs",
      "Logs are collected centrally, but unstructured and hard to search",
      "Centralised, searchable logs with request or correlation IDs",
      "Logs, metrics and traces are correlated, so one request can be followed across services",
    ],
    risk: "Slow, manual troubleshooting",
    impact:
      "Diagnosis takes hours instead of minutes, and some problems are never explained.",
    fix: "Centralise logs, switch to structured (JSON) logging, and pass a correlation ID through every request so a single failure can be traced end to end.",
  },
  {
    id: "incidents",
    area: "operations",
    weight: 3,
    text: "What happens when there is an incident?",
    options: [
      "Whoever notices it deals with it, ad hoc",
      "A few people know what to do, but nothing is written down",
      "There is an on-call rota and runbooks for the common failures",
      "On-call, runbooks and blameless post-incident reviews with tracked follow-up actions",
    ],
    risk: "No defined incident response",
    impact:
      "Incidents depend on heroics, repeat themselves and burn out the people who know the system.",
    fix: "Write a one-page incident process (who leads, where you talk, who informs customers), add runbooks for the three most likely failures, and review every serious incident in writing.",
  },
  {
    id: "capacity",
    area: "operations",
    weight: 2,
    text: "How well do you understand performance and capacity?",
    options: [
      "We find out when it gets slow or falls over",
      "We glance at basic resource graphs (CPU, memory, disk) when we remember",
      "We track performance trends and know our approximate limits",
      "We load-test before big changes or events and plan capacity ahead",
    ],
    risk: "Capacity limits are unknown",
    impact:
      "Growth or a traffic spike can take the system down without warning.",
    fix: "Measure the current peak load, run a simple load test to find the first bottleneck, and alert well before that limit (disk, connections, queue depth).",
  },

  // -------------------------------------------------------------- Resilience
  {
    id: "backups",
    area: "resilience",
    weight: 3,
    text: "How are your production data and backups handled?",
    options: [
      "No backups, or I'm not sure they exist",
      "Backups exist, but nobody monitors whether they succeed",
      "Automated, monitored backups stored separately from production",
      "Automated, monitored, versioned or immutable backups in a separate account or location",
    ],
    risk: "Data loss is not safely covered",
    impact:
      "A deleted database, a bad migration or ransomware could be unrecoverable.",
    fix: "Automate backups of every datastore, keep copies in a separate account or location, alert on failed or missing backups, and make at least one copy immutable.",
  },
  {
    id: "restore",
    area: "resilience",
    weight: 3,
    text: "Have you ever restored from a backup?",
    options: [
      "Never (or I don't know)",
      "Once, a long time ago",
      "We test a restore manually from time to time",
      "Restores are tested on a schedule and we know how long they take",
    ],
    risk: "Backups have never been proven to restore",
    impact:
      "An untested backup is a hope, not a plan; failures usually surface during the incident.",
    fix: "Schedule a restore test this month into a clean environment, record how long it took and what broke, then repeat quarterly (and automate it once it works).",
  },
  {
    id: "single-points",
    area: "resilience",
    weight: 2,
    text: "What happens if a key server, database or availability zone fails?",
    options: [
      "Everything runs on a single server or instance; we would be down until it is fixed",
      "Some parts are redundant, but the database or other core pieces are not",
      "Critical components are redundant and failover is automatic",
      "Redundancy across zones, and failover is tested regularly",
    ],
    risk: "Single points of failure",
    impact:
      "One hardware, network or provider fault takes the whole product offline.",
    fix: "List the components whose failure stops the business and remove them one by one, starting with the datastore; a managed multi-zone database is usually the cheapest first step.",
  },
  {
    id: "rebuild",
    area: "resilience",
    weight: 2,
    text: "Could you rebuild your infrastructure from scratch?",
    options: [
      "Servers were set up by hand over time; nobody could recreate them exactly",
      "Parts are scripted, but a lot of configuration lives only on the machines",
      "Mostly infrastructure as code, with a few manual gaps",
      "Fully defined as code, and we have rebuilt an environment from scratch",
    ],
    risk: "Infrastructure can't be reproduced",
    impact:
      "Recovering from a disaster, or even creating a staging copy, becomes slow guesswork.",
    fix: "Capture the infrastructure in code (Terraform, Pulumi, or at least scripts plus configuration management), starting with network and compute, and prove it by building a throwaway copy.",
  },

  // ---------------------------------------------------------------- Security
  {
    id: "prod-access",
    area: "security",
    weight: 3,
    text: "Who can reach production, and how?",
    options: [
      "Shared logins, or many people have admin rights (or I don't know)",
      "Everyone has their own account, but permissions are broad",
      "Role-based, least-privilege access, reviewed occasionally",
      "Least privilege, MFA everywhere, time-limited elevation and regular access reviews",
    ],
    risk: "Production access is too broad",
    impact:
      "A single stolen or misused account can read, change or delete everything.",
    fix: "Remove shared credentials, enforce MFA, cut standing admin rights to the few who need them, and review the access list every quarter, including leavers.",
  },
  {
    id: "secrets",
    area: "security",
    weight: 3,
    text: "Where do passwords, API keys and certificates live?",
    options: [
      "In the code repository, chat, or config files copied around",
      "In CI or server environment variables, rotated manually if ever",
      "In a secrets manager, with rotation for some secrets",
      "In a secrets manager with automated rotation, and secret scanning in CI",
    ],
    risk: "Secrets are poorly protected",
    impact:
      "Leaked credentials are a very common way into production, and are hard to revoke when nobody knows where they are used.",
    fix: "Scan the repository history for secrets and rotate anything found, then move credentials into a secrets manager and add scanning to the pipeline.",
  },
  {
    id: "patching",
    area: "security",
    weight: 2,
    text: "How do you keep dependencies and systems up to date?",
    options: [
      "No process: we update when something forces us to",
      "Occasional updates, usually after a security scare",
      "Regular scheduled updates for the OS, runtime and libraries",
      "Automated dependency and vulnerability scanning, with an agreed time to fix critical issues",
    ],
    risk: "Known vulnerabilities go unpatched",
    impact:
      "Published vulnerabilities are exploited within days, and the longer you wait the harder upgrades become.",
    fix: "Turn on automated dependency updates and vulnerability alerts, and agree a fix window for critical issues (for example seven days).",
  },
  {
    id: "audit-trail",
    area: "security",
    weight: 2,
    text: "Can you tell who did what in production?",
    options: [
      "No, or I don't know",
      "Partly: some systems keep logs, but nobody looks at them",
      "Audit logs for admin actions and deployments are kept and searchable",
      "Audit logs are retained, protected from tampering, and alerts fire on suspicious actions",
    ],
    risk: "No audit trail for production changes",
    impact:
      "After a breach or a bad change you cannot reconstruct what happened, or prove what did not.",
    fix: "Enable audit logging on your cloud and admin tools, send admin and deploy events to a retained, write-protected store, and alert on high-risk actions such as new admin users.",
  },

  // ------------------------------------------------------------ Architecture
  {
    id: "documentation",
    area: "architecture",
    weight: 2,
    text: "How well is the architecture documented?",
    options: [
      "It lives in people's heads",
      "Some documents exist, but they are outdated",
      "Current diagrams of the main components and data flows",
      "Current diagrams plus decision records (ADRs) explaining why things are the way they are",
    ],
    risk: "Architecture is undocumented",
    impact:
      "Onboarding is slow, decisions get re-argued, and changes are made without understanding the side effects.",
    fix: "Draw a one-page diagram of the main components with owners, keep it in the repository, and start recording significant decisions as short ADRs.",
  },
  {
    id: "key-person",
    area: "architecture",
    weight: 3,
    text: "If your most knowledgeable engineer left tomorrow...",
    options: [
      "...we would be in serious trouble: critical knowledge sits with one person",
      "...it would hurt a lot: only two people know the critical parts",
      "...we would cope: most of the team can work on the critical parts",
      "...we would barely notice: knowledge is documented, shared and rotated",
    ],
    risk: "Key-person dependency",
    impact:
      "Holidays, resignations or illness can stall delivery or leave production unsupportable.",
    fix: "Pair on the critical areas, rotate who handles releases and on-call, and have the key person write down (or record) what only they know, starting with the production runbook.",
  },
  {
    id: "tech-debt",
    area: "architecture",
    weight: 2,
    text: "How is technical debt handled?",
    options: [
      "Ignored: there is never time",
      "We know about it, but nothing is planned",
      "There is a backlog and some capacity is spent on it",
      "A visible backlog, an explicit capacity budget each cycle, and progress is reviewed",
    ],
    risk: "Technical debt is unmanaged",
    impact:
      "Delivery speed erodes over time and the cost of each change keeps rising.",
    fix: "Make the debt visible: list the top ten items with their cost to the business, then reserve a fixed share of each iteration (10-20%) for them.",
  },
  {
    id: "change-risk",
    area: "architecture",
    weight: 3,
    text: "How risky is a typical change to the core system?",
    options: [
      "Frightening: changes often break unrelated things",
      "Risky: we avoid touching certain areas",
      "Usually contained, with a few tightly coupled areas",
      "Predictable: modules have clear boundaries and owners",
    ],
    risk: "Changes are risky and tightly coupled",
    impact:
      "Fear of change slows every project and pushes problems into production.",
    fix: "Find the most fragile area, add characterisation tests around it, and introduce clear module boundaries step by step instead of attempting a rewrite.",
  },
];
