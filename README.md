# PBL Intelligence

A small web app for the Mantra4Change assignment. It shows how PBL is going in schools month by month, and helps write grant reports from real numbers.

## What it does

- **Program Review** (`/`): pick a month, district, block, grade and subject. See KPIs, change from last month, a trend chart, best and worst districts and blocks, a meeting summary and next actions.
- **Grant Reports** (`/grants`): pick a grant and a month. See numbers, money spent, milestones, risks, evidence photos and a report you can copy.

## Tech

Next.js, TypeScript, Tailwind, Recharts, Prisma, PostgreSQL (local for dev, Neon for live).

## How to run

1. Make an empty Postgres database called `pbl_intelligence`.
2. Copy `.env.example` to `.env` and put your database link in it.
3. Run:

```bash
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

Open http://localhost:3000

The seed command loads the CSV files from `data/`. You can run it again any time.

## How it is built

```
CSV files -> seed script -> database -> API routes -> logic in src/lib -> pages
```

- `risk.ts`: risk rules
- `metrics.ts`: all the percentages
- `summary.ts`: meeting summary
- `actions.ts`: next actions
- `narrative.ts`: grant report text

## Data

- `SchoolResponse`: one school, one month
- `GrantFinance`: money per grant, month and budget line
- `GrantPerformance`: results and milestones per grant and month
- `EvidenceMedia`: photos and news clips linked to a grant and month

The three monthly CSVs are joined into one table when seeding.

## How numbers are worked out

- **Participation** = schools that did PBL / all schools
- **Evidence** = schools that did PBL and sent evidence / all schools
- **Attendance** = students present / (enrolled students x subjects). With both subjects, it is enrolled x 2, which matches the CSV.
- **Change from last month** = this month minus last month, in points
- Grade and subject filters only count schools that ran PBL for that grade and subject.

## Risk rules

| Status | Score |
| --- | --- |
| On Track | 75% or more |
| Behind | 60% to under 75% |
| At Risk | 35% to under 60% |
| Critical | under 35% |

Each number gets its own status. A district or block gets the worst of its three. Every status comes with a short reason.

## About AI

There is no AI at runtime. Text is made by simple templates from calculated facts, so everything works with AI off.

In the grant report, each sentence has a tag like `[F1]` that points to the fact it came from. The grant numbers are calculated from school data and checked against the grant file. The page tells you if they match.

If I add AI later, it will only reword these facts, and I will check that no new numbers appear.

## Assumptions

- One CSV row = one school for one month.
- A grant covers the districts listed in its file.
- Finance "units" are used as given.
- Evidence is shown only if the index links it to that grant and month. Nothing is made up.
- Action due dates: 7 days for High, 14 for Medium, 30 for Low.

## Limits

- No login.
- Action status changes are not saved.
- No PDF or Word export, only copy.
- No automated tests.
- Works well for this much data, but not for millions of rows.

## For real production

- Do the sums in SQL, and add caching.
- Add login and roles.
- Save actions in the database.
- Add tests for risk and metric logic.
- Add error tracking and backups.

## Future ideas

- Free AI to reword the text, with number checks
- PDF and Word export
- School-level view
- Upload new monthly CSVs from the app
