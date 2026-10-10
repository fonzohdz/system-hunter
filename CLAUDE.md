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
