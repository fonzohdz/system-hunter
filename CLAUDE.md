# System Hunter — project instructions

An RPG-styled workout app. Solo Leveling / gamer aesthetic. Users get a hunter
profile, daily quests, XP, levels, ranks, gold, and a library of 73 movements
with animated figure demos.

## Shape of the project

- **One file: `index.html`.** HTML, CSS, and JS all inline. No build step, no
  bundler, no dependencies, no npm. Do not introduce any of them without asking.
- Deployed by pushing to `main`. Vercel builds nothing — it serves the file as-is.
- Runs in two environments: standalone in a browser, and inside a Claude
  artifact. Both must keep working.

## Do not break

- **Saved progress.** State lives under the storage key `sh:hunter:v2`.
  Do not rename the key, remove fields, or change the shape of the saved object
  without a migration that reads the old shape and upgrades it. Users lose their
  level, gold, streak and records otherwise, and there is no server backup.
- **The storage shim (`DB`).** It uses `window.storage` inside Claude and falls
  back to `localStorage` everywhere else. Never call `window.storage` directly.
- **~~The figure rig.~~ Removed.** The animated stick figures are gone. An
  11-point skeleton could not distinguish 73 similar human movements — a chair
  squat and a wall sit are the same joint angles differing only in what's behind
  them — and they failed the "cover the label, name the movement" test at every
  size. Exercises are identified by their muscle tags now.
  The `f` pose arrays, and the `p`/`pp` prop fields, are still in `EX` but
  **nothing reads them**. They're kept only so the removal is a git revert rather
  than a re-authoring job; delete them once this has settled.
- **iOS safe areas.** Padding uses `env(safe-area-inset-*)`. It is installed to
  home screens and runs edge-to-edge under the Dynamic Island. Do not replace
  those with fixed pixel padding.
- **No localStorage schema changes** without understanding the migration impact.

## Adding an exercise

Append to the `EX` array. Required fields:
`id, n (name), r (rank E/D/C/B/A), c (category: push|pull|legs|core|cardio|full),
st (stat: STR|END|VIT|AGI|CORE), d (dose e.g. '3 × 8'), eq (array of equipment
codes, [] for bodyweight), cues (4 short strings),
mus (muscles: {p:[primary], s:[secondary]})`.
`p`, `pp` and `f` are legacy fields left over from the removed figure system.
Nothing reads them. Don't add them to new exercises.

`strain` lists which areas a movement loads, from: `knees, shoulders, lower-back,
wrists`. `sit:1` marks a movement performable from a chair or a machine. Both
feed the optional "working around" setting, so be honest: an over-tagged `sit`
produces a quest someone cannot actually do.

Muscle vocabulary — these seventeen and no others:
`chest, front-delts, side-delts, rear-delts, biceps, triceps, forearms, lats,
midback, traps, lower-back, abs, obliques, glutes, quads, hamstrings, calves`

Be honest rather than generous: two or three primaries at most. Almost everything
hits the core a little — only tag it where it genuinely matters. Every term must
stay reachable by at least one exercise, or the library filter has a dead option.

Equipment codes: `db kb bb bar bench band machine`.

Cues are plain-language coaching, not jargon. Four of them. The last one is
usually the "why you care" line.

## Health content rules

- Movements must be scalable and beginner-safe. Every rank-E exercise should be
  doable by someone who has never trained.
- Barbell and overhead work carries form cues, not just rep counts.
- No calorie targets, weight-loss framing, body-composition goals, or diet
  prescriptions anywhere in the app. Fitness only.
- Keep the "soreness is fine, pain isn't" guidance visible on the quest screen.

## Testing

Do not claim a fix works because the code changed. For any UI change, open the
file in a browser and look at it. For layout changes, check a narrow mobile
viewport, not just desktop. If a screenshot is provided, evaluate the screenshot
rather than assuming the implementation matches the code.

## Git

Commit before risky experiments. Do not force-push, rewrite history, or delete
branches. Small, described commits.

## Voice

In-app copy is plain and direct. No corporate tone, no exclamation-point
enthusiasm, no "Awesome job!!" reward text. The System is terse and a little
cold. Errors and empty states say what happened and what to do.
