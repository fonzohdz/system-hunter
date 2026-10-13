# Overnight audit report: Limit Break (2026-10-13)

Branch: `repair/audit-2026-10-13`, cut from `rebuild` at `a0bd04c`. Nothing pushed, merged or deployed. `main` was not touched.

## Bottom line

The rebuild is a complete, working local-first app, not a "Coming soon" page. (Only `main`, the live site, is still the Coming soon page.) The game rules are solid: 400+ randomized simulated players found no broken invariants. The real problems were in how the app saves and reloads progress. I fixed 6 issues (1 High, 3 Medium, 2 Low) and added a preventive `.gitignore` fix. Tests went from 75 to 87, all passing, and the build passes. Four items need Fonzo to decide (listed at the end).

## Actual scope found

- **`main` (live at system-hunter.vercel.app):** a single "Coming soon.." `index.html` (commit `69bbcf8`). No vercel.json on main.
- **`rebuild`:** the full v1 app from `docs/plans/2026-10-09-system-hunter-v1.md`, Tasks 1–11 built. It's a Vite + Preact PWA with onboarding (3 questions), the Quest tab (daily quest, exercise card + rest timer, No gym / Short on time overrides, penalty and pause states, cleared overlay, feedback prompt), the Status tab (rank, level, stats, calendar), and the Settings tab (change program, training days, pause, sound, reset with typed confirm). Game rules are pure functions in `src/game/` with Vitest tests. Sound effects are synthesized with Web Audio.
- **No backend.** Progress lives only in the browser (`localStorage` key `sh:save:v1`). No Supabase code, no API calls, no env vars, no secrets. Phase 2 accounts (Task 12) and shipping (Task 13) haven't started.

## Baseline vs after

| Check | Before | After |
|---|---|---|
| `npm test` | 75 / 75 pass (6 files) | 87 / 87 pass (9 files) |
| `npm run build` | passes | passes (precache 13 entries, ~158 KiB) |
| `npm audit` | 0 vulnerabilities | 0 vulnerabilities |
| Lint / typecheck | none configured | none configured (documented, not added) |
| Headless Chrome, 4 sizes (390×844, 430×932, 768×1024, 1280×800) × onboarding + 3 tabs | no horizontal scroll, no clipped names, no console errors | same |

## Findings, ranked

### High

**H1. A second open copy of the app could erase progress and issue a false penalty. FIXED (`50edcde`).**
Each tab or window (for example the installed app plus a Chrome tab on Android, which share storage) kept its own in-memory copy of the save and wrote it back blindly. If copy A cleared today's quest, the stale copy B would save over it on its next tap or its midnight check, and judge the cleared day as *missed*. That meant a penalty quest, and if not cleared, XP loss and a streak reset.
*Reproduced:* a test in `src/ui/useGame.test.js` shows the stale copy marking the cleared day `missed`. *Fix:* `useGame` listens for the browser's `storage` event and adopts the other copy's save, or its reset. *Verified:* the test shows the clear surviving midnight, and in real headless Chrome with two tabs, tab 2 switched to "QUEST CLEARED" the moment tab 1 cleared.

### Medium

**M1. On open, days missed while the app was closed were judged silently and not saved. FIXED (`15fd4f6`).**
`useGame` judged the days since the last visit but threw away the events and didn't save the result until the next tap. So a penalty blown while the app was closed took XP with no System message ("The Player has failed to comply…"), and rank-up or rank-down news from that judging was never shown. *Fix:* new `boot()` keeps the events for the System line and saves the judged state once. *Verified:* tests, plus in Chrome. Before, the System line showed the generic penalty line and the stored `lastEvaluated` stayed `2026-10-05`. After, it shows "The Player has failed to comply. Penalty applied." and `lastEvaluated` is saved as `2026-10-12`.

**M2. The rest timer lost time when the phone locked mid-rest. FIXED (`13fbecc`).**
The countdown chained 1-second timeouts, and phones pause those when locked or in the background, which is exactly what happens between sets. *Fix:* it now counts against a fixed end time. The look, sounds and buttons are unchanged. *Verified:* with the page frozen for 5 s in Chrome, the old timer stayed at 1:28 and the new one correctly showed 1:24. Stop, Again and REST COMPLETE were all checked. During that check I also caught and fixed a race in my own first version: a tick firing right after Stop could restart the display.

**M3. A malformed save gives a permanent blank screen. NOT FIXED: needs a decision (A1).**
`migrate()` only checks `schemaVersion === 1`. If the save is valid JSON but missing fields (a future bug, a bad migration, or a manual edit), the app crashes at startup (`TypeError … reading 'split'`, confirmed in Chrome). Settings → Reset can't be reached, so the only way out is clearing site data in the browser. The save itself is left intact, so it can be recovered later.

**M4. If saving fails, nobody is told. NOT FIXED: needs a decision (A2).**
`save()` returns `false` on a storage error (full storage, or storage blocked in some private modes), and `useGame` ignores it. The player keeps playing, and everything is lost on reload. This is rare on modern phones, but it would be invisible when it happens.

**M5. A device that refuses audio could crash a screen. FIXED (`37220f4`).**
`play()` guarded the sound but not creating the audio context, so a refusal threw out of `play()`, including from inside the quest-cleared overlay. The code's own comment says this must never break the app. *Fix:* setup now runs inside the existing try, and a refused `resume()` no longer leaves an unhandled promise rejection. A test failed before the fix and passes after.

### Low

**L1. `pause()` crashed on a non-number length, and `setTrainingDays()` accepted fractions or strings (silently unscheduling those days). FIXED (`bd75fca`).** The UI never sends these today. Both now reject bad input, with tests that fail without the fix.

