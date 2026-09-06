# System Hunter — project instructions

An RPG-styled workout app. Solo Leveling / gamer aesthetic. Users get a hunter
profile, daily quests, XP, levels, ranks, gold, and a library of 155 movements
with muscle-map diagrams.

## Shape of the project

- **One file: `index.html`.** HTML, CSS, and JS all inline. No build step, no
  bundler, no dependencies, no npm. Do not introduce any of them without asking.
  The three exceptions are `manifest.json`, `icon.svg` and `icon-maskable.svg`,
  added deliberately so the app is installable — a manifest attached as a
  `data:` URI cannot work, because `start_url` is resolved relative to the
  manifest's own URL and a `data:` URL gives nothing to resolve against. They
  are static files Vercel serves as-is; they are still not a build step.
- Deployed by pushing to `main`. Vercel builds nothing — it serves the file as-is.
- Runs in two environments: standalone in a browser, and inside a Claude
  artifact. Both must keep working.

## Do not break

- **Saved progress.** State lives under the storage key `asc:hunter:v4`, with
  migrations from `asc:hunter:v3` and `sh:hunter:v2`.
  Do not rename the key, remove fields, or change the shape of the saved object
  without a migration that reads the old shape and upgrades it. Users lose their
  level, gold, streak and records otherwise, and there is no server backup.
- **`S.perf` holds objects, not numbers.** An entry is `{r, l}` — reps (or
  seconds) and the load in `S.unit`, `0` when unloaded. It used to be a bare
  number; `heal()` upgrades the old shape on every load, so that migration must
  stay. Last five per movement, capped.

- **Progression has two axes.** `repCap(e)` is 3 for a movement with equipment
  and `PROGCAP` (6) for bodyweight. Two sessions at target steps the target up;
  at the top of a loaded movement's range the step resets to 0 and the app says
  to add weight instead. That is double progression and it is deliberate — reps
  climbing forever on a dumbbell press is bad coaching.

- **Quest length is `questLen()`, never a literal.** On `auto` it scales
  inversely with `S.days` (3 days → 7 movements, 6 days → 4) so the WEEK stays
  near 21–25 movements instead of the day staying at 5. Training three days a
  week used to mean getting half the work of someone training six, which is
  backwards. `S.vol` can pin it to 3/5/7 for people who would rather choose.

- **Three ways to train, all first-class.** The daily quest (the app decides),
  a routine (you decide once and repeat), and the library (log anything). The
  runner is shared: `sessList()` returns the routine's movements when
  `S.sess.r` is set and today's quest otherwise, so timers, rests, swaps, load
  logging and progression are never duplicated. A routine is
  `{id, n, ids}` in `S.routines`; `heal()` drops malformed entries and movement
  ids that no longer exist.

- **`S.questDone` is the paid-today ledger, not the quest checklist.** Every
  logged movement goes in it, including ones outside the quest — otherwise
  anything in the library pays XP again on every tap, which routines would have
  made trivial to farm. It is still reset daily by `rollQuest()`, and the
  quest-cleared check asks whether every quest movement is present, so extra
  ids in it are harmless.

- **Logging from the Library is not second-class.** The `data-log` handler must
  keep calling `recordPerf`, so someone who ignores the quest and trains their
  own way still gets lift history and progression. It awarded XP but recorded
  nothing until this was fixed.

- **The Gate is a sink, and must stay one.** It costs gold, pays exclusive
  titles and a record, and pays back NO gold, NO XP, NO stats and NO streak.
  Gold is only earned by training, so a mini-game that paid XP would be a way
  to rank up without training and would hollow out the app. The boss telegraphs
  its intent and one attribute beats it; your stat decides whether the right
  answer is strong enough. That makes it a decision rather than a wager, which
  matters in an app young people use — do not turn it into a random box. The
  sequence is fixed in `S.gt` on entry so reloading cannot reroll a bad draw.

- **Splits are indexed by `S.cycle`, not the weekday.** `S.cycle` increments
  when a whole quest is cleared. Indexing by calendar day is how people never
  train legs: miss Wednesday and leg day is gone. Missing a day must delay the
  rotation, never skip a slot in it.

