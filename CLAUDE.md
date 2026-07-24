# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

No build step, no framework, no package to install beyond the single Vercel middleware dependency.

```bash
# Serve locally
npx serve .
```

Opening `index.html` directly also works for most features, but the LEGO page (`projects/lego/`) loads Python source files via `fetch()`, so it needs a local server.

## Architecture

This is the personal portfolio at `joavn.dev` — plain HTML/CSS/JS, deployed on Vercel. Its `projects/` subfolder is a **sync target**: several of the other repos in this GitHub account build their client and push the output here via their own `sync-portfolio.sh`/`.ps1` script (usually triggered by a GitHub Actions workflow on push to their main branch), so that project gets served at `joavn.dev/<name>/`. Don't hand-edit built project output in `projects/<name>/` for those — edit the source repo and let the sync script overwrite it:

- `projects/versed/` ← synced from `Versed`'s client build
- `projects/choridor/` ← synced from `CHORIDOR-web`
- `projects/dart-scores/` ← synced from `Dart-Scores`
- `projects/mpi/` ← synced from `Music-Popularity-Index`
- `projects/dashboard/` ← synced from `Personal-Dashboard`'s demo client build (fake data, no backend)
- `projects/lego/` is authored directly in this repo (no source project), it's a static page for the NTNU LEGO MINDSTORMS coursework.

`vercel.json` rewrites the clean routes (`/versed/`, `/choridor/`, `/mpi/`, `/dart-scores/`, `/dashboard/`, `/lego/`) to their `projects/<name>/` subfolders — this indirection is what lets each synced project keep a normal-looking URL. `middleware.js` lowercases extensionless page routes for case-insensitive URLs, but explicitly skips `/resources/` because those asset filenames (e.g. `Me.jpg`, `CHORIDOR_Logo.png`) are case-sensitive on disk.

### Homepage project cards (`script.js`)

The `PROJECTS` array at the top of `script.js` drives the homepage cards. Each entry can have:
- `github` — a `owner/repo` slug; `fetchRepo()` hits the GitHub REST API for live stars/language/description and caches the response in `sessionStorage` per slug to stay under rate limits.
- `screenshotsDir` — a repo path fetched via the GitHub Contents API to pull in screenshot images at runtime, paired with `positions` (one CSS `background-position` per screenshot) for the carousel.
- `brandColor` — either a solid hex, a `{ gradient: [c1, c2] }`, or a `{ duo: [c1, c2] }`; `brandColorVars()` turns whichever shape into CSS custom properties (`--brand-color`, `--brand-gradient`, etc.) so downstream CSS never needs to know which shape it came from.
- `isVariant` + `variants` — used when one card represents the same project shipped multiple ways (CHORIDOR Web vs Desktop share one card with a label switcher).
- Cards without a `github` slug (e.g. LEGO MINDSTORMS) set `isProduct: true` and supply `description`/`language`/`screenshots` directly instead of fetching them.

Beyond the cards, `script.js` also drives scroll-triggered reveal animations and the carousels via `IntersectionObserver`, and page navigation transitions via the View Transitions API (`initViewTransitionDirection`).
