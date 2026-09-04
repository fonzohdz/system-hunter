# Mission 2: figures, travel mode, and the cosmetics economy

Read `CLAUDE.md` and the current `index.html` first. The customization work from
`MISSION_customization.md` is done and committed but not pushed. This mission
builds on it.

Three independent pieces. Do them in this order — part 2 is the biggest and the
one that most affects how the app feels.

---

## Part 1 — Every palette free, weapons become the unlock

**Change:** all eight palettes are available to everyone from creation, no cost,
no class restriction. Delete the palette price fields and the palette purchase
flow.

**Why the swap:** free palettes leave the vault with nothing but titles to sell,
and gold stops meaning anything. Move the cost onto weapons instead. Same amount
to unlock, but nobody is locked out of a colour they like — which was the whole
point.

- Free weapons: **longsword, katana, gauntlets**.
- Purchased: **greathammer 400**, **twin daggers 500**, **staff + orb 700**.
- A weapon the user has not bought shows in the picker locked, with its price,
  and is buyable from the Vault's Appearance section directly — don't make them
  go to a separate shop screen for it.
- Anyone whose existing save has a paid palette (`pal_void` etc. from the
  migration) keeps the gold value: refund the purchase price to their balance
  once, on migration, and drop the owned entry. Don't strand it.

Titles stay as they are.

---

## Part 2 — Better exercise figures

This is the priority. The figures are the single thing most holding the app back
visually, and the user has raised it twice.

**Do not re-author the 73 exercises' pose data by hand.** The `EX` array's
22-number format stays exactly as it is. Improve the *renderer* so all 73 get
better at once, then add optional data only where it earns its keep.

### 2a. A body, not a stick

Currently each figure is four polylines and a circle. Replace with a rendered
body derived from the same 11 keypoints:

- **Tapered limbs.** Upper arm thicker than forearm, thigh thicker than shin.
  Draw each segment as a filled quad or a stroked path with varying width rather
  than one uniform stroke.
- **A torso with mass.** Build a filled shape from shoulder (neck point), hip,
  and an interpolated ribcage width — not a single line from neck to hip.
- **Hands and feet.** Small terminal shapes at wrist and ankle, oriented along
  the limb's angle. Their absence is why the current figures read as sticks.
- **A head with facing.** Derive facing direction from the neck→hip vector and
  the limb positions, and offset the head shape accordingly so it's clear which
  way the body is oriented.
- **Depth.** Far-side limbs already render darker; keep that, and make far limbs
  slightly thinner too.

Silhouette style, not anatomy diagram. It must still read at 52px in the quest
list and at full width in the detail sheet. Test both sizes.

Everything keeps using the palette custom properties.

### 2b. Real tempo

Right now every exercise animates between two poses on the same symmetric sine.
Everything moves at identical speed, which is why it reads as a wobble rather
than a rep.

Add an optional `t` field to an exercise: `{down, hold, up, rest}` in relative
units, defaulting to something sane. Drive the interpolation from that curve
instead of a plain sine.

Real lifting is asymmetric: slow controlled lowering, brief pause, faster drive
up, short reset. A squat that takes 3 counts down and 1 count up looks like a
squat. A plank should barely move at all — it's a hold, and holds should read as
holds, with only a subtle breathing drift.

Set sensible per-category defaults (push/legs/pull get the eccentric emphasis,
core holds get near-stillness, cardio gets a quick even cycle) so all 73 improve
without per-exercise authoring. Then hand-tune `t` on maybe ten where it
obviously matters.

### 2c. Mid-frames where they matter

The `f` array is two poses. Allow three or more, interpolating through them in
sequence. Then add a middle pose to the ~10 exercises whose motion genuinely
isn't a straight line between endpoints — burpees, Turkish get-up, kettlebell
swing, clean, thruster, mountain climber.

Only these. Do not add mid-frames to all 73; most are fine as two-pose and the
file size matters.

**Verify after:** every pose in every exercise is still exactly 22 numbers, and
the array lengths are consistent. A malformed pose renders garbage and throws
nothing.

---

## Part 3 — Travel mode

The user lives in hotels for work. "I have nothing today" is his normal week,
not an edge case. Right now equipment is a profile-level setting, so a
dumbbell-owning user on the road gets a quest full of movements he can't do, and
his only options are to fail it or permanently edit his profile.

**Build a per-day equipment override.**

- On the Quest screen, above the quest list: a compact control showing what
  today's quest was built against, with a way to change it for today only.
- Presets: **My full kit** (the profile default), **Hotel room** (bodyweight,
  plus a chair/bed/wall — i.e. anything with `eq: []`), **Floor space only**,
  **Cardio machine only**, and **Custom** which opens the normal equipment
  toggles.
- Choosing one re-rolls today's quest against that constraint immediately.
- It must **not** overwrite the profile. Tomorrow goes back to the full kit
  unless they change it again.
- Anything already logged today stays logged. Don't punish someone for
  switching mid-day, and don't let them re-log a cleared movement for double XP.
- Persist the override keyed to today's date so it survives a refresh.

**Also:** guarantee the fallback works. With zero equipment there must always be
a full five-movement quest available at every rank — verify this in a script for
each of the six rank/level tiers. If the bodyweight library can't fill five at
some level, say so rather than silently returning a short quest.

Copy should treat this as normal, not as a downgrade. "Travelling" is a mode,
not an excuse.

---

## Also

Convert `.spot` in the tutorial spotlight to animate a transform instead of
`top/left/width/height`. You flagged it, you're right, it's one line, do it.

---

## Constraints

Unchanged: single file, no build step, no dependencies, runs standalone and
inside a Claude artifact, safe-area padding intact, no changes to stats, XP,
gold rates, rank thresholds, or the three PR tests. Migrations for any saved
field change.

## Testing

Script-verify what a script can verify: pose integrity, quest generation under
every equipment preset at every rank tier, migration.

But this mission is mostly visual, and screenshots are the acceptance criteria.
Do not use the Chrome automation tool — it hung for 90 minutes last run. Instead:
make the changes, verify by script, commit, and tell the user precisely what to
look at. He'll open the file and send screenshots back.

Be specific about what you're unsure of. The figure renderer is the piece most
likely to look wrong in ways a script can't catch.

## Git

Commit before starting. Small commits. Don't push until the visual pass passes.
