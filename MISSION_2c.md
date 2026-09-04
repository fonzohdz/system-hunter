# Mission 2c: the hero becomes a character

Do this **after** Mission 2b lands and the user has confirmed the figures read
well. This mission depends on that renderer being good — if figures still look
blobby at hero size, say so and stop rather than building on a bad foundation.

## The change

The hero at the top of the Quest tab is currently a floating weapon. Replace it
with a **character** — the user's avatar — that visibly evolves as they rank up.

A weapon is an object. A character is you. Watching yourself get kitted out over
months is a far stronger reason to open the app than watching a sword sit there.

The weapon isn't discarded — the character holds it. All six weapons stay
meaningful, they're just in a hand now.

## Reuse the rig

The exercise figures are an 11-keypoint skeleton with a renderer that draws a
body from it. **The avatar is the same skeleton in an idle pose, rendered
larger.** One renderer, two jobs. Do not build a second body system.

Practical consequences:
- Improvements to the figure renderer improve the avatar for free.
- The avatar needs an idle pose (or two, for a subtle breathing loop) authored
  in the same 22-number format.
- At hero size the renderer needs to hold up at ~250px tall. It was tuned for
  52–200px. Check and adjust rather than assuming it scales.

## Gear tiers

Gear is driven by **rank**, so it maps to progression the user already
understands:

| Rank | Gear |
|---|---|
| E | Ragged traveller — cloth wraps, no armour, bare arms |
| D | Bracers and boots, a belt, a simple tunic |
| C | Chestplate, cloak, reinforced boots |
| B | Pauldrons, a full matched set, cloak with weight to it |
| A | Full armour, aura bleeding through the seams |
| S | Whatever reads as beyond full armour — restraint here, not more spikes |

**Class shapes the style of that gear**, not the tier. Same ladder, different
silhouette:
- **Bladebound** — knightly, straight lines, heraldic
- **Ronin** — layered plates, haori, asymmetric
- **Warden** — heavy, blunt, earthbound
- **Arcanist** — robes, hood, minimal metal
- **Stalker** — hooded, light, wrapped, close to the body
- **Ironclad** — the heaviest plate, full helm at high rank

Six classes × six tiers is thirty-six combinations. **Don't author thirty-six
illustrations.** Build gear as layered pieces attached to skeleton points —
pauldrons at the shoulders, greaves along the shins, a cloak hanging from the
neck point — and compose them per class and tier. A piece is a small SVG path
positioned and rotated from the joints it attaches to.

Everything uses the palette custom properties. Metal reads as a darker,
desaturated shade of the palette rather than a hardcoded grey, so a Frostfang
knight looks different from an Ember one.

## The one hard rule: the body never changes

**Gear evolves. The physique does not.** Same proportions at level 1 and level
40, for every user.

Two reasons, and both matter:

1. It would be a lie. The app has no idea what anyone's body looks like — it
   knows they tapped some buttons.
2. An avatar that gets leaner as you log workouts is telling every user what
   progress is supposed to look like on a body. That lands badly for a
   meaningful number of people and neither you nor the app can tell which ones.

Armour getting better says "you've been consistent," which is true and is the
thing being measured. A changing body says something the app has no business
saying. Do not add body-type options, physique sliders, or any visual that
implies a body composition goal. If a request seems to head that way, ask.

## Aura

Unchanged mechanically — still driven by streak via `auraIdx()`, still one style
per class. It now wraps a person instead of a weapon, which should read better.
Make sure the tendrils/embers/etc. compose behind and around the figure rather
than through it.

Dead streak still means dead: gear goes dull, aura gone, figure dim.

## Where the avatar appears

- **Quest tab hero** — the main one, largest.
- **Shareable hunter card** — replaces the weapon there too. This makes the card
  much stronger: it's a portrait now.
- **Onboarding class picker** — preview the character in that class's gear
  rather than just the weapon, so people can see what they're choosing.
- **Level-up** — on a rank-up specifically, the gear change should be visible in
  the moment. That's the payoff.

## Rank-up gear reveal

When a rank-up changes the gear tier, the level-up sequence should show it: the
figure in the new set, after the burst. Keep it short — it's a beat inside the
existing animation, not a new screen.

## Constraints

Single file, no build, no dependencies. Gear pieces will add markup — keep paths
tight, compose rather than duplicating, and flag it if the file crosses ~250KB
rather than deciding to split.

No changes to XP, gold, rank thresholds, or the PR tests. This is entirely
visual.

Migrate nothing unless you add a saved field — gear is derived from rank and
class, both of which are already stored.

## Testing

Script: the avatar renders for every class × rank combination without throwing,
all geometry finite and in-box, no missing gear piece for any combination.

Then: render all thirty-six combinations to a contact sheet the user can look at
in one screenshot, and tell them which ones you think are weakest. Do not use
the Chrome automation tool.

Be honest in your report about which class silhouettes actually read as distinct
and which are the same figure with different-coloured rectangles. This is an
illustration job as much as a code job, and a mediocre character at hero size is
worse than the weapon it replaced.

## Git

Commit before starting. Separate commits for the rig work, the gear pieces, and
the integration points. Don't push until the user has seen the contact sheet.
