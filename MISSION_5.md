# Mission 5: muscle maps, accessibility, and milestones

Read `CLAUDE.md` and the current `index.html` first. This mission runs **after**
the library expansion (Mission 4) — authoring muscle data for 73 movements and
then again for 77 more would be doing the work twice.

Four parts. Part 2 is the one people skip and shouldn't.

---

## Part 1 — Muscle maps

A beginner opening "One-arm dumbbell row · 3 × 10" has no idea what that's for.
Showing them is the difference between following instructions and understanding
training.

### 1a. Tag every movement

Add `mus` to every exercise in `EX`: primary and secondary muscle groups.

```
mus: { p:['lats','midback'], s:['biceps','rear-delts','core'] }
```

Use a fixed vocabulary — roughly 16 groups, no more, or the diagram turns to
confetti:
`chest, front-delts, side-delts, rear-delts, biceps, triceps, forearms, lats,
midback, traps, lower-back, abs, obliques, glutes, quads, hamstrings, calves`

Be honest rather than generous. Almost everything hits the core a little; only
tag it where it genuinely matters. Two or three primaries maximum. A movement
that claims to work nine muscle groups tells the user nothing.

### 1b. The diagram

A front and back body silhouette as inline SVG, each muscle group its own path,
sitting side by side. Primary muscles fill bright in the palette accent,
secondary at roughly 40% opacity, untouched muscles in the dim line colour.

Where it appears:
- **Movement detail sheet** — next to or under the animated figure. This is the
  main one.
- **Session brief** in guided mode (Mission 3) — small, alongside the figure.
- **Optional:** a cumulative view in Records showing what you've actually trained
  over the last 7 days, which quietly reveals the muscle groups you keep
  avoiding. Nice, not required — build it if the rest goes smoothly.

Two body silhouettes, ~17 paths each. Draw them carefully. This is a
diagram-quality asset, not a stick figure — it needs to read as a human body at
120px tall. Feature-detect nothing; it's static SVG.

### 1c. Browse by muscle

Add muscle-group filtering to the library, alongside the existing rank and
category filters. "Show me everything that hits lats" is how most people
actually think about training, and the category filter (push/pull/legs) is too
coarse for it.

---

## Part 2 — Accessibility, the real kind

The app has some of this by accident and none of it on purpose. Do it properly;
it's not optional decoration.

- **Semantic markup.** The quest list is a list. Buttons are `<button>`. Headings
  are in order. Several places currently use divs with click handlers — fix
  those.
- **Screen reader labels.** Every icon-only control needs an accessible name. The
  animated figures need `aria-hidden` plus a real text description of the
  movement nearby. Progress bars need `role="progressbar"` with values. The
  guided session needs an `aria-live` region announcing set changes and rest
  countdowns — someone should be able to run a whole session by ear.
- **Keyboard.** Full navigation without touch: tab order sane, visible focus
  rings that aren't the browser default, Escape closes sheets and modals, Enter
  and Space activate. Focus must move into a sheet when it opens and return to
  the trigger when it closes.
- **Contrast.** Audit every text colour against its background for WCAG AA
  (4.5:1 body, 3:1 large text). `--ash` on `--void` is the likely failure. Fix by
  lightening the token, not by removing the muted style.
- **Reduced motion.** Already partly handled. Verify properly: the aura canvas
  should stop animating, figures hold a static working pose, the level-up
  becomes a simple fade rather than a particle burst. Test with the OS setting
  actually on.
- **Text scaling.** Check at 200% browser zoom and with large system font. Fixed
  pixel heights on the tab bar and cards will break first.
- **Colour is never the only signal.** The aura tiers, the done/undone state,
  the heat grid — all currently lean on colour alone. Add a shape, icon, or text
  cue to each.

## Part 2b — Physical limitations

Different from the above and equally important for "anyone can use this".

Add an optional onboarding question, skippable and changeable in the vault:
*anything you need to work around?* — knees, shoulders, lower back, wrists,
limited mobility, seated only.

- Selections filter the library and bias quest generation away from movements
  that load that area.
- Add a `strain` field to exercises listing which areas they load
  (`['knees','lower-back']`). Author it for all movements — this is another data
  pass like the muscle tags, do them together.
- **Seated only** is the big one: it should still produce a full five-movement
  quest. Verify by script that it can, at every rank. If the library can't fill
  it, say so — that means we need seated movements added, not a broken quest.
- Frame it as configuration, never as a limitation. No pity copy. The app should
  behave as though everyone customises this.

---

## Part 3 — Milestones

Gold is the only reward right now, and buying a title is a weak payoff for a
hundred-day streak.

Add achievements — one-time milestones that unlock permanently:

- **Consistency:** 7 / 30 / 100 day streaks. First quest cleared. 50 / 250 / 1000
  movements logged.
- **Strength:** first full push-up. First chin-up. Every PR doubling from the
  first recorded value.
- **Exploration:** logged a movement in every category. Cleared a quest in travel
  mode. Outgrew a movement (ties to Mission 3's progression chains).
- **Rank:** reaching each of D, C, B, A.

Each awards XP and gold, and some unlock a title in the vault rather than
selling it. A title you *earned* is worth more than one you bought.

Show them in Records with locked ones visible but greyed — visible locked goals
drive behaviour, hidden ones don't. Unlocking one gets a modest moment: a toast
and a badge, not the full level-up sequence.

---

## Part 4 — Weekly recap card

Same treatment as the hunter card, different content. Generated for the past 7
days:

- Quests cleared out of 7, movements logged, XP and gold earned
- Streak status and whether it grew
- Any PR beaten, any achievement unlocked, any progression earned
- The muscle map cumulative view if Part 1c got built
- Which day was heaviest

Shareable and screenshot-shaped, same as the hunter card. This is the thing that
goes in the group chat on Sunday night, and it's a different flex than the hunter
card — that one says who you are, this one says what you did this week.

---

## Constraints

Unchanged: single file, no build, no dependencies, standalone and artifact-safe.
No changes to XP rates, gold rates, rank thresholds, or the PR tests —
achievements *award* XP and gold, they don't change what anything else is worth.

Migrate any new saved field: achievements unlocked, limitation settings.

File size: two body silhouettes plus muscle and strain tags on ~150 movements is
a real addition. If the file crosses ~250KB, flag it rather than deciding to
split it.

## Testing

Script: every movement has muscle tags using only vocabulary terms; every
movement has strain tags; every muscle group in the vocabulary appears on at
least one movement (an unreachable filter is a bug); quest generation still
succeeds under every limitation setting at every rank, especially seated-only.

By hand and by eye: the muscle diagram at both sizes, keyboard navigation end to
end, the reduced-motion path with the OS setting on, 200% zoom, and a screen
reader pass through the guided session if one is available. If you can't run a
screen reader, say so plainly rather than claiming that part is verified.

Do not use the Chrome automation tool.

## Git

Commit before starting. Separate commits per part — accessibility work
especially should be its own reviewable commit rather than mixed into feature
work.