- **The storage shim (`DB`).** It uses `window.storage` inside Claude and falls
  back to `localStorage` everywhere else. Never call `window.storage` directly.
- **There are no exercise figures.** They were tried for a long time —
  literal pose plotting, bone normalisation, FK, IK, contact locking, angular
  interpolation, static pictograms, and a hand-authored pass over all 155 — and
  none of it ever read reliably at 52px. Eleven keypoints cannot demonstrate
  technique, and a figure that is nearly right is worse than none, because it
  invites the viewer to trust it. The muscle map is the visual now: it says what
  a movement works without claiming to show how to do it. Do not reintroduce
  animated figures without a very good reason and a way to look at them.
- **The muscle maps.** `BODY` holds the two silhouettes, `bodyView` shades one
  of them from an exercise's `mus`, `bodyMap` pairs front and back for the
  detail views, and `bodyCard` is the compact version the library cards use.
  Every muscle term must stay reachable by at least one exercise, or the filter
  has a dead option.
- **The weapon is not on the home screen.** `S.weapon` only ever picks which
  SVG `bladeSVG()` draws — it never touches quests, XP, gold, stats or the
  aura. On the home screen it was 270px above the fold that looked identical
  whether you had trained for a year or never opened the app, so it was
  removed. It still renders in the Vault picker, the onboarding preview and the
  shareable hunter card, which is where a cosmetic belongs: the home screen is
  for you, the card is what other people see. Weapons are still the only paid
  appearance item, so do not remove the shop entry or the card render.
  What responds to training in the hero block is `auraIdx()` — the sigil, the
  halo glow and the tier scale. Keep those.

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
There are no pose or prop fields any more, and no `ref`. A movement's picture
comes entirely from `mus` — get those right and it draws itself.

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
  prescriptions anywhere in the app. Fitness only. There was a food reference
  tab; it was removed at the owner's request and the app has nothing to say
  about eating. Do not add it back without being asked.
- Keep the "soreness is fine, pain isn't" guidance visible on the quest screen.

## Testing

Do not claim a fix works because the code changed. For any UI change, open the
file in a browser and look at it. For layout changes, check a narrow mobile
viewport, not just desktop. If a screenshot is provided, evaluate the screenshot
rather than assuming the implementation matches the code.

## Git

Commit before risky experiments. Do not force-push, rewrite history, or delete
branches. Small, described commits.

## Look — “System Window”

The visual language is a status window, not a card UI: square framed panels
with ticked corners, a monospace voice for anything that is a readout, an
outlined accent button rather than a solid slab, and scanlines at very low
contrast. It is set on `.block` and `.hero` via two pseudo-elements each, so no
extra markup is needed to frame something — give it the class and it frames.

**Nothing in it hardcodes a hue.** Every accent is `--crimson`, `--magenta`,
`--core` or an `rgba()` built from the `--c1` / `--m1` triplets, all of which
`applyLook()` swaps per palette. That is why all eight palettes work and why
Frost renders the design in its original cyan. Do not introduce a fixed colour
into this layer.

## Type

Three faces, all from Google Fonts, loaded by the single `<link>` in the head.
`--display` is **Cinzel** and carries the identity: brand mark, headings, level
badge, stat numbers, the name in the halo. `--body` is **Archivo** and does the
quiet 11–13px UI work. Archivo replaced Inter deliberately — Inter is on enough
sites that it reads as a default rather than a choice. Do not swap `--body` back
to Inter, Roboto, Geist or Plus Jakarta Sans.

`--mono` is **IBM Plex Mono** and is the third voice: it speaks data and
nothing else — panel headers, tallies, stat labels, tab labels, filter chips,
buttons, lift figures. Do not set prose in it.

`--body` is set on `#root`, not on `body`. Anything appended to `document.body`
(sheets, the veil, toasts) needs its own `font-family:var(--body)` or it
inherits the browser's serif.

## Voice

In-app copy is plain and direct. No corporate tone, no exclamation-point
enthusiasm, no "Awesome job!!" reward text. The System is terse and a little
cold. Errors and empty states say what happened and what to do.

