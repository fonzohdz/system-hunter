# System Hunter v1: build plan

## 1. Goal

Build a lean RPG workout web app where you open it, it tells you today's workout, you tap once when it's done, and the System levels you up. It gets someone through the door on days they don't feel like training, until training is a habit they don't need the app for.

## 2. Context

- On 2026-10-09 the previous version was wiped. It was a single-file app called RANK UP that got bloated (155-movement library, set/rep/load logging, routines, gold), the owner stopped using it, and it "felt off". The concept was fine. Old code is in git history before commit `69bbcf8`. Do not copy code from it.
- Repo: `C:\Projects\system-hunter`, remote `https://github.com/fonzohdz/system-hunter.git`. Vercel serves `main` at https://system-hunter.vercel.app. `main` currently holds only a "Coming soon.." `index.html`.
- All rebuild work happens on the `rebuild` branch. Vercel gives each push a preview URL. That preview URL is the test link.
- Owner: Fonzo. Non-coder, technical enough. Trains around frequent work travel and long shifts. Reviews everything on his phone.
- Approved visual mockup: https://claude.ai/artifact/ArJmDTPZRmMWNrj64Nwvoj ("A-dark 1, pixel headings").

## 3. Decisions already made: DO NOT RE-LITIGATE

If evidence shows one of these is genuinely a problem, stop and report. Do not change course on your own.

**Product**
- Audience is anyone, strangers included. A stranger must reach their first quest in under a minute without explanation.
- Core loop: open → today's quest is waiting → train → ONE tap "QUEST COMPLETE". No set, rep or weight logging. *Rejected:* full tracking and per-exercise check-offs. Logging was the bloat.
- After completion, one optional tap: Too easy / Just right / Too hard. Skipping it counts as Just right. This is how the app progresses you without logging.
- Workouts come from preset programs that cycle, with two overrides: **No gym today** (bodyweight version) and **Short on time** (~20 min). Overrides keep the same XP and never break the streak. *Later, not v1:* a custom plan generator.
- RPG feel: the System voice (cold, robotic, never guilt-trippy), XP/levels, ranks E→S, stats STR/AGI/VIT, streaks with real pressure. *Rejected:* loot, gold, shop, inventory, titles.
- **Everyone starts at Rank E, Lv 1.** Experience changes only workout difficulty and how-to hints, never level or rank.
- Missed scheduled day → penalty quest. Blown penalty → XP loss + streak reset. 3 blown penalties in 30 days → drop one rank (floor E). Rest days never count. Pause is allowed (rules in §8).
- Cardio quests on rest days are optional: small XP plus AGI, skipping never hurts.
- Only 3 tabs: Quest, Status, Settings. A 4th tab is a bloat warning: ask before adding one.
- No notifications in v1, but System messages must come from one pure function so push can reuse it later.
- No food or diet features.
- No sign-up to start. Progress lives on the device. A "Save progress" account (Phase 2) backs it up to the cloud.
- Name stays "System Hunter".

**Look**
- Dark Final Fantasy menu style (FFXV-ish night palette) on the classic FF window layout. Pixel font (Pixelify Sans) for headings, numbers and buttons only. IBM Plex Sans for exercise names, how-to text and System sentences. *Rejected:* all-pixel (unreadable mid-set), the blue classic windows, the gold serif "Gilded" look, the cyan Solo Leveling look.
- All look values live in theme tokens (CSS custom properties under `[data-theme="night"]`) so a "menu style" picker can be added later. v1 ships one theme. Fonts must be licensed for public use (OFL or similar). No "personal use only" fonts.

**Tech**
- Installable web app (PWA) on Vercel, works offline. *Rejected:* app store app.
- Stack: Vite + Preact + plain JavaScript (ES modules, JSDoc where it helps), Vitest for tests, `vite-plugin-pwa` for offline/installability, fonts self-hosted from `@fontsource/pixelify-sans` and `@fontsource/ibm-plex-sans`. This replaces the old "one file, no build step" rule on purpose, because the game rules need real automated tests.
- Game rules are pure functions in `src/game/`, with no DOM and no `Date.now()` inside. Every function takes `now` or `today` as an argument, so tests can fake the calendar.
- Phase 2 accounts use Supabase (Google + email magic link).

## 4. Protected behavior

- `main` and the live site keep showing "Coming soon.." until Fonzo says "ship it". Never push to `main` or merge into it without that.
- Old browser data: people who used the old app may still have `localStorage` keys `asc:hunter:v4`, `asc:hunter:v3` and `sh:hunter:v2` on this domain. Do not read, migrate or delete them. Everyone starts fresh (Fonzo agreed).
- Git history keeps the old app. Never rewrite history or force-push.

