# Contributing to Xtreme1

There is no fixed release cadence, and no promise about response times anywhere in this file.
The two sections below decide whether your work gets merged; the rest is detail.

## What to expect

- Small, self-contained fixes are what has actually landed here. The median external pull request
  merged into this repository changed one file and seven lines.
- Anything larger takes longer to review.
- If an issue or pull request gets no reply for two weeks, comment on it again and mention
  @jotamotk. That is not rude; it is the intended way to get attention.
- Releases happen when there is something worth releasing. Do not plan around a date.

## Before you write code

**Ask first for anything that is not obviously small.** Open an issue describing what you want to
change and why, and wait for a reply before building it. A design that gets turned down costs you an afternoon; a finished pull request that
gets turned down costs you a week.

You do not need to ask for: typos, broken links, documentation, a crash with an obvious one-line
cause, or a dependency and image-tag bump you have verified.

Likely to be merged:

- a bug you hit yourself, fixed with the smallest change that fixes it
- a change that keeps existing data readable and existing installations working
- a change confined to one area of the repository

Ask before starting, because these are often declined:

- refactors, renames, or reformatting that a fix does not require
- new runtime dependencies, new build tooling, new CI workflows
- new features outside point cloud and multi-sensor annotation — the product surface is being
  narrowed, not widened
- changes that only move code between files or only change style

## Where things are

`backend/` is a Java 11 / Spring Boot 2.6 monolith. `frontend/` holds four independent Vue 3
applications: `main`, built from the vben admin template, whose conventions apply nowhere else;
`pc-tool`, point cloud and multi-sensor annotation, where most of the work is; `image-tool`; and
`text-tool`, which is not under development.

- Install and run the released stack: `README.md`
- Backend development: `backend/README.md`
- Frontend development: `frontend/README.md` and each app's own README
- Database schema changes: `backend/src/main/resources/db/migration/README.md`

## Running the checks

Every pull request builds both images from your branch, starts the stack, and runs the end-to-end
smoke test. A green run means the stack comes up and one upload-parse-download round trip works.
It does not mean your change is right, so run the smallest of these that covers it before pushing:

1. `mvn -B package` in `backend/`. There are few tests, but there are some now — do not reach for
   `-DskipTests` out of habit. `mvn checkstyle:check` checks nothing:
   `backend/coding-standards/` has five config files, but `backend/pom.xml` declares only
   `spring-boot-maven-plugin`, whatever `backend/README.md` implies.
2. `npm run build` in the app you touched, on Node 16 — `frontend/Dockerfile` builds with `node:16`,
   so a build needing newer Node is a broken build. Not `npm run test`: in `frontend/main` that is
   `vite --mode test`, which starts a dev server. `npm run lint:eslint` exists in `image-tool` only.
3. Backend and frontend together: `docker compose up -d --wait`, then
   `python3 .github/ci-verify/smoke.py`. It wants the stack on `:8190` and the trial zips under
   `./samples`, and `docker-compose.yml` pulls released images until you uncomment the `build:`
   lines.

If a check could not be run, say so in the pull request description. An unrun check is not a
passed check.

## Things that will catch you out

- `backend/Dockerfile` pip-installs `xtreme1-io/xtreme1-sdk` at a pinned commit and downloads the
  trial datasets from `xtreme1-io/asset`. Neither repository can be archived, made private or
  vendored without editing that Dockerfile in the same change.
- A schema change is a new `V3__*.sql` and upwards under
  `backend/src/main/resources/db/migration`, applied by Flyway when the backend starts.
  `deploy/mysql/migration` holds `V1` and `V2` only; it is mounted at
  `/docker-entrypoint-initdb.d`, so the MySQL image runs it on a new installation and never
  again. Do not add a `V3` there, and never edit a migration that has shipped — Flyway checksums
  it and will refuse to start against a database where it ran with different contents.
- `DatasetTypeEnum.TEXT` and `InputTypeEnum.TEXT` outlive `frontend/text-tool` — they are read
  across the upload and classification paths, and existing TEXT datasets must keep loading.
  Removing the app is not removing the enum value.
- Prettier is not uniform: `pc-tool` and `text-tool` comment `plugin:prettier/recommended` out of
  `.eslintrc.js` and set `tabWidth: 4`, while `main` and `image-tool` enable it at 2. Running
  Prettier across `pc-tool` rewrites the whole app; each app's own config is authoritative.
- `@commitlint/*` and `lint-staged` are in all four `package.json` files and `husky` in two, but
  there is no `.husky/` directory and no commitlint config. The hooks are dead — do not repair them
  to make a command work.
- `frontend/text-tool/package.json` still declares `"name": "pc-tool"`.

## Pull requests

- Fork, branch from `main`, one logical change per pull request.
- Pull requests are squash-merged, so **the pull request title becomes the commit message on
  `main`**. Write it as `type: subject` — `fix:`, `feat:`, `docs:`, `chore:`, `refactor:`, `ci:`,
  with an optional scope such as `fix(pc-tool):`. Nothing enforces this and no hook will stop you;
  it is what the recent history looks like and what makes release notes writable.
- The description says what changed, why, and what you ran to convince yourself it works.
  Screenshots or a short clip for anything visible in the annotation tools.
- Do not reformat files you did not otherwise change. The four frontend apps are configured
  differently on purpose, and a diff buried in formatting cannot be reviewed.
- There is no CLA. The pull request template has one checkbox confirming that you submit your
  change under the same Apache-2.0 license that covers the project.

## Reporting bugs

Use the bug template and include:

- the version — a release tag, or the commit you built from
- how you installed it: release package, `docker compose up`, or a local build
- browser and operating system for annotation tool bugs
- the relevant part of `docker compose logs backend`

A bug that cannot be reproduced gets closed rather than investigated. If you can reproduce it
again later, reopening is fine.

Questions and ideas are welcome as issues too — use the question template, so they are not read as
bug reports.

Security problems: do not open a public issue. Follow `SECURITY.md`.

## Language

English is the default for everything in the repository: code, comments, commit messages,
file names, and documentation.

Issues and pull request descriptions may be written in any language. You will get a reply in
the language you used.
