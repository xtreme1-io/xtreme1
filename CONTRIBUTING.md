# Contributing to Xtreme1

## What to expect

- Small, self-contained fixes are what lands. The median external pull request merged here
  changed one file and seven lines; anything larger takes longer.
- No reply for two weeks? Comment again and mention @jotamotk. That is the intended way to get
  attention, not rudeness.
- Releases happen when there is something worth releasing. Do not plan around a date.

## Before you write code

**Ask first for anything that is not obviously small.** Open an issue describing what you want to
change and why, and wait for a reply before building it — a design turned down costs an
afternoon, a finished pull request turned down costs a week.

No need to ask for typos, broken links, documentation, a crash with an obvious one-line cause, or
a dependency or image-tag bump you have verified.

**Likely to be merged**: a bug you hit yourself fixed with the smallest change that fixes it; a
change that keeps existing data readable and existing installations working; a change confined to
one area of the repository.

**Often declined, so ask first**: refactors, renames or reformatting a fix does not require; new
runtime dependencies, build tooling or CI workflows; features outside point cloud and
multi-sensor annotation, since the product surface is being narrowed rather than widened; changes
that only move code between files or only change style.

## Where things are

`backend/` is a Java 11 / Spring Boot 2.6 monolith. `frontend/` holds four independent Vue 3
applications: `main`, built from the vben admin template, whose conventions apply nowhere else;
`pc-tool`, point cloud and multi-sensor annotation, where most of the work is; `image-tool`; and
`text-tool`, which is not under development.

- Install and run the released stack: [`README.md`](README.md)
- Backend development: [`backend/README.md`](https://github.com/xtreme1-io/xtreme1/blob/main/backend/README.md)
- Frontend development: [`frontend/README.md`](https://github.com/xtreme1-io/xtreme1/blob/main/frontend/README.md)
  and each app's own README
- Database schema changes: [`db/migration/README.md`](backend/src/main/resources/db/migration/README.md)
- User-facing documentation: the [docs repository](https://github.com/xtreme1-io/docs), published
  through [GitBook](https://www.gitbook.com/)

## Running the checks

Every pull request builds both images from your branch, starts the stack and runs the smoke test.
Green means: the stack comes up, an image and a lidar-fusion dataset each upload, parse and
download with every file accounted for, the four front-end entry pages answer, and `/data/upload`
still refuses what it should. It does not mean your change is right, so run the smallest of these
that covers it first:

1. `mvn -B package` in `backend/`. There are few tests, but there are some now — do not reach for
   `-DskipTests` out of habit. `mvn checkstyle:check` checks nothing:
   `backend/coding-standards/` has five config files, but `backend/pom.xml` declares only
   `spring-boot-maven-plugin`, whatever `backend/README.md` implies.
2. `npm run build` in the app you touched, on Node 16 — `frontend/Dockerfile` builds with `node:16`,
   so a build needing newer Node is a broken build. Not `npm run test`: in `frontend/main` that is
   `vite --mode test`, which starts a dev server. `npm run lint:eslint` exists in `image-tool` only.
3. Both together: `docker compose up -d --wait`, then `python3 .github/ci-verify/smoke.py`. It
   wants the stack on `:8190` and the trial zips under `./samples`; `docker-compose.yml` pulls
   released images until you uncomment the `build:` lines. Two of its checks need hostnames that
   answer with an internal address, so they skip — printing a line — unless you copy the
   `extra_hosts` from `.github/workflows/pr.yml` and set `X1_GUARD_HOSTS=1`.
   Touching `UploadUrlValidator` or the download in `UploadDataUseCase`? Run
   `.github/ci-verify/attack_ssrf.py` as well; its header says what stack it needs.

If a check could not be run, say so in the pull request description.

## Things that will catch you out

- `backend/Dockerfile` pip-installs `xtreme1-io/xtreme1-sdk` at a pinned commit and downloads the
  trial datasets from `xtreme1-io/asset`. Neither repository can be archived, made private or
  vendored without editing that Dockerfile in the same change.
- Two migration directories, one of them yours. `deploy/mysql/migration` is mounted at
  `/docker-entrypoint-initdb.d`, so it runs on a new installation and never again — a script
  added there silently skips every existing installation. Yours goes under
  `backend/src/main/resources/db/migration`; read its README first.
- `DatasetTypeEnum.TEXT` and `InputTypeEnum.TEXT` outlive `frontend/text-tool`: the upload and
  classification paths read them, and existing TEXT datasets must keep loading.
- Prettier is not uniform: `pc-tool` and `text-tool` comment it out of `.eslintrc.js` and use
  `tabWidth: 4`, `main` and `image-tool` enable it at 2. Each app's own config is authoritative —
  running Prettier across `pc-tool` rewrites the whole app.
- `@commitlint/*`, `lint-staged` and `husky` appear in `package.json`, but there is no `.husky/`
  directory and no commitlint config. The hooks are dead — do not repair them to make a command
  work.
- `frontend/text-tool/package.json` still declares `"name": "pc-tool"`.

## Pull requests

- Fork, branch from `main`, one logical change per [pull request](https://github.com/xtreme1-io/xtreme1/compare).
- Squash-merged, so **the title becomes the commit message on `main`**. Write it as
  `type: subject` — `fix:`, `feat:`, `docs:`, `chore:`, `refactor:`, `ci:`, optionally scoped like
  `fix(pc-tool):`. Nothing enforces it; it is what makes release notes writable.
- The description says what changed, why, and what you ran to convince yourself it works.
  Screenshots or a short clip for anything visible in the annotation tools.
- Do not reformat files you did not otherwise change. The four frontend apps are configured
  differently on purpose, and a diff buried in formatting cannot be reviewed.
- No CLA. The template has one checkbox confirming you submit under the project's Apache-2.0
  license.

## Reporting bugs

Open an [issue](https://github.com/xtreme1-io/xtreme1/issues/new/choose) with the bug template and include:

- the version — a release tag, or the commit you built from
- how you installed it: release package, `docker compose up`, or a local build
- browser and operating system for annotation tool bugs
- the relevant part of `docker compose logs backend`

A bug nobody can reproduce gets closed rather than investigated; reopen it if you find the steps.
Questions and ideas are welcome too — use the question template so they are not read as bug
reports. Security problems: do not open a public issue, follow [`SECURITY.md`](SECURITY.md).

## Staying in touch

Suggestions, comments and criticism are all welcome, and code is not the only contribution that
counts. Follow along wherever you already are:

* [GitHub](https://github.com/xtreme1-io/xtreme1)
* [Twitter](https://twitter.com/Xtreme1io)
* [YouTube](https://www.youtube.com/@basicai)
* [LinkedIn](https://linkedin.com/company/basicaius)
* [Facebook](https://www.facebook.com/basicaiinc)
* [Reddit](https://www.reddit.com/r/BasicAI)

## Language

English is the default for everything in the repository: code, comments, commit messages, file
names, documentation. Issues and pull request descriptions may be in any language — you will get
a reply in the one you used.
