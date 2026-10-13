# Limit Break: project rules

Limit Break (renamed from System Hunter on 2026-10-09; repo and Vercel project are still called system-hunter) is an RPG workout web app: open it, today's quest is waiting, one tap clears it, the System levels you up. Rebuilt from scratch in October 2026. The full spec is `docs/plans/2026-10-09-system-hunter-v1.md` and its "Decisions already made" section is binding. Don't reopen those decisions. If one looks wrong, stop and ask Fonzo.

## Shape

- Vite + Preact + plain JS. Vitest for tests. `vite-plugin-pwa` makes it installable and offline. Fonts are self-hosted via `@fontsource` (OFL). Never use "personal use only" fonts, because the app is public.
- `src/game/` holds the game rules as pure functions. No DOM, no `Date.now()`, no `localStorage` inside them except `save.js`. Pass `today`/`now` in. Every rule has tests.
- `src/ui/` holds the Preact components. `src/theme.css` holds all colors, fonts and borders as tokens under `[data-theme="night"]`. No literal colors in components.
- Only 3 tabs: Quest, Status, Settings. Ask before adding a 4th.

## Do not break

- Saved progress lives at `localStorage` key `sh:save:v1` (`schemaVersion: 1`). Any shape change needs a migration in `save.js` `migrate()` that upgrades old saves. Never touch the old app's keys (`asc:hunter:v4`, `asc:hunter:v3`, `sh:hunter:v2`).
- `main` is what's live at system-hunter.vercel.app. Work on `rebuild` (or another branch). Merge to `main` only when Fonzo says "ship it".

## Commands

`npm test` · `npm run build` · `npm run dev`

## Deploy

Vercel builds every push (`vercel.json`). Branch pushes get preview URLs, which are the test links. `main` is production.

---

## AI City (added 2026-10-12)

This copy lives at `C:\Users\luvce\AI-City\limit-break`, one building in Fonzo's AI City. Read `..\CLAUDE.md` (the city map) too. Everything above this section still applies. This section only adds to it.

- **What it is:** Limit Break (formerly System Hunter), an RPG workout web app. Fonzo has also floated a future rebuild under the name "Ascendant". If that comes up, ask him.
- **Status:** ACTIVE (rebuild in progress on the `rebuild` branch)
- **GitHub:** `fonzohdz/system-hunter`. Work happens on `rebuild`. `main` is production.
- **Where it runs and what makes it go live:** Vercel. Every push builds. A branch push gets a preview link. A push or merge to `main` goes LIVE at system-hunter.vercel.app.
- **Run and test:** `npm install`, then `npm test`, `npm run build`, `npm run dev`.
- **One copy:** this is the only working copy on this laptop (the old `C:\Projects\system-hunter` copy is retired). Pull before working.

### MUST NOT BREAK
- Pushing to `main` auto-deploys live on Vercel. Don't push or merge to `main` without Fonzo knowing. The rule above still applies: only when he says "ship it".
- Never break saved progress (`sh:save:v1`). Any change to the save's shape needs a migration.
