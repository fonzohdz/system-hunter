# RANK UP — project instructions

An RPG-styled workout app. The name on screen is **RANK UP**; the repository and
the Vercel project are still called system-hunter. Users get a hunter profile, a
daily quest built for them, levels, ranks, parameters, and a library of 155
movements with muscle-map diagrams.

The product thesis, settled with the owner across a long Q&A: **motivation is
identity, the core job is to coach properly, and the game is progression.** The
home screen shows the gap to the next rank, what today is training, and one
button. No movement list, no shop, no sprite.

## Shape of the project

- **One file: `index.html`.** HTML, CSS, and JS all inline. No build step, no
  bundler, no dependencies, no npm. Do not introduce any of them without asking.
  The three exceptions are `manifest.json`, `icon.svg` and `icon-maskable.svg`,
  added deliberately so the app is installable — a manifest attached as a
  `data:` URI cannot work, because `start_url` is resolved relative to the
  manifest's own URL and a `data:` URL gives nothing to resolve against. They
  are static files Vercel serves as-is; they are still not a build step.
- **`sfx/` is the fourth exception.** Eight CC0 WAV files and an `index.json`
  manifest, added when the owner bought Kenney's asset bundle. They are static
  files too. See `sfx/LICENSE.txt` for what each one is and why they are WAV
  rather than Ogg. Anything added there must be CC0 or equivalent — not ripped
  from a video — and must be credited in that file.
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

- **The economy is cut. Do not put it back.** Gold, the shop, weapons, titles,
  aura styles, potions and the quest reroll were all removed from the interface
  deliberately, after the owner concluded that collection was never the reason
  this app gets opened. Progression is the game: rank, level, parameters and the
  work behind them. `S.gold` and `S.owned` still exist in the saved object and
  are still written to, because removing fields breaks old saves — but nothing
  reads them on screen, and nothing should. `WEAPONS`, `CLASSES`, `TITLES`,
  `AURASTYLE`, `REROLL`, `POTION` and their handlers are unreachable code kept
  only until someone deletes them carefully. Do not wire them back to a screen.

- **Rank is the spine.** It gates which movements exist, and it is what the home
  screen counts toward. `horizon()` answers the only question that screen asks:
  how many sessions to the next rank, expressed in sessions because sessions are
  something you can picture doing. `rankReqs()` shows the real requirements under
  it, never decoration.

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
- **The muscle maps.** `BODYART` holds 89 anatomical vector paths — 40 front,
  49 back — from Body Muscles by Ivan Vulović, Apache 2.0, with the licence and
  the required NOTICE in `art/body/`. The paths are verbatim; only the colours
  are ours. `MUSPATH` maps each of the seventeen muscle terms to the path-id
  prefixes that belong to it and `MUSOF` inverts that once at startup.
  `bodyView` shades one figure, `bodyMap` pairs front and back for the detail
  views, and `bodyCard` is the compact version the library cards use.
  Every muscle term must stay reachable by at least one exercise AND map to at
  least one path, or the library filter has an option that highlights nothing.

- **`bodyView` emits four paths, not eighty-nine.** The paths for each colour
  are concatenated into one `d`. The library draws 155 cards at once, and at
  178 nodes a card that is twenty-seven thousand SVG elements on a page someone
  is scrolling with their thumb; merged it is about 850. Each path is prefixed
  with a zero-length `M0,0` to put the pen back at the origin, because a
  leading `m` is only absolute while it is the first command and these paths
  carry implicit RELATIVE linetos straight after it. Rewriting that `m` to an
  `M` instead turns those linetos absolute and shreds the figure — it looks
  like the body exploded into shards. Do not do that.
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

## Look — the System window

Modelled on *Shangri-La Frontier*'s interface, from reference screenshots the
owner supplied. The idea is a **heads-up display, not a document**: smoked glass
panes with a thin luminous perimeter, dividers instead of boxes, tiny spaced
abbreviations over real labels, and numbers treated as objects rather than as
text inside sentences. Rounded cards, drop shadows, soft gradients and anything
that reads as "app chrome" are the failure mode.