## 5. Data impact

- New `localStorage` key: `sh:save:v1`. It holds one JSON object with `schemaVersion: 1`.
- `src/game/save.js` owns load/save. `load()` returns `null` for missing or corrupt data and never throws. `migrate(obj)` is the single place future schema changes get handled. v1 only checks `schemaVersion === 1`.
- Every write goes through `save()`, which writes atomically: serialize first, then one `setItem`.
- Test-link data is throwaway. At launch everyone, including Fonzo, starts at Rank E.
- Phase 2 adds a Supabase table (§8, Task 12). That's a stop point.

## 6. Files

```
index.html                 app shell, mounts #app
vite.config.js             Vite + Preact + PWA plugin config
vercel.json                {"buildCommand":"npm run build","outputDirectory":"dist","framework":"vite"}
package.json
CLAUDE.md                  new project rules (summary of §3–§5, §10)
public/icon.svg, public/icon-maskable.svg
src/main.jsx               boot: load save → onboarding or app
src/theme.css              tokens under [data-theme="night"] + base styles
src/game/dates.js          local-date helpers (YYYY-MM-DD strings, weekday, add days, week start Monday)
src/game/programs.js       exercise table + program templates + override builders
src/game/quest.js          buildQuest(state, today, override) → quest object
src/game/progress.js       XP, levels, stats, streak, rank rules
src/game/penalty.js        evaluateDays(state, now): misses, penalties, blowouts, pauses
src/game/feedback.js       applyFeedback(state, dayKey, 'easy'|'right'|'hard')
src/game/system.js         systemLine(state, today) → the System's message (pure, reused by push later)
src/game/save.js           load/save/migrate/newState
src/game/*.test.js         Vitest suites, one per module
src/ui/Window.jsx          the FF window frame component
src/ui/Onboarding.jsx
src/ui/QuestTab.jsx, ExerciseCard.jsx, ClearedOverlay.jsx, FeedbackPrompt.jsx, PenaltyBanner.jsx
src/ui/StatusTab.jsx, Calendar.jsx
src/ui/SettingsTab.jsx
src/ui/TabBar.jsx
```

## 7. Desired UX

Phone first (390×844 is the reference). Tablet and desktop show the same single column centered at max 430px wide on the night background. Thumb-reachable bottom tab bar. Touch targets ≥44px. Readable at arm's length in a dim gym.

**First open:** a dark window types out "A Player has been detected." then "Will you accept?" → [ACCEPT]. Three one-tap screens:
1. Where do you usually train? Full gym / Home with some gear (dumbbells) / No equipment
2. How many days a week? 2 / 3 / 4 / 5
3. Experience? New / Some / Experienced

Then "Program assigned: <name>. Training days: <weekdays>." → [BEGIN] → Quest tab at Rank E · Lv 1. Default weekdays: 2 → Tue, Fri. 3 → Mon, Wed, Fri. 4 → Mon, Tue, Thu, Fri. 5 → Mon, Tue, Wed, Fri, Sat. They can be changed in Settings.

**Quest tab:** matches the mockup. Top window: name "Hunter", rank, level, EXP bar, STR/AGI/VIT/STREAK. A System line sits above it in a slim window. Quest window: DAILY QUEST eyebrow, est. minutes, quest name, program + "day X of Y", exercise rows (name, sets × reps), reward. Override buttons. QUEST COMPLETE button. Tapping a row opens an exercise card: sets × reps target, the load cue, a one-line how-to, and a rest timer button (90s for compounds, 60s for the rest; a big countdown you can dismiss). For "New" users the how-to line also shows under each row on the quest.
- Rest day: the quest window says "REST DAY. Recovery is part of the quest." It offers an optional cardio quest with its own complete button.
- Cleared: a short overlay ("QUEST CLEARED" +XP, level-up/rank-up banners if earned, streak +1, under 2.5s, tap to skip), then the feedback prompt, then the home screen in its cleared state: "Quest cleared. Next quest: <day name>, <weekday>."
- Penalty active: the window border and eyebrow turn red (`--danger`), the eyebrow reads "PENALTY QUEST", the countdown shows hours left, and the finisher is listed under the exercises.
- Paused: "Paused until <date>" with a [Resume now] button.

