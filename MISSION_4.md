# Mission 4: expand the library to ~150

Read `CLAUDE.md` and the current `index.html` first.

## Why

The library reads as 73 movements but a gym user only sees the 39 that need
equipment. Inside those 39 there are **8 weighted leg movements, 2 weighted core,
and 5 machines** (two of which are cardio). Someone training legs twice a week
exhausts the variety in a month.

The bodyweight library (34) is in good shape and carries travel mode. Leave it
roughly as-is. The gap is everything that needs a gym.

## Target

Roughly **150 total**. New movements weighted toward equipment:

| Group | Now | Add | Notes |
|---|---|---|---|
| Machine / cable | 5 | +28 | The biggest gap. Most commercial-gym users live here. |
| Dumbbell | 15 | +16 | Especially legs, rear delts, isolation |
| Barbell | 8 | +11 | Trap bar, EZ bar, landmine, more leg variants |
| Kettlebell | 4 | +8 | |
| Bar / dip / suspension | 4 | +8 | Dips, muscle-up progressions, TRX |
| Bodyweight | 34 | +5 | Only where a chain has an obvious missing rung |

New equipment codes needed: `cable`, `dip`, `trx`, `ezbar`, `trapbar`,
`landmine`, `sled`, `medball`. Add them to `EQNAME` and to the onboarding and
vault equipment pickers. Group the picker sensibly — a flat list of fifteen
checkboxes is bad UX. Consider "Free weights / Machines & cables / Bodyweight
gear / Conditioning tools".

## What's specifically missing

**Legs** — the worst gap. Leg curl, leg extension, hip abduction/adduction,
weighted calf raise (seated and standing), walking lunge, front-rack lunge,
sumo deadlift, trap bar deadlift, hack squat, glute-ham raise, Nordic curl,
sissy squat, step-up variants, cable pull-through.

**Machines and cables** — chest press, incline press, shoulder press, pec deck,
cable fly (high/low), cable crossover, tricep pushdown, overhead cable
extension, cable curl, cable lateral raise, face pull (cable), straight-arm
pulldown, seated row variants, chest-supported row, assisted pull-up/dip,
ab crunch machine, cable woodchop, pallof press, hip thrust machine.

**Isolation** — rear delt fly, incline curl, concentration curl, preacher curl,
skull crusher, kickback, wrist work, shrugs.

**Missing entirely** — dips, EZ bar variants, landmine press and row, trap bar,
TRX rows and push-ups, medicine ball slams, sled push, farmer walk variants,
box jumps, battle ropes.

## Do it in batches — this is the important part

**Do not add 80 exercises in one pass.** Every new movement needs two
hand-authored 22-number poses, and a bad pose renders a mangled figure while
throwing no error. Nothing catches it but human eyes. Eighty at once means
eighty figures that are all slightly wrong and no way to tell where it went
sideways.

Work in batches, commit each one, and **stop after each batch for the user to
review the figures visually.**

1. Machines and cables (~28) — biggest gap, do it first
2. Legs across all equipment (~16)
3. Dumbbell and isolation (~14)
4. Barbell, EZ, trap bar, landmine (~11)
5. Kettlebell, dips, TRX, conditioning tools (~13)

After each batch, tell the user exactly which new movements to look at and what
you're least confident about. Wait for the go-ahead before the next batch.

## Authoring rules

Follow the existing `EX` schema exactly. Required: `id, n, r, c, st, d, eq,
cues, f`. Optional `p` / `pp` for equipment props.

- **Ids must not collide.** Existing ids are listed in `CLAUDE.md`; check before
  adding. Follow the existing naming (`db_`, `bb_`, `kb_`, `cbl_`, `mch_`).
- **Poses are exactly 22 numbers.** Verify by script after every batch.
- **Cues: four, plain language.** Coaching, not jargon. The fourth is usually the
  "why you care" line. Match the voice already in the file — dry, direct, no
  exclamation points.
- **Rank honestly.** Rank is difficulty and injury risk, not how impressive it
  looks. Machine work is generally lower rank than free-weight equivalents
  because the machine stabilises the movement — that's the point of machines and
  it's what makes them good for beginners.
- **Barbell and overhead movements get real form cues**, not just rep counts.
- **Equipment props** — several new movements need prop types the renderer
  doesn't have (cable stack with a moving line, dip bars, TRX straps, trap bar,
  EZ bar, landmine, med ball, sled). Extend the prop system rather than leaving
  them propless; a cable exercise drawn with no cable looks broken.

## Interaction with the other missions

- **Progression chains** (Mission 3) should be extended to cover the new
  movements where an obvious chain exists — e.g. assisted dip → dip → weighted
  dip.
- **Swap alternatives** (Mission 3) get much better with a deeper library. Verify
  swap still returns three sensible options for the new categories.
- **Muscle maps** are Mission 5, deliberately after this. Authoring them for 73
  movements and then again for 77 more would be doing it twice. When adding
  movements now, it's fine to include primary/secondary muscle tags if it's
  cheap — but don't build the map UI yet.

## Constraints

Single file, no build step, no dependencies. File size is now a real
consideration: 150 movements with poses and cues will add meaningfully to a
document that's already ~100KB. Keep cues tight, don't pad. If it goes past
~250KB, flag it and we'll talk about splitting the data out — don't decide that
unilaterally.

No changes to XP, gold, rank thresholds or the PR tests.

## Testing

Script after every batch: all poses exactly 22 numbers, no duplicate ids, every
`eq` code exists in `EQNAME`, every rank valid, every category valid, cues
present and at least three per movement. Then re-run quest generation across
every equipment preset and rank tier and confirm no violations.

Do not use the Chrome automation tool. Commit each batch, tell the user what to
look at, wait for review.

## Git

Commit before starting. One commit per batch, described. Don't push until the
user has reviewed the figures.
