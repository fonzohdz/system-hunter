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
  A movement with no `f` of its own carries `ref` naming one whose shape
  matches, and borrows its poses — a machine chest press is a bench press seen
  from the side. Every movement must resolve to a real pose that way; there are
  no generic category placeholders and there should not be.
  Keep this simple. One painter, one loop, one timing curve. Motion types,
  per-exercise tempo and frame stepping have all been tried and all been
  removed again.
- **Author each pose from the exercise, never from its category.** `c` is a
  filter tag, not a movement description. A deadlift is `pull` but its elbows
  stay straight and the hips do the work; a calf raise is `legs` but the knee
  barely changes; a shrug is `pull` with long arms. Rules of the form
  "pull means the elbow bends" produce exactly the wrong pose.
- **Every pose owes an answer to one question:** with the name covered, is this
  recognisably that exercise? Ranked below that: correct gross mechanics, clear
  contact points, a readable silhouette at 52px, pleasant motion, and only then
  anatomical precision. It is a pictogram, not a biomechanics model.
- **State the contacts and keep them still.** Whatever supports the body —
  planted hands, a foot on a box, shoulders on the floor, a bar in the hands —
  must not drift between frames. Drifting contacts are what read as "cursed".
  Where the support is an object, draw a minimal one (`p` / `pp`).
- **Holds hold.** Plank, wall sit, dead hang and hollow hold should barely move.
  A near-static correct pose beats invented motion.
- **Hanging movements start hanging.** Feet off the floor in frame one.
- A movement needing more than two positions to read (burpee, get-up, clean)
  takes more frames. `f` is any length ≥ 2; the loop walks all of them.
- Nothing infers facing direction, and nothing should. A torso leaning left in
  screen space is a person bent forward, not a person who turned around.
- Poses were tuned against a literal renderer at 52px. Verify a change by
  looking at it — `scratchpad/sheet.js` builds a start/mid/end contact sheet of
  all 155. Geometry assertions catch broken data, never a wrong-looking pose.
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

## The figure audit

`scratchpad/sheet.js` builds `figure-audit.html`: all 155 at start, midpoint and
end, plus the live animation at the 52px card size, with the support surfaces
drawn. Every movement carries a status — RE-AUTHORED, VERIFIED UNIQUE or
VERIFIED SHARED. **NEEDS REVIEW must stay at zero.**

`scratchpad/v9.js` and `v10.js` hold the per-movement expectations. They are
written from each exercise, never from its `c` tag: a deadlift must keep the
elbow above 140, a calf raise must not change the knee, a hold must not travel,
a hanging movement must clear the floor, a support point must not drift. When
you change a pose, run both — and then look at the audit page, because geometry
cannot tell you whether a figure reads as its exercise.

Behaviour is stated per movement, not inferred: `hold`, `alternating`,
`locomotion`, `multi-phase` are explicit lists in `sheet.js`; everything else is
a rep. Multi-phase movements carry three to five frames — the loop walks them
forward and back, so a burpee authored plank → squat → stand → jump plays the
whole cycle.

Shared poses are legitimate only when the silhouette and mechanics are the same
movement with a different implement (a cable curl is a curl). They are not
legitimate across movements that merely share a muscle — a Nordic curl is not a
glute bridge, a dip is not a push-up, a shrug is not a carry.