- **Three accents and no more.** Cyan `#42E8F5` is the operating system —
  borders, labels, ticks, the default particle. Magenta `#F234A9` marks anything
  locked, new, or a record. Amber `#FFB83E` is reserved for the single number
  that matters most on a screen. Spend amber once per screen and hierarchy
  appears; spend it twice and it is gone. The ground is `#040C12`.
- **Numbers are the subject.** `.big b` is 56–80px against a 14px label. The
  home screen's number is *sessions remaining*, not XP: "340 / 1000 XP" is a
  loading bar, "5 sessions" is a thing you can picture doing.
- **Dividers, not boxes.** A `.block` is a hairline perimeter with corner ticks
  and a tinted header strip. Inside it, rows are separated by 1px rules. Do not
  nest a bordered card inside a bordered pane.
- **Restrained glow.** One `box-shadow` of coloured light per element, never
  stacked. The gleam that crosses `.btn` every 3.8s is the only idle animation
  on a control.
- **`#fxc` is the tactile layer.** A fixed, full-viewport, pointer-events-none
  canvas driven by `FX`. Bursts fire at `clientX/clientY` — never at an
  element's centre, because a tap that flowers somewhere other than under your
  finger reads as a glitch. The loop stops itself when the particle and ring
  arrays are empty; an rAF loop that never idles costs battery all day and also
  hangs headless capture.
- **The rank-up is a full-screen takeover.** `.awaken` covers everything at
  z-index 90 with `#fxc` above it at 92. Four beats — charge, snap, detonation,
  verdict — and it is dismissible from the first frame with a visible way out.
  A bordered panel with the app showing around it reads as a notification, and a
  rank is not a notification.
- **Motion is damped, never snapped.** `--ease` is `cubic-bezier(.16,1,.3,1)`.
  Everything must stay legible at a glance, at arm's length, mid-set.
- **`REDUCED` is honoured everywhere.** Under it `FX` draws nothing, the scan bar
  is hidden, and the takeover shows its verdict with no animation at all.

## Sound

`SFX` owns one `AudioContext` for the whole app, created on the first pointer
gesture because iOS will not start one any other way, and resumed on
`visibilitychange` because iOS suspends it in the background. Never open another
one — `beep()` used to open a fresh context per call, which iOS eventually stops
honouring.

Every synthesised sound is a **transient plus a body**: band-passed noise for the
attack, which is what makes a click read as a click rather than a beep, over one
or two detuned oscillators, through a generated convolution tail.

Sound is opt-in. `S.sound` gates it, toggled from Status or from the run header.

Samples are optional: if `sfx/index.json` exists it maps names to files and
those play instead, with the synth as the per-name fallback, so the two can
never drift apart. That is one request that 404s quietly when there is no pack
rather than a dozen. Any audio added must be CC0 or equivalent and credited in
this file — not ripped from a video.

## Type

One face: **Rajdhani**, from Google Fonts, loaded by the single `<link>` in the
head. Squared, technical, high legibility at small sizes — the closest thing on
Google Fonts to an MMO system font. `--display`, `--body` and `--mono` are all
aliased to it. Figures are tabular (`font-variant-numeric:tabular-nums`).

Do not reintroduce a second face, and do not reach for a monospace as a costume
for "technical".

`--ui` is set on `#root`, not on `body`. Anything appended to `document.body`
(sheets, veils, toasts, the takeover, the cards) needs its own
`font-family:var(--ui)` or it inherits the browser's serif.

## Icons

Tab labels are words, not pictograms — at 10px with letter-spacing they read
faster than a 12x12 glyph and they match the rest of the system's voice.

Where an icon is still wanted, it is drawn, never a glyph. `ICONS` maps a name to
a 12x12 character grid — `#` is a lit pixel, `+` a dimmer one — and `pxIcon()`
emits it as `<rect>` runs with `crispEdges` and `fill:currentColor`, so an icon
follows the surrounding text. Never put `crispEdges` on smooth vector art: it
produces jaggies, not pixels.

## Voice

In-app copy is plain and direct. No corporate tone, no exclamation-point
enthusiasm, no "Awesome job!!" reward text. The System is terse and a little
cold. Errors and empty states say what happened and what to do.