**Status tab:** big rank letter, level, EXP to next, stats, current streak, best streak, next-rank progress ("Perfect weeks: 1 / 2"), a month calendar (cleared, cardio, missed, penalty cleared, penalty blown, paused, rest), and total quests cleared.

**Settings tab:** change program (re-asks the 3 questions; level and rank are kept), training weekdays (7 toggles, 2–5 must be selected, takes effect tomorrow), pause (1–7 days), Save progress (Phase 2; v1 shows "Coming soon"), Reset everything (in-page confirm where you type RESET, never `confirm()`).

## 8. Game rules (exact)

**Dates.** All rules use the device's local date as `YYYY-MM-DD`. A day is "evaluated" once and never re-evaluated (`state.lastEvaluated`). If the clock goes backwards, nothing is re-judged. The day you finish onboarding never counts as a miss.

**XP.** Training quest 100 · cardio quest 40 · penalty quest cleared +50 bonus (on top of the 100) · perfect week +50 · streak milestones 7 → +100, 30 → +300, 100 → +1000 (each paid once per streak run).
**Levels.** XP needed to go from level L to L+1 = `100 + 25 × (L − 1)`. Level never decreases.
**Streak.** The count of consecutive scheduled training days cleared. Rest days and paused days neither add nor break it. Cardio doesn't add to it.
**Perfect week.** A Monday–Sunday week where every scheduled training day that wasn't paused was cleared (penalty-cleared days count as cleared), with at least one scheduled day. The join week only counts days after joining.
**Ranks** (all conditions required):
- D: 2 perfect weeks in a row
- C: 6 perfect weeks total and Lv 10
- B: 16 perfect weeks total and Lv 20
- A: 30 perfect weeks total and Lv 30
- S: 45 perfect weeks total and Lv 40

**Stats.** All start at 5. STR +1 per 3 training quests cleared. AGI +1 per 2 cardio quests. VIT +1 per perfect week.
**Miss.** A scheduled training day that ends (local midnight) uncleared and not paused.
**Penalty.** A miss issues a penalty quest at that midnight with a 48h deadline. The penalty quest = the next training quest + a finisher (New: 2 rounds; Some/Experienced: 3 rounds of 10 burpees, 20 mountain climbers, 30s plank). New users get 6 burpees instead of 10. Clearing it before the deadline marks the missed day "penalty cleared", keeps the streak, and pays +50.
**Blown penalty.** The deadline passes uncleared, or a second miss happens while a penalty is active. That costs: XP within the current level × 0.5 (rounded down, never below the level floor), streak → 0, and a log entry. A second miss also issues a new penalty. If there are 3 blown penalties within any rolling 30 days, rank drops one step (floor E), the perfect-week count is set to the new rank's threshold, and the blowout counter clears.
**Pause.** 1–7 days, starting today. At most 2 pauses started in any rolling 30 days. Paused days are never misses. If a penalty is active when you pause, its deadline gets pushed back by the paused days. Resume early anytime.
**Feedback.** Each program day key (e.g. `upperA`) stores `adj` in −2..+1, starting at 0 (New starts at −1).
- Reps shown: −2 → bottom of range with 1 fewer set (min 2). −1 → bottom of range. 0 → middle of range, rounded down. +1 → top of range.
- Too easy at +1 → `adj` resets to 0, and on loaded exercises the next quest shows "Go up a little in weight." Bodyweight exercises get +1 set instead (max 5).
- Too easy otherwise → +1. Too hard → −1 (floor −2). Just right/skip → no change.

**Load cue (loaded exercises).** "Pick a weight where the last rep is hard but clean, about 2 reps left in the tank."
**Overrides.** No gym today maps each exercise by movement pattern to its bodyweight fallback (table below), drops duplicates and anything mapped to `null`, and caps the list at 5. Short on time keeps the first 3 exercises with sets −1 (min 2), labelled ~20 min. Both together = the bodyweight version, then shortened. XP is unchanged.

## 9. Programs

Exercise entry: `{id, name, pattern, loaded, compound, howTo}`. Rep ranges live on the program slot.

Bodyweight fallback by pattern: squat → Bodyweight Squat · hinge → Single-Leg RDL · lunge → Reverse Lunge · hpush → Push-up · vpush → Pike Push-up · hpull → Prone Y-T-W Raise · vpull → Superman · core → Plank · triceps → Chair Dip · biceps → null · lateral → null · calves → Single-Leg Calf Raise · legiso → Glute Bridge.

