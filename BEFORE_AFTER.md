# Limit Break: before and after (audit, 2026-10-13)

Every change from the overnight audit (round 1) and the "fix it all" pass (round 2), in plain English. All of it is on branch `repair/audit-2026-10-13`. Nothing is pushed or live yet.

Screenshots (phone width, 390×844) are on the laptop, not in the repo:
`C:\Users\luvce\AppData\Local\Temp\claude\C--Users-luvce\1d480059-253c-4c46-b1b6-6e19149d4c0f\scratchpad\audit\shots\lb-*.png`

**Tests:** 75 before the audit, 87 after round 1, 112 after round 2. All pass, and the app builds.

---

## Round 1 (overnight audit)

### 1. Two copies of the app open could erase a cleared quest
- **Before:** With the app open twice (two tabs, or the installed app plus a browser tab on Android), the older copy could save over the newer one. A cleared quest got wiped, and that day was judged as *missed*. That meant a false penalty quest, and possibly lost XP and streak.
- **After:** Each open copy picks up the other's progress (or its reset) right away.
- **How verified:** A test reproduces the false miss and shows the fix prevents it. In real Chrome with two tabs, clearing the quest in one made the other switch to "QUEST CLEARED" immediately.
- **Commit:** `50edcde`

### 2. Days missed while the app was closed were handled silently
- **Before:** If a penalty was blown while the app was closed, opening it just took the XP. There was no System message, and the result wasn't saved until the next tap.
- **After:** The System says "The Player has failed to comply. Penalty applied." (rank changes get announced the same way), and the result is saved right away.
- **How verified:** Tests, plus Chrome before/after screenshots.
- **Screenshots:** `lb-missed-while-closed-before.png` / `lb-missed-while-closed-after.png`
- **Commit:** `15fd4f6`

### 3. The rest timer lost time when the phone locked
- **Before:** Phones pause timers when the screen locks, so a 90-second rest could still show most of its time left after you'd already rested.
- **After:** The timer counts against the clock, so it's correct when you unlock. It looks and sounds the same.
- **How verified:** Tests. In Chrome, with the page frozen for 5 seconds, the old timer stayed stuck at 1:28 and the new one correctly showed 1:24.
- **Commit:** `13fbecc`

### 4. A phone that refuses sound could crash a screen
- **Before:** If the browser refused audio, the quest-cleared screen could break.
- **After:** The app just stays silent.
- **How verified:** A test that failed before the fix and passes after.
- **Commit:** `37220f4`

### 5. Bad pause or weekday values
- **Before:** A non-number pause length crashed the pause rule, and odd weekday values could quietly unschedule days. The app's own screens never sent these, though.
- **After:** Bad values are ignored safely.
- **How verified:** Tests that failed before the fix.
- **Commit:** `bd75fca`

### 6. Secret files safety net
- **Before:** `.gitignore` didn't cover `.env` files.
- **After:** It does. This matters for Phase 2, when Supabase keys arrive.
- **How verified:** `git check-ignore` confirms the files are ignored.
- **Commit:** `42bb340`

---

## Round 2 ("fix it all")

### 7. Damaged save → recovery screen instead of a blank app
- **Before:** If the saved progress got damaged, the app opened to a completely blank white screen. There was no way to reach Settings or Reset; the only fix was clearing the browser's site data.
- **After:** A System-styled screen says **"The System couldn't read your save."** and offers two buttons:
  - **START OVER** first copies the damaged data to a backup (`sh:save:v1.corrupt-<time>`), then begins fresh setup. If the backup can't be made, it deletes nothing and says so.
  - **Try again** reloads the app.
- **How verified:**
  - Tests cover damaged, unreadable and unknown-version saves, the backup, and the "backup failed, keep everything" case.
  - In Chrome, START OVER left the backup in place and went to setup.
  - 360,000 randomly simulated real saves were checked, and none was wrongly flagged as damaged.
- **Screenshots:** `lb-damaged-save-before.png` (blank) / `lb-damaged-save-after.png`
- **Commit:** `96f976a`
- **How to flip it:** To skip the screen and quietly start fresh instead, `src/main.jsx` could call `game.recover()` automatically rather than showing `<Recovery>`. The backup would still be made.
- **Note:** Settings isn't offered on this screen. Every setting except Reset needs a working save, and START OVER *is* the reset.

### 8. Warning when progress can't be saved
- **Before:** If the phone couldn't save (storage full, or some private-browsing modes), nothing was said. You could train for days and lose it all on reload.
- **After:** A red System window appears at the top of every tab: **"WARNING. Progress can't be saved on this device. It will be lost when the app closes. Free up storage or leave private browsing."**
  - "Got it" hides it.
  - It won't nag again until saving has worked at least once and then fails again.
