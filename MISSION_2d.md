# Mission 2d: retire the figures, promote the muscle map

## The decision

The animated figure system is being removed. Not tuned — removed.

It was reviewed on a real device at every stage: filled bodies, outlined bodies,
thin pictograms, re-cameraed poses, and the batch-1 sweep with props. At every
stage the user ran the acceptance test — cover the labels, name the movement —
and could not identify them. The final answer on batch 1 was that none of the 34
were nameable blind.

The conclusion is structural, not a failure of the last attempt: **an 11-point
stick skeleton cannot distinguish 73 similar human movements.** A chair squat
and a wall sit are the same joint angles differing only in what's behind them. No
amount of stroke tuning fixes that.

Your own geometry work was sound — the duplicate audit, the max-displacement
metric, the plank forearm fix, the surface props. It's being removed because the
approach has a ceiling, not because the execution was bad.

Do not attempt to save the figures. Do not propose a sixth variation.

## What to remove

- `paintFig`, `figSVG`, `mountFig`, the `rigs` array and the figure animation
  loop
- The tempo system (`t` fields and curve logic) and multi-frame interpolation
- The equipment prop renderer (`p` / `pp` handling and all prop shapes)
- All figure-related CSS
- Figure markup from quest rows, library cards, and the movement detail sheet

**Keep the `f` pose arrays in `EX` for now.** Don't delete data in the same
commit that removes rendering — if something later wants them, they're a git
revert away rather than a re-authoring job. Note in `CLAUDE.md` that they're
unused. Delete them in a follow-up once this has settled.

The weapon/blade SVGs are unrelated and stay.

## What replaces it

### Muscle tags — do this now

This was scheduled for Mission 5. It moves here because it's now the primary
visual and it's what makes the removal an upgrade rather than a subtraction.

Add `mus` to every exercise:

```
mus: { p:['lats','midback'], s:['biceps','rear-delts'] }
```

Fixed vocabulary, sixteen groups, no more:
`chest, front-delts, side-delts, rear-delts, biceps, triceps, forearms, lats,
midback, traps, lower-back, abs, obliques, glutes, quads, hamstrings, calves`

Be honest rather than generous. Two or three primaries maximum. Almost
everything hits the core a little — only tag it where it genuinely matters.

### The body diagram

Front and back silhouettes as inline SVG, each muscle group its own path.
Primary muscles fill bright in the palette accent, secondary at ~40%, everything
else in the dim line colour.

**This is two assets that have to be good, not seventy-three.** That's the whole
reason for the change. Spend real effort on them — they need to read as a human
body at 120px. Draw them properly rather than approximating with rectangles.

Where they appear:
- **Movement detail sheet** — the main placement, where the figure used to be.
  Front and back side by side.
- **Quest rows and library cards** — not the full diagram. A compact indicator:
  the primary muscle names as small text, or a tiny simplified body glyph. Rows
  should get cleaner than they are now, not busier.

### Browse by muscle

Add muscle-group filtering to the library alongside rank and category. "Show me
everything that hits lats" is how people actually think, and it's more useful
than the coarse push/pull/legs split.

## Expect the app to look better immediately

Removing 73 unreadable thumbnails will make the quest list and library
noticeably cleaner on its own, before the muscle work lands. Ship the removal
and the tags together, but don't hold the removal hostage to a perfect diagram.

## Constraints

Single file, no build, no dependencies. This should *reduce* file size — report
the before and after. No changes to XP, gold, ranks, quest generation, travel
mode, the economy, or the PR tests.

## Testing

Script: no orphaned references to removed functions; every exercise has `mus`
tags using only vocabulary terms; every vocabulary term appears on at least one
exercise (an unreachable filter is a bug); quest generation unaffected.

Then commit and tell the user what to look at — the detail sheet diagram at
both sizes, the quest list, and the library with muscle filtering. Do not use
the Chrome automation tool.

Say plainly which of the two silhouettes you're less confident in.

## Git

Commit before starting. Separate commits: removal, muscle tags, diagram,
filtering. The removal commit should be clean enough to revert on its own.