**L2. `.gitignore` didn't cover `.env` files. FIXED (`42bb340`).** Preventive, ahead of Phase 2's Supabase keys.

**L3. Accessibility gaps. Documented, not changed.**
- Dialogs (exercise card, feedback) have no Escape to close, no focus trap, and don't return focus when closed.
- The calendar uses `role="grid"` without rows or cells, and each day's status (cleared, missed…) is shown only by color. Screen readers just get the date.
- The red "quest waiting" dot on the Quest tab has an `aria-label` on a plain `span`, which most screen readers ignore.
- The weekday toggles in Settings are 43 px wide at 390 px screen width (the target is 44). That's 1 px under, so negligible.
- Done well: text is readable, focus outlines are visible, the System text is screen-reader friendly, reduced-motion is respected, and touch targets are otherwise ≥ 44 px.

**L4. Smaller notes. Documented only.**
- Changing training days from Settings updates "days per week" but not the program (for example, gym 4 → 5 days stays on Upper/Lower rather than Push/Pull/Legs). Only "Change program" re-assigns. This may be intended.
- The plan's §6 file list names `ExerciseCard.jsx`, `ClearedOverlay.jsx`, `Calendar.jsx`, etc. These were merged into `Overlays.jsx` and `StatusTab.jsx`. The docs are slightly out of date; the code is fine.
- No ESLint or type checking is configured. Tests and build are the only gates.
- `vitest` 5.0.3 → 5.0.4 is available (patch, not a security fix). Not applied, since there was no reason to change dependencies.
- Sound is on by default (`DEFAULTS.sound: true`). The old app had once switched it off by default. Fine if intended.

### Checked and clean

- **Secrets:** a scan of all 102 commits across all branches for key, token, password and JWT patterns found nothing. The only hits were the word "token" in CSS docs and `js-tokens` in the lockfile. No `.env` files exist, now or in history.
- **Client-exposed secrets, RLS, backend:** none exist yet (no backend). Row-level security becomes relevant in Phase 2. The plan already specifies "users read/write own row only".
- **Game rules:** random fuzzing (3 seeds × 400 players × 300 steps, including the clock jumping backwards for the travel case) over complete, cardio, pause, resume, change program, change days and feedback. It checked that judging days twice changes nothing, level never drops, XP never goes negative, streak ≤ best streak, rank and log values stay valid, every open penalty points at a `missed` day, and the state stays JSON-safe. No failures.
- **Broken imports, dead code:** none. A few exports are only used in their own file or by tests, which is intentional.
- **Deployment config:** `vercel.json` (framework vite, `npm run build`, `dist`) is correct for this app. The PWA manifest and service worker build correctly. No custom security headers (Vercel defaults); worth adding a basic CSP when Phase 2 adds auth.
- **Service worker note:** a browser that already visited keeps serving the old bundle until the new worker takes over (I hit this in testing). That's normal PWA behavior with `autoUpdate`. After a deploy, testers may need to reload once or twice.

## Commits on `repair/audit-2026-10-13`

| Commit | What |
|---|---|
| `ef00c9d` | docs: add AI City section to CLAUDE.md (the pre-existing uncommitted change, verified as only that section) |
| `15fd4f6` | fix: keep and save the results of judging days on app open (M1) |
| `50edcde` | fix: stop a second open copy of the app from overwriting progress (H1) |
| `13fbecc` | fix: keep the rest timer accurate when the phone locks mid-rest (M2) |
| `37220f4` | fix: a device that refuses audio can no longer crash a screen (M5) |
| `bd75fca` | fix: reject malformed pause lengths and weekday values (L1) |
| `42bb340` | chore: ignore .env files before Phase 2 adds Supabase keys (L2) |
| (this file) | docs: overnight audit report |

Each commit stands alone and can be reverted on its own.

## Files modified

- `CLAUDE.md` (pre-existing AI City section)
- `src/ui/useGame.js`, plus new test `src/ui/useGame.test.js`
- `src/ui/Overlays.jsx`, plus new test `src/ui/Overlays.test.js`
- `src/ui/sfx.js`, plus new test `src/ui/sfx.test.js`
- `src/game/penalty.js`, `src/game/penalty.test.js`
- `src/game/settings.js`, `src/game/settings.test.js`
- `.gitignore`
- `OVERNIGHT_AUDIT_REPORT.md` (this file)

**Dependencies changed:** none. **Save format (`sh:save:v1`):** unchanged, so no migration is needed. Old app keys were not touched.

## Remaining risks

- M3 and M4 above (a blank screen on a malformed save, and silent save failure).
- All progress is on one device until Phase 2. Clearing browser data or losing the phone loses everything. This is known and already planned.
- iPhone: the home-screen app and Safari have *separate* storage, so progress made in one doesn't show in the other. That's an iOS limitation, not a bug. Worth telling testers to use only the home-screen icon.
- Day boundaries follow the phone's time zone (by design). Flying east can make a training day end early. The fuzzing confirmed nothing breaks or gets judged twice.
- None of the fixes have been tried on a real phone yet. They were checked in headless Chrome only.

## Needs Fonzo's decision

- **A1 (M3): what should a broken save do?** Options: (a) show a "Save data couldn't be read" screen with a Reset button and keep a backup copy under another key (recommended), (b) quietly start fresh, or (c) try to repair it by filling in defaults.
- **A2 (M4): tell the player when progress can't be saved?** For example, a red System line: "Progress can't be saved on this device." This would be a small new UI message.
- **A3: merge this branch into `rebuild`?** Nothing was pushed. To get a preview link, merge `repair/audit-2026-10-13` into `rebuild` and push `rebuild`. That only makes a preview, not the live site.
- **A4 (L4): should changing training days in Settings also switch the program** when the day count crosses a program boundary (like gym 4 → 5 days)?
