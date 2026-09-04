# Mission: character customization for Ascendant

## Context

`index.html` in this repo is a complete single-file RPG workout app. Everything
is inline — HTML, CSS, JS. No build step, no dependencies, no npm. It deploys by
pushing to `main`; Vercel serves the file as-is.

Read `CLAUDE.md` first. It documents the constraints that are easy to violate:
the storage key, the 22-number pose format, the safe-area padding, the storage
shim. Then read `index.html` end to end before changing anything. It is roughly
2,000 lines and the sections are marked with comment banners.

Right now every user gets the same visual identity: a crimson longsword with
magenta mana. Friends are sharing this app with each other, and not everyone
wants my flavor.

## Goal

Let each user choose their own class, weapon, and color scheme at character
creation, and change it later. Their choice should change how the app *looks*
throughout — hero, aura, level-up, figures, the shareable card — without
changing any of the numbers.

## The hard rule: cosmetics only

**Customization must never touch progression.** Stats (STR/END/VIT/AGI/CORE),
rank thresholds, the XP curve, gold rates, quest generation, and the three PR
tests stay identical for every user regardless of what they pick.

The reason: people screenshot the hunter card and compare it in group chats. If
a class gave +10% STR or a cheaper level curve, every card becomes meaningless
and the competitive loop dies. A class may change what things are *called* and
what they *look like*. It may not change what they're worth.

If you find yourself wanting to make a class mechanically distinct, stop and
ask. That is a product decision, not an implementation detail.

## What to build

### 1. Classes

Six. Each is a bundle of: a weapon shape, a default palette, an aura style, a
set of tier names, and its own title list in the vault.

| Class | Weapon | Default palette | Aura style |
|---|---|---|---|
| Bladebound | longsword | crimson | curling tendrils (current behavior) |
| Ronin | katana | ember orange | falling embers / ash drift |
| Warden | greathammer | earthen gold | slow heavy pulse rings |
| Arcanist | staff + orb | violet | orbiting motes and a rotating glyph |
| Stalker | twin daggers | venom green | fast sharp shards, low and quick |
| Ironclad | gauntlets | steel blue | tight body-hugging shimmer, no tendrils |

Aura style is the intensity-driven canvas animation in the hero. Refactor the
current `auraLoop` into a strategy the class selects, so each class draws
differently. Keep them all driven by the same `auraIdx()` intensity value so a
dead streak looks dead in every class.

Each class also renames the aura tiers. Bladebound keeps
Dormant/Stirring/Kindled/Surging/Ascendant. Ronin might use
Cold/Smoldering/Lit/Blazing/Infernal. Write ones that fit each class — five
tiers each, same thresholds.

### 2. Palettes

Eight, independent of class, so a Ronin can run a frost palette if they want.
Crimson, Ember, Frost, Void, Verdant, Radiant (gold), Ashen (near-monochrome),
Abyssal (deep teal).

A palette is the four CSS custom properties already used for theming —
`--crimson`, `--magenta`, `--core`, `--line` — plus the blade fill colors
(`--deepblade`, `--guard`, `--grip`, `--pommel`). The existing `BLADES` object
and `applyBlade()` are the seed of this; generalize them.

Three palettes free at creation. The rest unlock in the vault for gold, which
gives the shop something to sell beyond titles.

### 3. Weapons as SVG

Each weapon is an SVG in the same `120 300` viewBox the current blade uses, so
it drops into the hero, the shareable card, and anywhere else `bladeSVG()` is
called with no layout changes.

Every weapon must use the palette custom properties for its fills rather than
hardcoded hex, so palette switching recolors it automatically. Look at how the
current `bladeSVG()` uses `url(#edge)` and `var(--guard)` and follow that
pattern.

These need to look good, not just be technically correct. The weapon is the
hero of the whole app and the single biggest thing carrying the premium feel.
Budget real effort here. Render each one and look at it before moving on.

### 4. Where the choice happens

- **Onboarding:** add a step between the name and the experience question.
  Class first (with a live preview of the weapon), then palette. The preview
  should render the actual weapon SVG, not a description.
- **The vault:** a "Appearance" section to change class, weapon palette, and
  re-preview. Changing class is free and non-destructive — it must never reset
  progress.

### 5. Persistence

Add `class` and `palette` to the saved state. Bump the storage key to
`asc:hunter:v4` and write a migration: any `v3` save loads with
`class:'bladebound', palette:'crimson'` so existing users see exactly what they
see today and lose nothing. The `v3` → migration path already exists for `v2`;
follow it.

### 6. The shareable card

The card must reflect the user's class, weapon, and palette. Add the class name
under the hunter name. Keep the stat block, rank, PRs, and layout structurally
identical across classes so two cards side by side are still directly
comparable — that is the entire point of the card.

## Constraints

- Single file. No build step, no dependencies, no npm, no external CSS.
- The app runs both standalone and inside a Claude artifact. Both must work.
- Do not rename or reshape saved fields without a migration.
- Do not touch the `EX` array, the pose format, or the figure rig except where
  figure stroke colors need to follow the palette.
- Keep the safe-area padding intact.
- File size matters a little — it is served as one document. Six weapon SVGs
  will add weight; keep them tight, no editor cruft or huge path precision.

## Testing — required, not optional

Do not report this done because the code changed.

1. Open the file in a browser. Walk the full onboarding as a new user for at
   least three different classes and confirm the weapon preview, hero, aura,
   and level-up all use the right assets.
2. Take a screenshot of each of the six classes at the hero and compare them.
   If two classes look nearly identical, the work isn't finished.
3. Trigger a level up on at least two classes and watch the whole animation.
4. Generate the shareable card on two different classes and confirm they're
   still visually comparable.
5. Verify a `v3` save migrates cleanly: seed one in localStorage, load the app,
   confirm level, gold, streak, records and owned items all survive and the
   user appears as Bladebound/crimson.
6. Check a narrow mobile viewport, not just desktop.
7. Confirm every pose still renders — a malformed pose fails silently.

## Git

Commit before you start. Small commits as you go. Do not force-push or rewrite
history. Push to `main` when the testing above actually passes; Vercel deploys
automatically.

## What to ask about rather than decide

- Any change that would affect stats, XP, gold rates, or rank thresholds.
- Adding a seventh class or dropping one of the six.
- Anything that would require a build step or a dependency.
- Any change to how saved data is shaped beyond the documented migration.

Everything else — naming, SVG construction, how you structure the aura
strategies, CSS organization — use your judgment.