Program choice: Full gym with 2–3 days → **Full Body (Gym)**, 4 → **Upper/Lower**, 5 → **Push/Pull/Legs+**. Home with gear → **Full Body (Dumbbells)**. No equipment → **Full Body (Bodyweight)**. Days cycle in order across training days, never by weekday.

- **Full Body (Gym)**: A = Back Squat 3×6–10, Bench Press 3×6–10, Lat Pulldown 3×8–12, Romanian Deadlift 3×8–12, Plank 3×30–45s · B = Trap Bar Deadlift 3×5–8, Overhead Press 3×6–10, Seated Cable Row 3×8–12, Walking Lunge 3×10–12/leg, Hanging Knee Raise 3×10–15
- **Upper/Lower**: Upper A = Bench Press 4×6–10, Barbell Row 4×6–10, Overhead Press 3×8–12, Lat Pulldown 3×8–12, Dumbbell Curl 2×10–15, Tricep Pushdown 2×10–15 · Lower A = Back Squat 4×6–10, Romanian Deadlift 3×8–12, Leg Press 3×10–15, Leg Curl 3×10–15, Standing Calf Raise 3×12–15 · Upper B = Incline DB Press 4×8–12, Assisted Pull-up 4×6–10, Seated DB Shoulder Press 3×8–12, Seated Cable Row 3×8–12, Lateral Raise 3×12–15, Hammer Curl 2×10–15 · Lower B = Trap Bar Deadlift 3×5–8, Bulgarian Split Squat 3×8–12/leg, Hip Thrust 3×8–12, Leg Extension 3×10–15, Hanging Knee Raise 3×10–15
- **Push/Pull/Legs+**: Push = Bench Press 4×6–10, Overhead Press 3×8–12, Incline DB Press 3×8–12, Lateral Raise 3×12–15, Tricep Pushdown 3×10–15 · Pull = Barbell Row 4×6–10, Lat Pulldown 3×8–12, Seated Cable Row 3×10–12, Face Pull 3×12–15, Dumbbell Curl 3×10–15 · Legs = Lower A · Upper = Upper A · Lower = Lower B
- **Full Body (Dumbbells)**: A = Goblet Squat 3×8–12, DB Bench or Floor Press 3×8–12, One-Arm DB Row 3×8–12/side, DB Romanian Deadlift 3×8–12, Plank 3×30–45s · B = DB Split Squat 3×8–12/leg, DB Shoulder Press 3×8–12, Push-up 3×8–15, Glute Bridge 3×12–20, Dumbbell Curl 2×10–15
- **Full Body (Bodyweight)**: A = Bodyweight Squat 3×15–20, Push-up 3×8–15, Single-Leg RDL 3×8–12/leg, Superman 3×10–15, Plank 3×30–45s · B = Reverse Lunge 3×10–12/leg, Pike Push-up 3×6–10, Glute Bridge 3×12–20, Chair Dip 3×8–12, Plank Shoulder Tap 3×16–24
- **Cardio quest** (rest days): "Walk 20–30 min" for New, otherwise "Walk, jog or bike 20–30 min, easy pace".

Patterns: Back Squat/Goblet Squat/Leg Press/Bodyweight Squat = squat. RDL/DB RDL/Trap Bar Deadlift/Single-Leg RDL/Hip Thrust/Glute Bridge = hinge. Walking Lunge/Bulgarian/DB Split Squat/Reverse Lunge = lunge. Bench/Incline DB/DB Floor Press/Push-up = hpush. Overhead Press/Seated DB Shoulder/DB Shoulder Press/Pike Push-up = vpush. Barbell Row/Seated Cable Row/One-Arm DB Row/Face Pull/Prone Y-T-W = hpull. Lat Pulldown/Assisted Pull-up/Superman = vpull. Plank/Hanging Knee Raise/Plank Shoulder Tap = core. Tricep Pushdown/Chair Dip = triceps. Curls = biceps. Lateral Raise = lateral. Calf raises = calves. Leg Curl/Leg Extension = legiso. Write a one-sentence how-to for each of the ~45 exercises, form cue first. Bodyweight exercises have `loaded: false`.

## 10. Tasks

Each task ends green (`npm test` passes, `npm run build` succeeds) and gets one commit on `rebuild`. Push after Tasks 1, 9 and 11 so a preview build exists.

