# Mission 2b: figure and weapon corrections

Small, surgical follow-up to Mission 2. Do this before Mission 3 — the figures
are on the live URL and they're the first thing anyone sees.

Reviewed on a real phone. The renderer works, the proportions don't.

## The problem

Limbs, torso and head fuse into a single pink mass. Standing March and Calf
Raise read as one solid column with no distinguishable arms. Bird Dog reads as a
four-legged animal. At 52px in the quest list it's unusable; in the detail sheet
it's better but still blobby.

Two causes, and the second matters more than the first:

1. Everything is too thick for a 100-unit box where limbs overlap the torso.
2. **There is no separation between overlapping parts.** Every element is the
   same gradient with no outline, so where an arm crosses the torso there is no
   edge and they read as one shape. Thinning alone will not fix this.

## Fixes

### 1. Thin everything by roughly 35%

- Arm: `5.7 / 4.3` → `3.6 / 2.6`
- Leg: `7 / 5.3` → `4.4 / 3.2`
- Torso: shoulder `7.2` → `5.4`, ribcage `8.3` → `6.0`, waist `5.4` → `4.0`

These are a starting point, not gospel. Render and adjust.

### 2. Separating outline — the important one

Every near-side limb, the torso, and the head get a stroke in `--void` behind
their fill, roughly 1.2 units wide, so overlapping parts show a visible edge.
Draw order stays far limbs → torso → near limbs → head; each element's outline
must sit under its own fill but over whatever it overlaps.

This is what turns a blob back into a body.

### 3. Drop the face nub

At 52px it reads as a lump, not a face. Remove it. Head becomes a plain circle,
radius down about 20% from current. Facing direction is already carried by the
limbs and torso — it doesn't need a feature to communicate it.

### 4. Raise far-limb contrast

Far limbs are currently too close in value to the near limbs to read as depth.
Take them to roughly 45% of near-side brightness, and confirm they're also
thinner as intended.

## Verify at 52px first

The quest list thumbnail is the hard case and the one that failed. Check there
before the detail sheet — if it reads at 52px it will read anywhere. Look at
Standing March, Calf Raise, Bird Dog, Dead Bug and Knee Plank specifically;
those are the five that were visibly wrong.

Then re-check the eight concerns from the Mission 2 report — plank torso, feet
stabbing the ground line, and so on — since thinner geometry may have fixed or
worsened them.

## Weapons

The katana is wrong. It renders as a straight glowing plank: no curve, which is
the single defining feature of a katana. The grip wrap draws as literal X
shapes, and the tsuba is a flat ellipse.

Fix the katana: give the blade a real curve (asymmetric, sharpened edge on the
outside of the arc), a proper diamond or circular tsuba, and a wrap that reads as
crossed cord rather than typed X's.

Then render **all six weapons at hero size** and look at them. Only the katana
has been seen on a device. Report which ones you think are weak — the composites
(daggers, gauntlets) were flagged as risky in your own Mission 2 notes and have
still never been reviewed.

## Constraints

Renderer and weapon paths only. Do not touch the `EX` data, the pose format, the
tempo curves, or anything in the economy or travel-mode work.

## Testing

Script: all poses still 22 numbers, renderer emits finite in-box geometry for
every exercise, no exceptions thrown.

Then commit and tell the user what to look at. Do not use the Chrome automation
tool. Screenshots from the user are the acceptance criteria.
