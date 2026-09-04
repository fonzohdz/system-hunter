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
- **The figure rig.** Each exercise may carry `f: [poseA, poseB, ...]`, each pose
  being exactly 22 numbers: head, neck, hip, back elbow, back hand, back knee,
  back foot, front elbow, front hand, front knee, front foot — x,y pairs in a
  100x100 box. A pose of the wrong length renders a mangled figure and throws
  nothing, so verify counts when editing.
  **Draw the pose exactly as authored.** Do not normalise bone lengths, snap to
  a floor line, or pin contacts with inverse kinematics. All three have been
  tried and all three made it worse.
  Limb lengths vary between poses ON PURPOSE: a limb angled toward the camera
  is shorter on screen. In a flat side view that foreshortening is the only
  depth cue there is. Plank has a 6-unit forearm and a 12-unit thigh against 19
  standing — that is not an error to fix, it is the drawing working. Forcing
  constant bone lengths flattens it and the movements with the most rotation
  (bird dog, dead bug, mountain climber) suffer worst.
  These poses were tuned by eye against a literal renderer. Change the poses if
  a movement reads wrong; do not add a correctness layer on top of them.
  Movements with no `f` fall back to a per-category stand-in, which is fine —
  the bar is "help someone who does not know the movement", not "name it blind".
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

## Provisions (the Food tab)

Static reference content in `PROV`, filtered by `FOODEQ` and `DIETS`. It connects
to nothing — no logging, no scoring, no XP, no gold, no streaks.

**Never attach a number to food.** No calories, macros, grams, portions, daily
totals, or tracking of any kind. No weight-loss or weight-gain framing, no good
and bad foods, no cheat meals, no earning or burning anything off. Cooking times
and temperatures are fine — those are instructions, not targets.

An item declares what it contains in `has` (meat, pork, fish, shellfish, dairy,
egg, nuts, gluten); the dietary filters work by exclusion. Halal and kosher can
only screen the obvious conflicts, and the tab says so — nothing in an app can
certify preparation.

Every equipment and dietary combination must leave something to eat. Verified by
script; the strictest possible setting currently leaves seven ideas.

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