1. **Scaffold.** Vite + Preact + Vitest + PWA plugin + fontsource packages, `vercel.json`, `theme.css` tokens from the mockup (`--bg #050608`, `--win-top #1b1e26`, `--win-bot #0c0d11`, `--line rgba(238,240,244,.7)`, `--fg #eef0f4`, `--muted #9aa1ad`, `--ice #a9c8ff`, `--gold #e2c66d`, `--danger #e0605a`), an empty app shell that renders one Window. New `CLAUDE.md`. Test: the build passes and the preview URL loads on a phone. **STOP if the preview needs a Vercel login on the phone. Ask Fonzo before changing preview protection.**
2. **dates.js + tests.** Cover month/year rollovers, DST weeks, and Monday week start.
3. **programs.js + quest.js + tests.** Every program/day resolves; the cycle advances only on training-quest clears; both overrides and the combo work; the 5-exercise cap and dedupe hold.
4. **progress.js + tests.** XP table (Lv 1→2 = 100, 2→3 = 125), level-up across multiple levels in one award, streak, milestones paid once, perfect week incl. join week, every rank threshold, stats.
5. **penalty.js + tests.** A faked calendar walks weeks: miss → penalty, clear in 47h → saved, 49h → blown, second miss while active, 3 blowouts in 30 days → rank drop with floor E, pauses (limits, deadline push, early resume), clock going backwards, join day, an app not opened for 10 days (every day judged in order).
6. **feedback.js + tests.** The full adj ladder, the weight cue, bodyweight +1 set capped at 5, New starts at −1.
7. **system.js + save.js + tests.** One line for each state (new quest, rest, penalty with hours left, paused, cleared, blown, rank up). Load/save round trip, corrupt JSON → null, unknown schema → null.
8. **Onboarding UI.**
9. **Quest tab UI** (quest, exercise card, rest timer, overrides, cleared overlay, feedback prompt, penalty and pause states). Push to preview.
10. **Status tab + calendar.**
11. **Settings tab** (program change keeps level/rank, weekday edits apply tomorrow, pause, reset with typed confirm). PWA manifest and icons, offline check. Push to preview → **Fonzo gym-tests for a few days.**
12. **Phase 2, accounts. STOP before starting: Fonzo has to create/connect the Supabase project.** Table `saves(user_id uuid primary key references auth.users, state jsonb not null, updated_at timestamptz not null default now())` with RLS "users read/write own row only". Sign-in: Google + email magic link. First sign-in: cloud empty → upload this device. Both exist → an in-page choice: "Keep this phone's progress (Rank X, Lv Y)" or "Use saved progress (Rank X, Lv Y)". After that, the newest `updated_at` wins, and it syncs on open, on clear, and on settings change. Offline still works and syncs later.
13. **Ship.** **STOP: only on Fonzo's "ship it".** Merge `rebuild` → `main`, confirm the live site, and confirm the coming-soon page is gone.

## 11. Testing requirements

- `npm test` before and after every task. Game-rule coverage as listed in Tasks 2–7.
- After each UI task: screenshots at 390×844, 430×932, 768×1024 and 1280×800. Check text fits (longest names: "Bulgarian Split Squat", "DB Bench or Floor Press", "Plank Shoulder Tap"), no horizontal scroll, and 44px targets.
- Full journey on the preview: fresh install → onboarding → clear quest → feedback → reload (state kept) → airplane mode (still opens and clears) → change program (level kept) → pause → resume → reset.
- Fonzo's real-phone test on the preview before shipping: add to home screen, use it at the gym for a few days, report anything off.

## 12. Git safety

Work only on `rebuild`. No force-push, no history rewrite, no branch deletion. Nothing reaches `main` before "ship it". Commit at the end of every task.

## 13. Acceptance criteria

- [ ] A stranger reaches their first quest in under a minute with no sign-up and no explanation.
- [ ] Today's quest is on screen when the app opens. One tap clears it. The feedback prompt is one tap or skippable.
- [ ] No gym / short on time each produce a sensible workout in under a second, with no streak or XP loss.
- [ ] Everyone starts Rank E, Lv 1.
- [ ] Missing a day triggers a penalty quest. Every rule in §8 behaves as written, proven by tests.
- [ ] Rest days show the optional cardio quest. Skipping it changes nothing.
- [ ] Status shows rank, level, stats, streak, next-rank progress and the calendar.
- [ ] Works offline after first load and installs to the home screen on iPhone and Android.
- [ ] Looks like the approved mockup, readable at arm's length, no layout breaks at the four sizes.
- [ ] Phase 2: progress survives switching phones via account.
- [ ] Fonzo has used it at the gym and said "ship it".

## 14. Report back (after each push)

In plain English: what's new on the test link, what was tested and how, what wasn't, anything that looks off, and anything noticed but left alone because it was out of scope.