- **How verified:** Tests for the once-per-failure-streak rule. In Chrome, with saving forced to fail, the warning showed, "Got it" hid it, and a second failed save didn't bring it back.
- **Screenshots:** `lb-save-warning-before.png` (nothing shown, XP not saved) / `lb-save-warning-after.png`
- **Commit:** `d8114d3`
- **How to flip it:** To warn on every failed save instead of once per streak, change `saveWarning()` in `src/ui/useGame.js` to always return `show: true` when `ok` is false.

### 9. Pop-ups: Escape key and focus
- **Before:** Escape did nothing, Tab could wander onto the page behind the pop-up, and closing a pop-up lost your place.
- **After:**
  - Escape closes the exercise card, skips the feedback question, and skips or continues the "quest cleared" sequence (the same as tapping).
  - Tab stays inside the pop-up.
  - Closing it puts you back on the exercise you came from.
- **How verified:** Tests for the Tab-wrapping rule. Chrome confirmed Escape closes, Tab stays inside, and focus returns to the exercise row.
- **Visual change:** none.
- **Commit:** `8d4ab23`

### 10. Calendar days read out their status
- **Before:** Screen readers heard only bare numbers ("7"). The status (cleared, missed…) was shown by color alone.
- **After:** Each day reads like "Wednesday, October 7: Missed", using the same words as the legend. The month reads as "October 2026".
- **How verified:** Tests, plus Chrome's accessibility tree.
- **Visual change:** none (checked by screenshot).
- **Commit:** `075834b`

### 11. "Quest waiting" dot is announced everywhere
- **Before:** The red dot's label worked in Chrome but is ignored by many screen readers, including iPhone VoiceOver.
- **After:** The Quest tab reads "Quest, quest waiting" on every screen reader.
- **How verified:** A test of the spoken text, plus Chrome's accessibility tree.
- **Visual change:** none.
- **Commit:** `8340778`

### 12. Weekday buttons reach full touch size
- **Before:** The 7 training-day buttons were 43px wide on a 390px phone (the target is 44).
- **After:** 44×44 on a 390px phone (50 on bigger phones). The gap shrank by 1px and the row widened by 4px; you can't really see the difference. Narrow 360px phones get 40px, because seven 44px buttons don't fit there.
- **How verified:** Measured in Chrome. It's a style-only change, so there's no unit test.
- **Screenshots:** `lb-weekday-buttons-before.png` / `lb-weekday-buttons-after.png`
- **Commit:** `c044344`

### 13. Changing training days can switch your program (next Monday)
- **Before:** On a gym plan, going from 4 to 5 days in Settings kept "Upper/Lower" forever, even though setup would give a 5-day player "Push/Pull/Legs+".
- **After:**
  - When the new day count calls for a different program, it's scheduled for **next Monday**, never mid-week.
  - Settings says so right away ("5 days calls for Push/Pull/Legs+. It starts next Monday." and a gold "Switching to … next Monday" note).
  - On Monday the System announces **"New program assigned: Push/Pull/Legs+. Rotation starts at day 1."**
  - XP, level, rank, streak, stats and history are all kept.
  - Going back to a day count that fits, or picking a program yourself in "Change program", cancels the switch.
  - Home and no-equipment plans never switch based on days.
- **How verified:** 7 tests (no switch mid-week, switch on Monday with history kept, cancel, home plans, older saves). Random-player fuzzing rerun clean. Chrome screenshots of both messages.
- **Screenshots:** `lb-program-switch-before.png` / `lb-program-switch-after.png`, plus `lb-program-switch-monday-after.png` (the switch day)
- **Commit:** `6c718c1`
- **Save data:** adds one field, `pendingProgram`. Older saves get it filled in automatically, still the same save version, so nobody's progress breaks.
- **How to flip it:**
  - To switch **immediately** instead of next Monday: in `src/game/settings.js` `programSwitchFor()`, use `from: today` instead of `addDays(weekStart(today), 7)`.
  - To turn the feature off: make `programSwitchFor()` return `null`.

### 14. Test tool patch update
- **Before:** vitest 5.0.3.
- **After:** vitest 5.0.4. This is a test tool only; nothing in the app changes.
- **How verified:** 112/112 tests pass, the build passes, and `npm audit` finds 0 problems.
- **Commit:** `190bab3`

### 15. Build plan file list brought up to date
- **Before:** The plan listed files that no longer exist (`ExerciseCard.jsx`, `Calendar.jsx`…) and missed ones that do.
- **After:** The list matches the code. The save notes mention the damaged-save backup and the new `pendingProgram` field. The binding "Decisions" section is unchanged.
- **Commit:** `e88c589`

---

## Nothing reverted

Every change passed its tests, the build and the Chrome check. Nothing had to be rolled back.
